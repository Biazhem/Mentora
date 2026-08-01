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
import { ArrowLeft, Camera, CameraOff, Mic, MicOff, PhoneOff, Users } from "lucide-react";
import { io } from "socket.io-client";
import SummaryMDX from "@/components/custom/SummaryMDX";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

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
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [speakingIds, setSpeakingIds] = useState(new Set());

  const localVideoRef = useRef(null);
  const peerConnections = useRef({});
  const socketRef = useRef(null);
  const joinedRef = useRef(false);
  const localStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const sttTimeoutRef = useRef(null);
  const sttRunningRef = useRef(false);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  const fetchParticipants = useCallback(async () => {
    const { data } = await supabase
      .from("meeting_participants")
      .select("joined_at, left_at, user_id, users(name, pic)")
      .eq("meeting_id", id)
      .order("joined_at", { ascending: true });
    if (data) setParticipants(data);
  }, [id]);

  const getLocalStream = async (video = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true }, 
        video: video ? { width: { ideal: 640 }, height: { ideal: 480 } } : false 
      });
      setLocalStream(stream);
      setIsVideoOff(!video);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      console.log("Local stream obtained with audio:", stream.getAudioTracks().length > 0, "video:", stream.getVideoTracks().length > 0);
      return stream;
    } catch (err) {
      console.error("Error getting local stream:", err);
      setCallError(`Cannot access media: ${err.message}`);
      throw err;
    }
  };

  const toggleMic = async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      const newStream = await getLocalStream(false);
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

  const toggleVideo = async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      const newStream = await getLocalStream(true);
      if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
      setIsVideoOff(false);
      return;
    }
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
      socketRef.current?.emit("toggle-video", { meetingId: id });
    }
  };

  const createPeerConnection = useCallback((peerSocketId) => {
    if (peerConnections.current[peerSocketId]) return peerConnections.current[peerSocketId];

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[peerSocketId] = pc;

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.ontrack = (event) => {
      console.log("Remote track received from:", peerSocketId, event.track.kind);
      setRemoteStreams((prev) => {
        const updated = { ...prev };
        if (event.streams && event.streams.length > 0) {
          updated[peerSocketId] = event.streams[0];
        }
        return updated;
      });
    };

    pc.ondatachannel = (event) => {
      console.log("Data channel received:", event.channel.label);
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
      console.log("Connection state change:", peerSocketId, pc.connectionState);
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        delete peerConnections.current[peerSocketId];
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[peerSocketId];
          return next;
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", peerSocketId, pc.iceConnectionState);
    };

    return pc;
  }, [id]);

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

  // Init: fetch meeting + user data
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

  // Supabase realtime for meeting status
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

  // Socket.io for WebRTC signaling
  useEffect(() => {
    if (!meeting || meeting.status !== "active" || accessDenied || !currentUser) return;

    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-meeting", {
        meetingId: id,
        user: { id: currentUser.id, name: currentUser.name, pic: currentUser.pic },
      });
      
      // Get local stream on connect
      if (!localStreamRef.current) {
        getLocalStream(false).catch(err => {
          console.error("Failed to get initial stream:", err);
        });
      }
    });

    socket.on("connect_error", (error) => {
      setCallError(`Connection error: ${error.message}`);
    });

    socket.on("participants-update", (socketParticipants) => {
      setParticipants((prev) => {
        const supabaseOnly = prev.filter(
          (sp) => !socketParticipants.some((sp2) => sp2.id === sp.user_id)
        );
        const fromSocket = socketParticipants.map((sp) => ({
          user_id: sp.id,
          users: { name: sp.name, pic: sp.pic },
          socketId: sp.socketId,
          isMuted: sp.isMuted,
          isVideoOff: sp.isVideoOff,
          joined_at: sp.joined_at || new Date().toISOString(),
          left_at: null,
        }));
        const merged = [...supabaseOnly, ...fromSocket];
        
        // Auto-trigger call initiation if we have a local stream and there are new participants
        if (localStreamRef.current && merged.length > 1) {
          setTimeout(() => {
            const others = merged.filter((p) => p.user_id !== currentUser?.id && p.socketId);
            for (const p of others) {
              if (!peerConnections.current[p.socketId] && socketRef.current) {
                try {
                  const pc = createPeerConnection(p.socketId);
                  pc.createOffer().then((offer) => {
                    pc.setLocalDescription(offer);
                    socketRef.current?.emit("offer", {
                      meetingId: id,
                      offer,
                      to: p.socketId,
                    });
                  }).catch(err => console.error("Error creating offer:", err));
                } catch (err) {
                  console.error("Error initiating connection:", err);
                }
              }
            }
          }, 100);
        }
        
        return merged;
      });
    });

    socket.on("offer", async (data) => {
      if (data.from === socket.id) return;
      try {
        console.log("Received offer from:", data.from);
        const pc = createPeerConnection(data.from);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { meetingId: id, answer, to: data.from });
        console.log("Sent answer to:", data.from);
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socket.on("answer", async (data) => {
      if (data.from === socket.id) return;
      try {
        console.log("Received answer from:", data.from);
        const pc = peerConnections.current[data.from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log("Remote description set for:", data.from);
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
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      setRemoteStreams({});
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

    return () => {
      socket.emit("leave-meeting", { meetingId: id });
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      setRemoteStreams({});
      socket.disconnect();
    };
  }, [meeting?.id, meeting?.status, accessDenied, currentUser, id, createPeerConnection]);

  const startCall = async () => {
    if (!currentUser || !socketRef.current) return;
    
    try {
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await getLocalStream(true);
      }

      // Send offer to each connected participant
      const others = participants.filter((p) => p.user_id !== currentUser.id && p.socketId);
      for (const p of others) {
        if (!peerConnections.current[p.socketId]) {
          const pc = createPeerConnection(p.socketId);
          
          // Add all tracks from local stream to peer connection
          if (stream) {
            stream.getTracks().forEach((track) => {
              pc.addTrack(track, stream);
            });
          }
          
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit("offer", {
            meetingId: id,
            offer,
            to: p.socketId,
          });
        }
      }
    } catch (err) {
      console.error("Error starting call:", err);
      setCallError(`Failed to start call: ${err.message}`);
    }
  };

  // STT
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
        };

        setTranscript((prev) => {
          const updated = [...prev, newEntry];

          if (socketRef.current?.connected) {
            socketRef.current.emit("transcript-update", {
              meetingId: id,
              entry: newEntry,
            });
          }

          if (sttTimeoutRef.current) clearTimeout(sttTimeoutRef.current);
          sttTimeoutRef.current = setTimeout(async () => {
            try {
              await supabase.from("meetings").update({ transcript: updated }).eq("id", id);
            } catch (err) {
              console.error("Error saving transcript:", err);
            }
          }, 2000);

          return updated;
        });
      }
    };

    recognition.onerror = () => { sttRunningRef.current = false; };
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

  const handleToggleMic = async () => { await toggleMic(); };
  const handleToggleVideo = async () => { await toggleVideo(); };

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
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      setRemoteStreams({});

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
      // remove participants (safer) then delete meeting
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
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    socketRef.current?.emit("leave-meeting", { meetingId: id });
    router.push("/discussion/meetings");
  };

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
        <Alert color="danger">
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
                  <Button variant="danger" size="sm" onPress={handleDeleteMeeting} isLoading={deleting} className="ml-2">Delete</Button>
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
            <div className="space-y-3">
              {transcript.map((entry, idx) => (
                <div key={idx} className="flex gap-3">
                  <Avatar size="sm"><Avatar.Fallback>{entry.name?.charAt(0) || "?"}</Avatar.Fallback></Avatar>
                  <div><p className="text-sm font-medium">{entry.name}</p><p className="text-sm text-foreground">{entry.say}</p></div>
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
              <Button variant="secondary" onPress={handleGenerateSummary} isLoading={generatingSummary}>
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

  const activeParticipants = participants.filter((p) => !p.left_at);
  const participantName = (p) => p.users?.name || p.name || "Unknown";
  const participantPic = (p) => p.users?.pic || p.pic;
  const participantId = (p) => p.user_id || p.id;

  return (
    <div className="flex h-full flex-col bg-background-secondary">
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
                <Button variant="danger" size="sm" onPress={handleDeleteMeeting} isLoading={deleting} className="ml-2">Delete</Button>
              </div>
            )}
            <Chip color="success">Live</Chip>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto p-2">
        {currentUser && (
          <Card className={`min-w-[160px] border-2 ${speakingIds.has(currentUser.id) ? "border-success" : "border-default"} text-center`}>
            <Card.Content className="p-3">
              <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-default-100">
                {!isVideoOff && localStream ? (
                  <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <Avatar size="lg">
                    {currentUser.pic ? <Avatar.Image src={currentUser.pic} alt={currentUser.name} /> : null}
                    <Avatar.Fallback>{currentUser.name?.charAt(0) || "Y"}</Avatar.Fallback>
                  </Avatar>
                )}
              </div>
              <p className="text-xs font-medium">{currentUser.name || "You"}</p>
              <p className="text-[10px] text-muted">{isMuted ? "Muted" : "Mic on"} · {isVideoOff ? "Camera off" : "Camera on"}</p>
            </Card.Content>
          </Card>
        )}

        {Object.entries(remoteStreams).map(([peerSocketId, stream]) => {
          const participant = participants.find((p) => p.socketId === peerSocketId);
          return (
            <Card key={peerSocketId} className="min-w-[160px] border-2 border-success text-center">
              <Card.Content className="p-3">
                <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-default-100">
                  <video ref={(el) => { if (el) el.srcObject = stream; }} autoPlay playsInline className="h-full w-full object-cover" />
                </div>
                <p className="text-xs font-medium">{participantName(participant || {})}</p>
              </Card.Content>
            </Card>
          );
        })}

        {activeParticipants.filter((p) => participantId(p) !== currentUser?.id && p.socketId && !remoteStreams[p.socketId]).map((p, idx) => (
          <Card key={idx} className={`min-w-[120px] border-2 text-center ${speakingIds.has(participantId(p)) ? "border-success" : "border-default"}`}>
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

      <div className="flex flex-1 items-center justify-center p-3">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-background shadow">
          {!localStream ? <Mic size={40} /> : <Camera size={40} />}
          <p className="text-lg font-semibold">{meeting.title}</p>
          <p className="text-sm text-muted">{activeParticipants.length} participant{activeParticipants.length !== 1 ? "s" : ""}</p>
          {!localStream && <Button onPress={handleStartCall} className="mt-2">Join Call</Button>}
        </div>
      </div>

      <div className="flex justify-center gap-4 bg-background p-4 shadow">
        <ButtonGroup>
          <Button isIconOnly variant="outline" size="lg" onClick={handleToggleMic}>
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button isIconOnly variant="outline" size="lg" onClick={handleToggleVideo}>
            {isVideoOff ? <CameraOff /> : <Camera />}
          </Button>
          <Button variant="outline" size="lg">
            <Users /> {activeParticipants.length}
          </Button>
          {isHost ? (
            <Button variant="danger" size="lg" onClick={handleEndMeeting} isLoading={ending}>
              <PhoneOff /> End Meeting
            </Button>
          ) : (
            <Button variant="danger" size="lg" onClick={handleLeaveMeeting}>Leave</Button>
          )}
        </ButtonGroup>
        {callError && <Alert color="warning" className="mt-2">{callError}</Alert>}
      </div>
    </div>
  );
}
