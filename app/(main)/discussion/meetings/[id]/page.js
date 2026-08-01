"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  Chip,
  Alert,
} from "@heroui/react";
import Link from "next/link";
import { ArrowLeft, Mic, MicOff, PhoneOff, Users } from "lucide-react";
import { io } from "socket.io-client";
import SummaryMDX from "@/components/custom/SummaryMDX";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};
const REMOTE_GAIN = 2.5;
const SPEAKING_THRESHOLD = 8;

function formatSupabaseError(error) {
  if (!error) return "Unknown error";
  return [error.message, error.details, error.hint, error.code].filter(Boolean).join(" ");
}

export default function MeetingPage({ params }) {
  const { id } = use(params);
  const { user } = useUser();
  const router = useRouter();

  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [callError, setCallError] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [speakingIds, setSpeakingIds] = useState(new Set());

  const peerConnections = useRef({});
  const socketRef = useRef(null);
  const joinedRef = useRef(false);
  const localStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const sttRunningRef = useRef(false);
  const audioCtxRef = useRef(null);
  const gainNodesRef = useRef({});
  const analyserNodesRef = useRef({});
  const animFrameRefs = useRef({});
  const callInitiatedRef = useRef(false);
  const audioElementsRef = useRef({});

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // ── Audio helpers ──────────────────────────────────────────────────────────

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const startSpeakingDetection = useCallback((peerSocketId, stream) => {
    if (!stream || !stream.getAudioTracks().length) return;
    try {
      const ctx = ensureAudioContext();
      const source = ctx.createMediaStreamSource(stream);

      // Analyser for speaking detection
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserNodesRef.current[peerSocketId] = analyser;

      // Gain node for boosted volume output
      const gain = ctx.createGain();
      gain.gain.value = REMOTE_GAIN;
      source.connect(gain);
      gainNodesRef.current[peerSocketId] = gain;

      // Connect gain to destination so audio actually plays louder
      gain.connect(ctx.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkLevel = () => {
        if (!analyserNodesRef.current[peerSocketId]) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const isSpeaking = avg > SPEAKING_THRESHOLD;
        setSpeakingIds((prev) => {
          const next = new Set(prev);
          if (isSpeaking) next.add(peerSocketId);
          else next.delete(peerSocketId);
          return next;
        });
        animFrameRefs.current[peerSocketId] = requestAnimationFrame(checkLevel);
      };
      checkLevel();
    } catch (err) {
      console.warn("Speaking detection failed for", peerSocketId, err);
    }
  }, [ensureAudioContext]);

  const stopSpeakingDetection = useCallback((peerSocketId) => {
    if (animFrameRefs.current[peerSocketId]) {
      cancelAnimationFrame(animFrameRefs.current[peerSocketId]);
      delete animFrameRefs.current[peerSocketId];
    }
    if (gainNodesRef.current[peerSocketId]) {
      try { gainNodesRef.current[peerSocketId].disconnect(); } catch (_) {}
      delete gainNodesRef.current[peerSocketId];
    }
    if (analyserNodesRef.current[peerSocketId]) {
      try { analyserNodesRef.current[peerSocketId].disconnect(); } catch (_) {}
      delete analyserNodesRef.current[peerSocketId];
    }
    setSpeakingIds((prev) => {
      const next = new Set(prev);
      next.delete(peerSocketId);
      return next;
    });
  }, []);

  // ── Audio element management (avoid ref callback crashes) ──────────────────

  // When remoteStreams changes, attach streams to existing audio elements
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([peerSocketId, stream]) => {
      const el = audioElementsRef.current[peerSocketId];
      if (el && stream && el.srcObject !== stream) {
        el.srcObject = stream;
        el.play().catch(() => {});
      }
    });
  }, [remoteStreams]);

  // ── Supabase helpers ──────────────────────────────────────────────────────

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase
      .from("meeting_participants")
      .select("joined_at, left_at, user_id, users(name, pic)")
      .eq("meeting_id", id)
      .order("joined_at", { ascending: true });
    if (data) setParticipants(data);
  }, [id]);

  // ── Mic / stream helpers ──────────────────────────────────────────────────

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
        video: false,
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Error getting local stream:", err);
      setCallError(`Cannot access microphone: ${err.message}`);
      throw err;
    }
  };

  const toggleMic = async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      await getLocalStream();
      setIsMuted(false);
      return;
    }
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
      socketRef.current?.emit("toggle-mute", { meetingId: id });
    }
  };

  const addAudioTracksToPC = (pc, stream) => {
    if (!pc || !stream) return;
    stream.getAudioTracks().forEach((track) => {
      const already = pc.getSenders().some((s) => s.track && s.track.id === track.id);
      if (!already) {
        try { pc.addTrack(track, stream); } catch (err) { console.warn("addTrack skipped:", err); }
      }
    });
  };

  // ── Peer connection ───────────────────────────────────────────────────────

  const createPeerConnection = useCallback((peerSocketId) => {
    if (peerConnections.current[peerSocketId]) return peerConnections.current[peerSocketId];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[peerSocketId] = pc;

    const stream = localStreamRef.current;
    if (stream) addAudioTracksToPC(pc, stream);

    pc.ontrack = (event) => {
      if (event.streams && event.streams.length > 0) {
        const remoteStream = event.streams[0];
        setRemoteStreams((prev) => ({ ...prev, [peerSocketId]: remoteStream }));
        startSpeakingDetection(peerSocketId, remoteStream);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          meetingId: id,
          candidate: event.candidate,
          to: peerSocketId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        delete peerConnections.current[peerSocketId];
        stopSpeakingDetection(peerSocketId);
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[peerSocketId];
          return next;
        });
      }
    };

    return pc;
  }, [id, startSpeakingDetection, stopSpeakingDetection]);

  // ── Supabase join ─────────────────────────────────────────────────────────

  const joinMeeting = async (userData) => {
    if (!userData) return;
    try {
      const { error } = await supabase.from("meeting_participants").upsert({
        meeting_id: id,
        user_id: userData.id,
        joined_at: new Date().toISOString(),
        left_at: null,
      }, { onConflict: "meeting_id,user_id", ignoreDuplicates: false });
      if (error) throw error;
      await fetchParticipants();
    } catch (err) {
      setCallError(`Could not join: ${formatSupabaseError(err)}`);
    }
  };

  // ── Init: fetch meeting + user ────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!user) return;
      setLoading(true);
      try {
        const { data: meetingData } = await supabase
          .from("meetings")
          .select("*, organizations(org_name)")
          .eq("id", id)
          .single();

        if (!meetingData) { setLoading(false); return; }

        const { data: userData } = await supabase
          .from("users")
          .select("id, name, pic")
          .eq("clerk_id", user.id)
          .single();

        if (!userData) { setAccessDenied(true); setLoading(false); return; }

        const { data: memberData } = await supabase
          .from("organization_members")
          .select("role")
          .eq("organization_id", meetingData.org_id)
          .eq("user_id", userData.id)
          .maybeSingle();

        if (!memberData) { setAccessDenied(true); setLoading(false); return; }
        if (cancelled) return;

        setAccessDenied(false);
        setCurrentUser(userData);
        setMeeting(meetingData);
        setTranscript(Array.isArray(meetingData.transcript) ? meetingData.transcript : []);
        setSummary(meetingData.summery || "");
        setIsHost(meetingData.host_id === userData.id);
        setIsAdmin(memberData.role === "admin");
        await fetchParticipants();
        if (meetingData.status === "active" && !joinedRef.current) {
          joinedRef.current = true;
          await joinMeeting(userData);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [fetchParticipants, id, user]);

  // ── Supabase realtime ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!meeting?.id || accessDenied) return;

    const channel = supabase
      .channel(`meeting-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings", filter: `id=eq.${id}` }, (payload) => {
        if (payload.eventType === "DELETE") { setMeeting(null); return; }
        setMeeting((prev) => ({ ...prev, ...payload.new }));
        setTranscript(Array.isArray(payload.new.transcript) ? payload.new.transcript : []);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "meeting_participants", filter: `meeting_id=eq.${id}` }, () => { fetchParticipants(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [accessDenied, fetchParticipants, id, meeting?.id]);

  // ── Socket.io ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!meeting || meeting.status !== "active" || accessDenied || !currentUser) return;

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-meeting", {
        meetingId: id,
        user: { id: currentUser.id, name: currentUser.name, pic: currentUser.pic },
      });
      if (!localStreamRef.current) {
        getLocalStream().catch(err => console.error("Failed to get audio stream:", err));
      }
    });

    socket.on("connect_error", (error) => {
      setCallError(`Connection error: ${error.message}`);
    });

    socket.on("participants-update", (socketParticipants) => {
      setParticipants((prev) => {
        const supabaseOnly = prev.filter((sp) => sp.user_id && !sp.socketId);
        const fromSocket = socketParticipants.map((sp) => ({
          user_id: sp.id,
          users: { name: sp.name, pic: sp.pic },
          socketId: sp.socketId,
          isMuted: sp.isMuted,
          isVideoOff: sp.isVideoOff,
          joined_at: sp.joined_at || new Date().toISOString(),
          left_at: null,
        }));
        const seen = new Set();
        const merged = [];
        for (const p of [...fromSocket, ...supabaseOnly]) {
          const uid = p.user_id || p.id;
          if (uid && !seen.has(uid)) {
            seen.add(uid);
            merged.push(p);
          }
        }
        return merged;
      });
    });

    socket.on("offer", async (data) => {
      if (data.from === socket.id) return;
      try {
        const pc = createPeerConnection(data.from);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { meetingId: id, answer, to: data.from });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socket.on("answer", async (data) => {
      if (data.from === socket.id) return;
      try {
        const pc = peerConnections.current[data.from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    socket.on("ice-candidate", async (data) => {
      if (data.from === socket.id) return;
      try {
        const pc = peerConnections.current[data.from];
        if (pc && data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    socket.on("meeting-ended", () => {
      const stream = localStreamRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      Object.values(peerConnections.current).forEach((pc) => { try { pc.close(); } catch (_) {} });
      peerConnections.current = {};
      Object.keys(animFrameRefs.current).forEach(stopSpeakingDetection);
      setRemoteStreams({});
      setSpeakingIds(new Set());
      setMeeting((prev) => prev ? { ...prev, status: "ended" } : prev);
    });

    socket.on("transcript-update", (data) => {
      const { entry } = data;
      if (entry && entry.name && entry.say) {
        setTranscript((prev) => {
          const isDuplicate = prev.some(
            (t) => t.name === entry.name && t.say === entry.say
          );
          if (isDuplicate) return prev;
          return [...prev, entry];
        });
      }
    });

    socket.on("audio-level", (data) => {
      const { socketId, level } = data;
      setSpeakingIds((prev) => {
        const next = new Set(prev);
        if (level > SPEAKING_THRESHOLD) next.add(`remote-${socketId}`);
        else next.delete(`remote-${socketId}`);
        return next;
      });
    });

    return () => {
      socket.emit("leave-meeting", { meetingId: id });
      Object.values(peerConnections.current).forEach((pc) => { try { pc.close(); } catch (_) {} });
      peerConnections.current = {};
      Object.keys(animFrameRefs.current).forEach(stopSpeakingDetection);
      Object.values(gainNodesRef.current).forEach((g) => { try { g.disconnect(); } catch (_) {} });
      Object.values(analyserNodesRef.current).forEach((a) => { try { a.disconnect(); } catch (_) {} });
      gainNodesRef.current = {};
      analyserNodesRef.current = {};
      setRemoteStreams({});
      setSpeakingIds(new Set());
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      socket.disconnect();
    };
  }, [meeting?.id, meeting?.status, accessDenied, currentUser, id, createPeerConnection, stopSpeakingDetection]);

  // ── Auto-initiate call ────────────────────────────────────────────────────

  useEffect(() => {
    if (!localStreamRef.current || !socketRef.current?.connected || !currentUser) return;
    if (callInitiatedRef.current) return;

    const others = participants.filter(
      (p) => (p.user_id || p.id) !== currentUser.id && p.socketId
    );
    if (others.length === 0) return;

    callInitiatedRef.current = true;

    const timer = setTimeout(() => {
      for (const p of others) {
        const peerSocketId = p.socketId;
        if (!peerSocketId || peerConnections.current[peerSocketId]) continue;

        try {
          const pc = createPeerConnection(peerSocketId);
          if (localStreamRef.current) addAudioTracksToPC(pc, localStreamRef.current);

          pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              socketRef.current?.emit("offer", {
                meetingId: id,
                offer: pc.localDescription,
                to: peerSocketId,
              });
            })
            .catch((err) => console.error("Auto-offer error:", err));
        } catch (err) {
          console.error("Error initiating connection:", err);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [participants, currentUser, id, createPeerConnection]);

  // ── Start call (manual) ───────────────────────────────────────────────────

  const startCall = async () => {
    if (!currentUser || !socketRef.current) return;

    try {
      ensureAudioContext();

      let stream = localStreamRef.current;
      if (!stream) {
        stream = await getLocalStream();
      }

      const others = participants.filter(
        (p) => (p.user_id || p.id) !== currentUser.id && p.socketId
      );
      for (const p of others) {
        const peerSocketId = p.socketId;
        if (!peerSocketId || peerConnections.current[peerSocketId]) continue;

        const pc = createPeerConnection(peerSocketId);
        if (stream) addAudioTracksToPC(pc, stream);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current.emit("offer", {
          meetingId: id,
          offer,
          to: peerSocketId,
        });
      }
    } catch (err) {
      console.error("Error starting call:", err);
      setCallError(`Failed to start call: ${err.message}`);
    }
  };

  // ── STT ───────────────────────────────────────────────────────────────────

  const initializeSTT = useCallback(() => {
    if (typeof window === "undefined" || recognitionRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => { sttRunningRef.current = true; };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }

      if (finalTranscript.trim()) {
        const newEntry = {
          name: currentUser?.name || "Unknown",
          say: finalTranscript.trim(),
          timestamp: new Date().toISOString(),
        };

        setTranscript((prev) => [...prev, newEntry]);

        if (socketRef.current?.connected) {
          socketRef.current.emit("transcript-update", {
            meetingId: id,
            entry: newEntry,
          });
        }
      }
    };

    recognition.onerror = (event) => {
      console.warn("STT error:", event.error);
      sttRunningRef.current = false;
    };
    recognition.onend = () => { sttRunningRef.current = false; };
    recognitionRef.current = recognition;
  }, [currentUser, id]);

  useEffect(() => {
    if (!meeting || meeting.status !== "active" || !currentUser || !localStream) return;

    const audioTracks = localStream.getAudioTracks();
    const hasAudio = audioTracks.length > 0 && audioTracks[0].enabled;

    if (hasAudio && !isMuted) {
      if (!recognitionRef.current) initializeSTT();
      if (recognitionRef.current && !sttRunningRef.current) {
        try { recognitionRef.current.start(); } catch (_) {}
      }
    } else {
      if (recognitionRef.current && sttRunningRef.current) {
        try { recognitionRef.current.stop(); sttRunningRef.current = false; } catch (_) {}
      }
    }

    return () => {
      if (recognitionRef.current && sttRunningRef.current) {
        try { recognitionRef.current.stop(); sttRunningRef.current = false; } catch (_) {}
      }
    };
  }, [meeting?.status, currentUser, localStream, isMuted, initializeSTT]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleToggleMic = async () => { await toggleMic(); };

  const handleSaveTitle = async () => {
    if (!newTitle.trim() || newTitle === meeting.title) {
      setEditingTitle(false);
      return;
    }
    const { error } = await supabase
      .from("meetings")
      .update({ title: newTitle.trim() })
      .eq("id", id);
    if (!error) {
      setMeeting((prev) => prev ? { ...prev, title: newTitle.trim() } : prev);
    }
    setEditingTitle(false);
  };

  const handleGenerateSummary = async () => {
    if (!transcript || transcript.length === 0) return;
    setGeneratingSummary(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, meetingId: id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary);
      await supabase.from("meetings").update({ summery: data.summary }).eq("id", id);
    } catch (err) {
      console.error("Summary error:", err);
      setCallError(`Failed to generate summary: ${err.message}`);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleStartCall = async () => {
    try {
      await startCall();
    } catch (err) {
      console.error("Error starting call:", err);
      setCallError(`Failed to start call: ${err.message}`);
    }
  };

  const handleEndMeeting = async () => {
    setEnding(true);
    const endedAt = new Date().toISOString();
    try {
      if (recognitionRef.current && sttRunningRef.current) {
        recognitionRef.current.stop();
        sttRunningRef.current = false;
      }
      const stream = localStreamRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      Object.values(peerConnections.current).forEach((pc) => { try { pc.close(); } catch (_) {} });
      peerConnections.current = {};
      Object.keys(animFrameRefs.current).forEach(stopSpeakingDetection);
      setRemoteStreams({});
      setSpeakingIds(new Set());

      socketRef.current?.emit("end-meeting", { meetingId: id });

      await supabase.from("meetings").update({ status: "ended", ended_at: endedAt }).eq("id", id);
      await supabase.from("meeting_participants").update({ left_at: endedAt }).eq("meeting_id", id).is("left_at", null);
    } catch (err) {
      console.error("End meeting error:", err);
    } finally {
      setEnding(false);
      setMeeting((prev) => prev ? { ...prev, status: "ended", ended_at: endedAt } : prev);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!confirm("Delete this meeting? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await supabase.from("meeting_participants").delete().eq("meeting_id", id);
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
      router.push("/discussion/meetings");
    } catch (err) {
      console.error("Delete meeting error:", err);
      setCallError(`Could not delete meeting: ${formatSupabaseError(err)}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleLeaveMeeting = () => {
    if (recognitionRef.current && sttRunningRef.current) {
      recognitionRef.current.stop();
      sttRunningRef.current = false;
    }
    const stream = localStreamRef.current;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    Object.values(peerConnections.current).forEach((pc) => { try { pc.close(); } catch (_) {} });
    peerConnections.current = {};
    Object.keys(animFrameRefs.current).forEach(stopSpeakingDetection);
    socketRef.current?.emit("leave-meeting", { meetingId: id });
    router.push("/discussion/meetings");
  };

  // ── Loading / Error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="py-12 px-4 animate-pulse space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-accent-soft-hover rounded" />
        <div className="h-32 bg-accent-soft-hover rounded-xl" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container py-10">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Meeting unavailable</Alert.Title>
            <Alert.Description>You must be a member of this organization to view or join.</Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
    );
  }

  if (!meeting) return <p className="p-6 text-center">Meeting not found</p>;

  // ── Ended meeting view ────────────────────────────────────────────────────

  if (meeting.status !== "active") {
    const startedAt = meeting.started_at ? new Date(meeting.started_at) : null;
    const endedAt = meeting.ended_at ? new Date(meeting.ended_at) : null;
    const duration = startedAt && endedAt ? `${Math.round((endedAt - startedAt) / 60000)} min` : "N/A";

    return (
      <div className="py-12 px-4 max-w-3xl mx-auto space-y-6">
        <Link href="/discussion/meetings" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to Meetings
        </Link>
        <Card className="p-6">
          {editingTitle ? (
            <div className="flex items-center gap-2 mb-2">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                onBlur={handleSaveTitle}
                className="text-2xl font-bold bg-background border border-default rounded px-2 py-1 outline-none flex-1"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{meeting.title}</h1>
              {(isHost || isAdmin) && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setNewTitle(meeting.title); setEditingTitle(true); }}
                    className="text-xs text-muted hover:text-foreground"
                  >Edit</button>
                  <Button variant="danger" size="sm" onPress={handleDeleteMeeting} isPending={deleting} className="ml-2">Delete</Button>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2 mb-4">
            <Chip color="default">{meeting.status || "Ended"}</Chip>
            <Chip>{meeting.organizations?.org_name || "Organization"}</Chip>
            <Chip variant="secondary">{duration}</Chip>
          </div>
          <div className="flex gap-4 text-sm text-muted">
            {startedAt && <p>Started: {startedAt.toLocaleString()}</p>}
            {endedAt && <p>Ended: {endedAt.toLocaleString()}</p>}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-3">Participants ({participants.length})</h2>
          <div className="flex flex-wrap gap-3">
            {participants.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Avatar size="sm">
                  {p.users?.pic ? <Avatar.Image src={p.users.pic} alt={p.users.name} /> : null}
                  <Avatar.Fallback>{p.users?.name?.charAt(0) || "?"}</Avatar.Fallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{p.users?.name || "Unknown"}</p>
                  <p className="text-xs text-muted">
                    {p.joined_at ? new Date(p.joined_at).toLocaleTimeString() : ""}
                    {p.left_at ? ` - ${new Date(p.left_at).toLocaleTimeString()}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        {transcript.length > 0 ? (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-3">Transcript</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transcript.map((entry, idx) => (
                <div key={idx} className="flex gap-3">
                  <Avatar size="sm"><Avatar.Fallback>{entry.name?.charAt(0) || "?"}</Avatar.Fallback></Avatar>
                  <div>
                    <p className="text-sm font-medium">{entry.name}</p>
                    <p className="text-sm text-foreground">{entry.say}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-3">Transcript</h2>
            <p className="text-muted text-sm">No transcript available.</p>
          </Card>
        )}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-3">Summary</h2>
          {summary ? (
            <SummaryMDX source={summary} />
          ) : transcript.length > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-muted text-sm">No summary yet.</p>
              <Button variant="secondary" onPress={handleGenerateSummary} isPending={generatingSummary}>
                Generate Summary
              </Button>
            </div>
          ) : (
            <p className="text-muted text-sm">No transcript to summarize.</p>
          )}
        </Card>
      </div>
    );
  }

  // ── Active meeting view ───────────────────────────────────────────────────

  const activeParticipants = participants.filter((p) => !p.left_at);
  const participantName = (p) => p?.users?.name || p?.name || "Unknown";
  const participantPic = (p) => p?.users?.pic || p?.pic;
  const participantId = (p) => p?.user_id || p?.id;

  return (
    <div className="flex h-full flex-col bg-background-secondary">
      {/* Top bar */}
      <div className="flex items-center justify-between p-2">
        <Link href="/discussion/meetings" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> Back
        </Link>
        {editingTitle ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
              onBlur={handleSaveTitle}
              className="text-sm font-medium bg-background border border-default rounded px-2 py-1 outline-none"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{meeting.title}</p>
            {(isHost || isAdmin) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setNewTitle(meeting.title); setEditingTitle(true); }}
                  className="text-xs text-muted hover:text-foreground"
                >Edit</button>
                <Button variant="danger" size="sm" onPress={handleDeleteMeeting} isPending={deleting} className="ml-2">Delete</Button>
              </div>
            )}
            <Chip color="success">Live</Chip>
          </div>
        )}
      </div>

      {/* Participant avatars row */}
      <div className="flex gap-2 overflow-x-auto p-2">
        {/* Local user card */}
        {currentUser && (
          <Card className={`min-w-[160px] border-2 ${speakingIds.has(currentUser.id) ? "border-success" : "border-default"} text-center`}>
            <Card.Content className="p-3">
              <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-default-100">
                <Avatar size="lg">
                  {currentUser.pic ? <Avatar.Image src={currentUser.pic} alt={currentUser.name} /> : null}
                  <Avatar.Fallback>{currentUser.name?.charAt(0) || "Y"}</Avatar.Fallback>
                </Avatar>
              </div>
              <p className="text-xs font-medium">{currentUser.name || "You"}</p>
              <p className="text-[10px] text-muted">{isMuted ? "Muted" : "Mic on"}</p>
            </Card.Content>
          </Card>
        )}

        {/* Remote streams with audio */}
        {Object.entries(remoteStreams).map(([peerSocketId, stream]) => {
          const participant = participants.find((p) => p.socketId === peerSocketId);
          const isSpeaking = speakingIds.has(peerSocketId) || speakingIds.has(`remote-${peerSocketId}`);
          return (
            <Card key={peerSocketId} className={`min-w-[160px] border-2 text-center ${isSpeaking ? "border-success" : "border-default"}`}>
              <Card.Content className="p-3">
                <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-default-100">
                  <audio
                    ref={(el) => {
                      if (el) {
                        audioElementsRef.current[peerSocketId] = el;
                        if (stream && el.srcObject !== stream) {
                          el.srcObject = stream;
                          el.play().catch(() => {});
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                  />
                  <Avatar size="lg">
                    {participantPic(participant) ? <Avatar.Image src={participantPic(participant)} alt={participantName(participant)} /> : null}
                    <Avatar.Fallback>{participantName(participant).charAt(0)}</Avatar.Fallback>
                  </Avatar>
                </div>
                <p className="text-xs font-medium">{participantName(participant)}</p>
                <p className="text-[10px] text-muted">{isSpeaking ? "Speaking" : "In call"}</p>
              </Card.Content>
            </Card>
          );
        })}

        {/* Participants waiting to connect */}
        {activeParticipants
          .filter((p) => participantId(p) !== currentUser?.id && p.socketId && !remoteStreams[p.socketId])
          .map((p, idx) => (
            <Card key={idx} className="min-w-[120px] border-2 border-default text-center">
              <Card.Content className="p-3">
                <div className="mb-2 flex h-12 w-full items-center justify-center rounded-md bg-default-100">
                  <Avatar size="sm">
                    {participantPic(p) ? <Avatar.Image src={participantPic(p)} alt={participantName(p)} /> : null}
                    <Avatar.Fallback>{participantName(p).charAt(0)}</Avatar.Fallback>
                  </Avatar>
                </div>
                <p className="text-xs font-medium">{participantName(p)}</p>
                <p className="text-[10px] text-muted">Connecting...</p>
              </Card.Content>
            </Card>
          ))}
      </div>

      {/* Center content */}
      <div className="flex flex-1 items-center justify-center p-3">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-background shadow">
          <Mic size={40} />
          <p className="text-lg font-semibold">{meeting.title}</p>
          <p className="text-sm text-muted">{activeParticipants.length} participant{activeParticipants.length !== 1 ? "s" : ""}</p>
          {!localStream && <Button onPress={handleStartCall} variant="primary" className="mt-2">Join Call</Button>}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex justify-center gap-4 bg-background p-4 shadow">
        <ButtonGroup>
          <Button isIconOnly variant={isMuted ? "danger" : "outline"} size="lg" onPress={handleToggleMic}>
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button variant="outline" size="lg" isIconOnly={false}>
            <Users /> {activeParticipants.length}
          </Button>
          {isHost ? (
            <Button variant="danger" size="lg" onPress={handleEndMeeting} isPending={ending}>
              <PhoneOff /> End Meeting
            </Button>
          ) : (
            <Button variant="danger" size="lg" onPress={handleLeaveMeeting}>Leave</Button>
          )}
        </ButtonGroup>
        {callError && (
          <Alert status="warning" className="mt-2">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{callError}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}
      </div>
    </div>
  );
}
