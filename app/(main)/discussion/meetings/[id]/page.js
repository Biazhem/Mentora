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
  const [isHost, setIsHost] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [callError, setCallError] = useState("");
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
  const peerDescriptionState = useRef({});  // Track description state per peer
  const peerProcessing = useRef({});  // Track if we're currently processing offer/answer for a peer

  // Keep localStreamRef in sync
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
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video,
    });
    setLocalStream(stream);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  };

  const toggleMic = async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.log("No stream, getting audio only");
      const newStream = await getLocalStream(false);
      newStream.getAudioTracks().forEach((t) => (t.enabled = true));
      setIsMuted(false);
      return;
    }
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log(`Mic toggled: ${audioTrack.enabled ? "on" : "off"}`);
      setIsMuted(!audioTrack.enabled);
      socketRef.current?.emit("toggle-mute", { meetingId: id });
    }
  };

  const toggleVideo = async () => {
    const stream = localStreamRef.current;
    if (!stream) {
      console.log("No stream, getting video + audio");
      const newStream = await getLocalStream(true);
      if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
      setIsVideoOff(false);
      return;
    }
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log(`Camera toggled: ${videoTrack.enabled ? "on" : "off"}`);
      setIsVideoOff(!videoTrack.enabled);
      socketRef.current?.emit("toggle-video", { meetingId: id });
    }
  };

  const createPeerConnection = (peerSocketId, stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    const activeStream = stream || localStreamRef.current;
    if (activeStream) {
      activeStream.getTracks().forEach((track) => pc.addTrack(track, activeStream));
    }

    pc.ontrack = (event) => {
      console.log(`Received track from ${peerSocketId}:`, event.track.kind);
      setRemoteStreams((prev) => ({ ...prev, [peerSocketId]: event.streams[0] }));
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

    // Track connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerSocketId}: ${pc.connectionState}`);
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        console.error(`Connection failed with ${peerSocketId}`);
      } else if (pc.connectionState === "connected") {
        console.log(`Successfully connected with ${peerSocketId}`);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${peerSocketId}: ${pc.iceConnectionState}`);
    };

    peerConnections.current[peerSocketId] = pc;
    return pc;
  };

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
        setIsHost(meetingData.host_id === userData.id);
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

  // Supabase realtime for meeting status + participant changes
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

    const socket = io(SOCKET_URL, { 
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-meeting", {
        meetingId: id,
        user: { id: currentUser.id, name: currentUser.name, pic: currentUser.pic },
      });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setCallError(`Connection error: ${error.message}`);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setCallError(`Socket error: ${error?.message || "Unknown error"}`);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("participants-update", (socketParticipants) => {
      // Merge socket participants with Supabase data
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
        const updated = [...supabaseOnly, ...fromSocket];
        
        // Auto-trigger offer to new participants if local stream exists
        if (localStreamRef.current && socketRef.current) {
          const newParticipants = socketParticipants.filter(
            (sp) => !prev.some((p) => p.socketId === sp.socketId)
          );
          
          newParticipants.forEach((newPeer) => {
            if (!peerConnections.current[newPeer.socketId]) {
              console.log(`New participant detected: ${newPeer.name}, creating connection`);
              setTimeout(() => {
                const pc = createPeerConnection(newPeer.socketId, localStreamRef.current);
                pc.createOffer()
                  .then((offer) => {
                    pc.setLocalDescription(offer);
                    socketRef.current.emit("offer", {
                      meetingId: id,
                      offer,
                      to: newPeer.socketId,
                    });
                  })
                  .catch((err) => console.error("Error creating offer:", err));
              }, 100);
            }
          });
        }
        
        return updated;
      });
    });

    socket.on("offer", async (data) => {
      try {
        if (data.from === socket.id) return;
        console.log(`Received offer from ${data.from}`);
        
        // Prevent concurrent processing of offer/answer for same peer
        if (peerProcessing.current[data.from]) {
          console.log(`Already processing offer/answer for ${data.from}, queueing...`);
          return;
        }
        peerProcessing.current[data.from] = true;
        
        try {
          let pc = peerConnections.current[data.from];
          
          // If connection exists and is connected, ignore duplicate offer
          if (pc && pc.connectionState === "connected") {
            console.log(`Connection with ${data.from} already connected, ignoring duplicate offer`);
            return;
          }
          
          // Close and recreate if in bad state
          if (pc && (pc.connectionState === "closed" || pc.connectionState === "failed")) {
            console.warn(`Peer connection ${data.from} is ${pc.connectionState}, creating new connection`);
            pc.close();
            peerConnections.current[data.from] = null;
            delete peerDescriptionState.current[data.from];
            pc = null;
          }
          
          // Create new connection if needed
          if (!pc) {
            console.log(`Creating new connection for ${data.from}`);
            pc = createPeerConnection(data.from);
            peerDescriptionState.current[data.from] = { hasLocalDesc: false, hasRemoteDesc: false };
          }
          
          // Add local stream tracks if available
          const stream = localStreamRef.current;
          if (stream) {
            const senders = pc.getSenders();
            stream.getTracks().forEach((track) => {
              const sender = senders.find((s) => s.track?.kind === track.kind);
              if (!sender) {
                pc.addTrack(track, stream);
                console.log(`Added ${track.kind} track to peer connection ${data.from}`);
              }
            });
          }
          
          // Prevent duplicate operations
          const descState = peerDescriptionState.current[data.from];
          
          // Check if remote description already set
          if (descState?.hasRemoteDesc) {
            console.warn(`Remote description already set for ${data.from}, ignoring duplicate offer`);
            return;
          }
          
          // Validate signaling state before setting remote offer
          if (pc.signalingState !== "stable" && pc.signalingState !== "have-local-offer") {
            console.warn(`Cannot set remote offer in state ${pc.signalingState}, expected stable or have-local-offer`);
            return;
          }
          
          console.log(`Setting remote offer from ${data.from}, signaling state: ${pc.signalingState}`);
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          descState.hasRemoteDesc = true;
          console.log(`Remote description set, signaling state: ${pc.signalingState}`);
          
          // Only create answer if we haven't already sent an offer and signaling state is correct
          if (!descState.hasLocalDesc && pc.signalingState === "have-remote-offer") {
            console.log(`Creating answer for ${data.from}`);
            const answer = await pc.createAnswer();
            console.log(`Answer created, setting local description for ${data.from}, state: ${pc.signalingState}`);
            
            // Double-check state before setLocalDescription
            if (pc.signalingState !== "have-remote-offer") {
              console.error(`State changed before setLocalDescription! Now: ${pc.signalingState}`);
              return;
            }
            
            await pc.setLocalDescription(answer);
            descState.hasLocalDesc = true;
            console.log(`Local description set, signaling state: ${pc.signalingState}`);
            
            console.log(`Sending answer to ${data.from}`);
            socket.emit("answer", { meetingId: id, answer, to: data.from });
          } else {
            console.log(`Skipping answer: hasLocalDesc=${descState.hasLocalDesc}, state=${pc.signalingState}`);
          }
        } finally {
          peerProcessing.current[data.from] = false;
        }
      } catch (err) {
        console.error("Error handling offer:", err);
        if (data?.from) {
          delete peerDescriptionState.current[data.from];
          peerProcessing.current[data.from] = false;
        }
        setCallError(`WebRTC error: ${err.message}`);
      }
    });

    socket.on("answer", async (data) => {
      try {
        if (data.from === socket.id) return;
        console.log(`Received answer from ${data.from}`);
        
        // Prevent concurrent processing
        if (peerProcessing.current[data.from]) {
          console.log(`Already processing for ${data.from}, skipping answer`);
          return;
        }
        peerProcessing.current[data.from] = true;
        
        try {
          const pc = peerConnections.current[data.from];
          if (!pc) {
            console.warn(`No peer connection found for ${data.from} when receiving answer`);
            return;
          }
          
          if (pc.connectionState === "closed" || pc.connectionState === "failed") {
            console.warn(`Peer connection ${data.from} is ${pc.connectionState}, ignoring answer`);
            return;
          }
          
          // Check if we already have remote description
          const descState = peerDescriptionState.current[data.from];
          if (descState?.hasRemoteDesc) {
            console.warn(`Remote description already set for ${data.from}, ignoring duplicate answer`);
            return;
          }
          
          // Answer can only be set when we have a local offer
          console.log(`Signaling state for answer from ${data.from}: ${pc.signalingState}`);
          if (pc.signalingState !== "have-local-offer") {
            console.warn(`Cannot set remote answer in state ${pc.signalingState}, expected have-local-offer`);
            return;
          }
          
          console.log(`Setting remote description for answer from ${data.from}`);
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          if (descState) {
            descState.hasRemoteDesc = true;
          }
          console.log(`Remote answer set successfully, signaling state: ${pc.signalingState}`);
        } finally {
          peerProcessing.current[data.from] = false;
        }
      } catch (err) {
        console.error("Error handling answer:", err);
        if (data?.from) {
          delete peerDescriptionState.current[data.from];
          peerProcessing.current[data.from] = false;
        }
        setCallError(`WebRTC error: ${err.message}`);
      }
    });

    socket.on("ice-candidate", async (data) => {
      try {
        if (data.from === socket.id) return;
        let pc = peerConnections.current[data.from];
        
        if (!pc) {
          console.warn(`No peer connection for ${data.from}, cannot add ICE candidate yet. Waiting for offer/answer.`);
          return;
        }
        
        if (data.candidate) {
          if (pc.connectionState !== "closed" && pc.connectionState !== "failed") {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              console.log(`Added ICE candidate from ${data.from}`);
            } catch (err) {
              if (err.name !== "InvalidStateError") {
                console.error("Error adding ICE candidate:", err);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error in ice-candidate handler:", err);
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
        console.log(`Received transcript from ${entry.name}: ${entry.say}`);
        setTranscript((prev) => {
          // Avoid duplicates
          const isDuplicate = prev.some(
            (t) => t.name === entry.name && t.say === entry.say && t.timestamp === entry.timestamp
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
  }, [meeting?.id, meeting?.status, accessDenied, currentUser, id]);

  const startCall = async () => {
    if (!currentUser || !socketRef.current) return;
    try {
      console.log("Starting call...");
      const stream = await getLocalStream(true);
      console.log(`Got local stream with ${stream.getTracks().length} tracks`);

      // Find other participants from socket that we haven't connected to yet
      const others = participants.filter((p) => p.user_id !== currentUser.id && p.socketId);
      console.log(`Found ${others.length} other participants to connect to`);
      
      for (const p of others) {
        if (!peerConnections.current[p.socketId]) {
          console.log(`Creating connection and sending offer to ${p.users?.name}`);
          try {
            const pc = createPeerConnection(p.socketId, stream);
            const socketId = p.socketId;
            peerDescriptionState.current[socketId] = { hasLocalDesc: false, hasRemoteDesc: false };
            
            console.log(`Created peer connection, signaling state: ${pc.signalingState}`);
            
            const offer = await pc.createOffer();
            console.log(`Offer created, setting local description for ${p.users?.name}`);
            
            await pc.setLocalDescription(offer);
            peerDescriptionState.current[socketId].hasLocalDesc = true;
            console.log(`Local description set, signaling state: ${pc.signalingState}`);
            
            socketRef.current.emit("offer", {
              meetingId: id,
              offer,
              to: p.socketId,
            });
            console.log(`Sent offer to ${p.users?.name}`);
          } catch (err) {
            console.error(`Error creating offer for ${p.users?.name}:`, err);
            delete peerDescriptionState.current[p.socketId];
            setCallError(`Failed to connect to ${p.users?.name}: ${err.message}`);
          }
        }
      }
    } catch (err) {
      console.error("Error in startCall:", err);
      setCallError(`Failed to start call: ${err.message}`);
    }
  };

  const initializeSTT = useCallback(() => {
    if (typeof window === "undefined" || recognitionRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    console.log("Initializing Speech Recognition...");
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("STT: Listening started");
      sttRunningRef.current = true;
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text + " ";
        }
      }

      if (finalTranscript.trim()) {
        console.log("Final transcript:", finalTranscript);
        const newEntry = {
          name: currentUser?.name || "Unknown",
          say: finalTranscript.trim(),
        };
        
        // Add to local transcript
        setTranscript((prev) => {
          const updated = [...prev, newEntry];
          
          // Emit to other participants via Socket.io
          if (socketRef.current?.connected) {
            socketRef.current.emit("transcript-update", {
              meetingId: id,
              entry: newEntry,
            });
          }

          // Auto-save to Supabase (debounced)
          if (sttTimeoutRef.current) {
            clearTimeout(sttTimeoutRef.current);
          }
          sttTimeoutRef.current = setTimeout(async () => {
            try {
              await supabase
                .from("meetings")
                .update({ transcript: updated })
                .eq("id", id);
              console.log("Transcript saved to Supabase");
            } catch (err) {
              console.error("Error saving transcript:", err);
            }
          }, 2000);

          return updated;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("STT error:", event.error);
      sttRunningRef.current = false;
    };

    recognition.onend = () => {
      console.log("STT: Listening ended");
      sttRunningRef.current = false;
    };

    recognitionRef.current = recognition;
  }, [currentUser, id]);

  // Start/stop STT based on meeting state and mic status
  useEffect(() => {
    if (!meeting || meeting.status !== "active" || !currentUser || !localStream) return;
    
    const audioTracks = localStream.getAudioTracks();
    const hasAudio = audioTracks.length > 0 && audioTracks[0].enabled;

    if (hasAudio && !isMuted) {
      // Initialize if not already done
      if (!recognitionRef.current) {
        initializeSTT();
      }

      // Start only if not already running
      if (recognitionRef.current && !sttRunningRef.current) {
        try {
          console.log("Starting STT...");
          recognitionRef.current.start();
        } catch (err) {
          console.error("Error starting STT:", err);
        }
      }
    } else {
      // Stop STT if muted or no audio
      if (recognitionRef.current && sttRunningRef.current) {
        try {
          console.log("Stopping STT...");
          recognitionRef.current.stop();
          sttRunningRef.current = false;
        } catch (err) {
          console.error("Error stopping STT:", err);
        }
      }
    }

    return () => {
      if (recognitionRef.current && sttRunningRef.current) {
        try {
          recognitionRef.current.stop();
          sttRunningRef.current = false;
        } catch (err) {
          console.error("Error stopping STT on cleanup:", err);
        }
      }
    };
  }, [meeting?.status, currentUser, localStream, isMuted, initializeSTT]);

  const handleToggleMic = async () => { 
    await toggleMic();
  };
  const handleToggleVideo = async () => { await toggleVideo(); };

  const handleEndMeeting = async () => {
    setEnding(true);
    const endedAt = new Date().toISOString();
    try {
      // Stop STT
      if (recognitionRef.current && sttRunningRef.current) {
        recognitionRef.current.stop();
        sttRunningRef.current = false;
      }

      const stream = localStreamRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
      peerDescriptionState.current = {};
      peerProcessing.current = {};
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

  const handleLeaveMeeting = () => {
    // Stop STT
    if (recognitionRef.current && sttRunningRef.current) {
      recognitionRef.current.stop();
      sttRunningRef.current = false;
    }

    const stream = localStreamRef.current;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    peerDescriptionState.current = {};
    peerProcessing.current = {};
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

  // Ended meeting view
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
          <h1 className="text-2xl font-bold mb-2">{meeting.title}</h1>
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
                  <Avatar.Fallback>{p.users?.name?.charAt(0) || p.name?.charAt(0) || "?"}</Avatar.Fallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{p.users?.name || p.name || "Unknown"}</p>
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
      </div>
    );
  }

  // Active meeting view
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
        <Chip color="success">Live</Chip>
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
            <Card key={peerSocketId} className="min-w-[160px] border-2 border-default text-center">
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
          {!localStream && <Button onPress={startCall} className="mt-2">Join Call</Button>}
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
