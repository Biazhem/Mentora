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
import { ArrowLeft, Mic, MicOff, PhoneOff, Users, Sparkles } from "lucide-react";
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
  const [isMuted, setIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [speakingIds, setSpeakingIds] = useState(new Set());
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const peerConnections = useRef({});
  const iceCandidateQueues = useRef({});
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

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserNodesRef.current[peerSocketId] = analyser;

      const gain = ctx.createGain();
      gain.gain.value = REMOTE_GAIN;
      source.connect(gain);
      gainNodesRef.current[peerSocketId] = gain;

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

  useEffect(() => {
    Object.entries(remoteStreams).forEach(([peerSocketId, stream]) => {
      const el = audioElementsRef.current[peerSocketId];
      if (el && stream && el.srcObject !== stream) {
        el.srcObject = stream;
        el.play().catch(() => {});
      }
    });
  }, [remoteStreams]);

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase
      .from("meeting_participants")
      .select("joined_at, left_at, user_id, users(name, pic)")
      .eq("meeting_id", id)
      .order("joined_at", { ascending: true });
    if (data) setParticipants(data);
  }, [id]);

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

  const processIceQueue = async (peerSocketId) => {
    const pc = peerConnections.current[peerSocketId];
    const queue = iceCandidateQueues.current[peerSocketId] || [];
    if (!pc || !pc.remoteDescription) return;

    while (queue.length > 0) {
      const candidate = queue.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error flushing ICE candidate queue:", err);
      }
    }
  };

  const createPeerConnection = useCallback((peerSocketId) => {
    if (peerConnections.current[peerSocketId]) return peerConnections.current[peerSocketId];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[peerSocketId] = pc;
    iceCandidateQueues.current[peerSocketId] = [];

    const stream = localStreamRef.current;
    if (stream) addAudioTracksToPC(pc, stream);

    pc.ontrack = (event) => {
      if (event.streams && event.streams.length > 0) {
        const remoteStream = event.streams[0];
        setRemoteStreams((prev) => ({ ...prev, [peerSocketId]: remoteStream }));
        startSpeakingDetection(peerSocketId, remoteStream);
        socketRef.current?.emit("peer-connected", { meetingId: id, peerSocketId });
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
      if (pc.connectionState === "connected") {
        socketRef.current?.emit("peer-connected", { meetingId: id, peerSocketId });
      } else if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        socketRef.current?.emit("peer-disconnected", { meetingId: id, peerSocketId });
        delete peerConnections.current[peerSocketId];
        delete iceCandidateQueues.current[peerSocketId];
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

  useEffect(() => {
    if (!meeting || meeting.status !== "active" || accessDenied || !currentUser) return;

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-meeting", {
        meetingId: id,
        user: { id: currentUser.id, name: currentUser.name, pic: currentUser.pic },
      });
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
          connected: sp.connected,
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
        await processIceQueue(data.from);

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
          await processIceQueue(data.from);
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
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            if (!iceCandidateQueues.current[data.from]) {
              iceCandidateQueues.current[data.from] = [];
            }
            iceCandidateQueues.current[data.from].push(data.candidate);
          }
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
      iceCandidateQueues.current = {};
      Object.keys(animFrameRefs.current).forEach(stopSpeakingDetection);
      setRemoteStreams({});
      setSpeakingIds(new Set());
      setMeeting((prev) => prev ? { ...prev, status: "ended" } : prev);
    });

    socket.on("transcript-update", (data) => {
      const { entry } = data;
      if (entry?.name && entry?.say) {
        setTranscript((prev) => {
          const isDuplicate = prev.some((t) => t.name === entry.name && t.say === entry.say);
          if (isDuplicate) return prev;
          return [...prev, entry];
        });
      }
    });

    return () => {
      socket.emit("leave-meeting", { meetingId: id });
      Object.values(peerConnections.current).forEach((pc) => { try { pc.close(); } catch (_) {} });
      peerConnections.current = {};
      iceCandidateQueues.current = {};
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

  useEffect(() => {
    if (!localStreamRef.current || !socketRef.current?.connected || !currentUser) return;
    if (callInitiatedRef.current) return;

    const others = participants.filter((p) => (p.user_id || p.id) !== currentUser.id && p.socketId);
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

  // ── Speech-To-Text (STT) Setup ──────────────────────────────────────────

  const sttRestartTimerRef = useRef(null);
  const sttLastEndRef = useRef(0);
  const meetingIdRef = useRef(id);
  const currentUserRef = useRef(currentUser);
  useEffect(() => { meetingIdRef.current = id; }, [id]);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const addTranscriptEntry = useCallback((entry) => {
    if (!entry?.name || !entry?.say) return;
    setTranscript((prev) => {
      const isDuplicate = prev.some((t) => t.name === entry.name && t.say === entry.say);
      if (isDuplicate) return prev;
      return [...prev, entry];
    });
  }, []);

  const initializeSTT = useCallback(() => {
    if (typeof window === "undefined" || recognitionRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      sttRunningRef.current = true;
      sttLastEndRef.current = 0;
    };

    recognition.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const result = event.results[lastIndex];
      if (!result.isFinal) return;

      const text = result[0].transcript.trim();
      if (!text) return;

      const userName = currentUserRef.current?.name || "Unknown";
      const entry = { name: userName, say: text, timestamp: new Date().toISOString() };

      // 1) Add to local transcript immediately (shows in UI for this user)
      addTranscriptEntry(entry);

      // 2) Send to server (stores in memory + broadcasts to other users)
      const mid = meetingIdRef.current;
      if (socketRef.current?.connected && mid) {
        socketRef.current.emit("transcript-update", { meetingId: mid, entry });
      }
    };

    recognition.onerror = (e) => {
      console.warn("STT Error:", e.error);
      sttRunningRef.current = false;
      if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "network") {
        sttLastEndRef.current = Infinity;
      }
    };

    recognition.onend = () => {
      sttRunningRef.current = false;
      sttLastEndRef.current = Date.now();
      if (sttRestartTimerRef.current) clearTimeout(sttRestartTimerRef.current);
      sttRestartTimerRef.current = setTimeout(() => {
        if (recognitionRef.current && !sttRunningRef.current) {
          try { recognitionRef.current.start(); } catch (_) {}
        }
      }, 2000);
    };

    recognitionRef.current = recognition;
  }, [addTranscriptEntry]);

  useEffect(() => {
    if (!meeting || meeting.status !== "active" || !currentUser) return;

    if (!recognitionRef.current) initializeSTT();

    if (recognitionRef.current && !sttRunningRef.current) {
      const elapsed = sttLastEndRef.current ? Date.now() - sttLastEndRef.current : Infinity;
      if (elapsed >= 2000) {
        try { recognitionRef.current.start(); } catch (_) {}
      }
    }

    return () => {
      if (sttRestartTimerRef.current) clearTimeout(sttRestartTimerRef.current);
      sttRunningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
  }, [meeting?.status, currentUser, id, initializeSTT]);

  const endMeeting = async () => {
    if (!isHost && !isAdmin) return;
    setEnding(true);
    try {
      socketRef.current?.emit("end-meeting", { meetingId: id });
      await supabase.from("meetings").update({ status: "ended" }).eq("id", id);
      setMeeting((prev) => prev ? { ...prev, status: "ended" } : prev);
    } catch (err) {
      console.error("End meeting error:", err);
    } finally {
      setEnding(false);
    }
  };

  const leaveMeeting = () => {
    socketRef.current?.emit("leave-meeting", { meetingId: id });
    router.push("/dashboard");
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
      if (!res.ok) throw new Error(data.error || "Failed to generate summary");

      const summaryText = data.summary || "";
      await supabase.from("meetings").update({ summery: summaryText }).eq("id", id);
      setMeeting((prev) => prev ? { ...prev, summery: summaryText } : prev);
    } catch (err) {
      console.error("Summary error:", err);
      setCallError(`Summary generation failed: ${err.message}`);
    } finally {
      setGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-default border-t-accent" />
          <p className="text-sm text-muted">Loading meeting room...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <Card className="max-w-md w-full">
          <Card.Content className="p-6 space-y-4">
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Access Denied</Alert.Title>
                <Alert.Description>You do not have permission to access this meeting.</Alert.Description>
              </Alert.Content>
            </Alert>
            <Button as={Link} href="/dashboard" variant="secondary" className="w-full">
              Return to Dashboard
            </Button>
          </Card.Content>
        </Card>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-6">
        <Card className="max-w-md w-full">
          <Card.Content className="p-6 space-y-4">
            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Meeting Not Found</Alert.Title>
                <Alert.Description>This meeting does not exist or has been deleted.</Alert.Description>
              </Alert.Content>
            </Alert>
            <Button as={Link} href="/dashboard" variant="secondary" className="w-full">
              Return to Dashboard
            </Button>
          </Card.Content>
        </Card>
      </div>
    );
  }

  const activeParticipants = participants.filter((p) => !p.left_at);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-default px-4 py-3">
        <div className="flex items-center gap-3">
          <Button as={Link} href="/discussion/meetings" isIconOnly variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-base font-semibold">{meeting.title || "Untitled Meeting"}</h1>
            <p className="text-xs text-muted">{meeting.organizations?.org_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip color="success" size="sm">{meeting.status}</Chip>
          {(isHost || isAdmin) && meeting.status === "active" && (
            <Button variant="danger" size="sm" isPending={ending} onPress={endMeeting}>
              End Meeting
            </Button>
          )}
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {callError && (
        <div className="px-4 pt-3">
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{callError}</Alert.Description>
            </Alert.Content>
          </Alert>
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Participants Grid */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {activeParticipants.map((p) => {
              const pid = p.user_id || p.id;
              const isSpeaking = speakingIds.has(p.socketId) || speakingIds.has(`remote-${p.socketId}`);
              const isLocal = pid === currentUser?.id;
              return (
                <Card
                  key={pid}
                  className={`relative overflow-visible ${isSpeaking ? "ring-2 ring-success shadow-lg shadow-success/10" : ""}`}
                  variant="secondary"
                >
                  <Card.Content className="flex flex-col items-center gap-2 p-4">
                    <div className="relative">
                      <Avatar size="lg">
                        {p.users?.pic ? <Avatar.Image src={p.users.pic} alt={p.users.name} /> : null}
                        <Avatar.Fallback>{p.users?.name?.charAt(0) || "?"}</Avatar.Fallback>
                      </Avatar>
                      {isSpeaking && (
                        <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-success border-2 border-background animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-center truncate max-w-full">
                      {p.users?.name || "Participant"}
                      {isLocal && <span className="text-muted ml-1">(You)</span>}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {p.isMuted ? (
                        <MicOff className="size-3.5 text-danger" />
                      ) : (
                        <Mic className="size-3.5 text-success" />
                      )}
                      <span className="text-[11px] text-muted">
                        {p.connected === false ? "Connecting..." : p.isMuted ? "Muted" : "In call"}
                      </span>
                    </div>
                    {p.socketId && (
                      <audio
                        ref={(el) => {
                          if (el) audioElementsRef.current[p.socketId] = el;
                        }}
                        autoPlay
                        playsInline
                      />
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </div>

          {/* Controls — only show when meeting is active */}
          {meeting.status === "active" && (
            <div className="flex justify-center mt-auto pt-2">
              <ButtonGroup>
                <Button
                  isIconOnly
                  variant={isMuted ? "danger" : "outline"}
                  size="lg"
                  onPress={toggleMic}
                >
                  {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                </Button>
                <Button variant="outline" size="lg">
                  <Users className="size-5" />
                  <span className="ml-1">{activeParticipants.length}</span>
                </Button>
                <Button variant="danger" size="lg" onPress={leaveMeeting}>
                  <PhoneOff className="size-5" />
                  <span className="ml-1">Leave</span>
                </Button>
              </ButtonGroup>
            </div>
          )}
        </div>

        {/* Transcript + Summary Sidebar */}
        <Card className="lg:w-80 xl:w-96 flex flex-col max-h-[600px]">
          <Card.Header className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <Card.Title className="text-sm">Live Transcript</Card.Title>
              <Chip size="sm" color="accent">{transcript.length}</Chip>
            </div>
          </Card.Header>
          <Card.Content className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {transcript.length === 0 ? (
              <p className="text-sm text-muted italic text-center py-8">Waiting for transcript...</p>
            ) : (
              transcript.map((t, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Avatar size="sm" className="mt-0.5 shrink-0">
                    <Avatar.Fallback>{t.name?.charAt(0) || "?"}</Avatar.Fallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-accent">{t.name}</p>
                    <p className="text-sm text-foreground break-words">{t.say}</p>
                  </div>
                </div>
              ))
            )}
          </Card.Content>

          {/* Summary Section */}
          <div className="border-t border-default px-4 py-3">
            {meeting.summery ? (
              <div>
                <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Meeting Summary</p>
                <SummaryMDX source={meeting.summery} />
              </div>
            ) : transcript.length > 0 ? (
              <div className="text-center">
                <p className="text-xs text-muted mb-2">No summary yet</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={handleGenerateSummary}
                  isPending={generatingSummary}
                >
                  <Sparkles className="size-4 mr-1" />
                  {generatingSummary ? "Generating..." : "Generate Summary"}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted text-center">Summary will appear after transcript is available</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}