import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
const httpServer = createServer(app);

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY env vars.");
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const meetings = new Map();
const socketToMeeting = new Map();
const meetingTranscripts = new Map();

function getParticipantsArray(meetingId) {
  const meeting = meetings.get(meetingId);
  if (!meeting) return [];
  return Array.from(meeting.values());
}

function broadcastParticipants(meetingId) {
  const participants = getParticipantsArray(meetingId);
  io.to(`meeting:${meetingId}`).emit("participants-update", participants);
}

async function persistMeetingTranscript(meetingId) {
  if (!supabase) return;
  const transcript = meetingTranscripts.get(meetingId);
  if (!transcript || transcript.length === 0) return;

  try {
    const { data: existing } = await supabase
      .from("meetings")
      .select("transcript")
      .eq("id", meetingId)
      .single();

    const currentArr = Array.isArray(existing?.transcript) ? existing.transcript : [];
    const mergedMap = new Map();

    [...currentArr, ...transcript].forEach((item) => {
      if (item && item.name && item.say) {
        const key = `${item.name}:${item.say}`;
        if (!mergedMap.has(key)) mergedMap.set(key, item);
      }
    });

    const finalTranscript = Array.from(mergedMap.values());

    const { error } = await supabase
      .from("meetings")
      .update({ transcript: finalTranscript })
      .eq("id", meetingId);

    if (error) {
      console.error("Supabase persist error:", error);
    } else {
      console.log(`Persisted ${finalTranscript.length} transcript entries for meeting ${meetingId}`);
    }
  } catch (err) {
    console.error("persistMeetingTranscript error:", err);
  }
}

io.on("connection", (socket) => {
  socket.on("join-meeting", async (data) => {
    try {
      const { meetingId, user } = data;
      if (!meetingId || typeof meetingId !== "string" || !user?.id || !user?.name) {
        socket.emit("error", { message: "Invalid parameters" });
        return;
      }

      const prevMeetingId = socketToMeeting.get(socket.id);
      if (prevMeetingId && prevMeetingId !== meetingId) {
        const prevMeeting = meetings.get(prevMeetingId);
        if (prevMeeting) {
          prevMeeting.delete(socket.id);
          if (prevMeeting.size === 0) meetings.delete(prevMeetingId);
          else broadcastParticipants(prevMeetingId);
        }
        socket.leave(`meeting:${prevMeetingId}`);
      }

      socket.join(`meeting:${meetingId}`);
      if (!meetings.has(meetingId)) {
        meetings.set(meetingId, new Map());
      }

      const participantData = {
        id: user.id,
        name: user.name,
        pic: user.pic || null,
        socketId: socket.id,
        isMuted: false,
        connected: true,
        joined_at: new Date().toISOString(),
      };

      meetings.get(meetingId).set(socket.id, participantData);
      socketToMeeting.set(socket.id, meetingId);

      broadcastParticipants(meetingId);
    } catch (err) {
      console.error("Error in join-meeting:", err);
      socket.emit("error", { message: "Failed to join meeting" });
    }
  });

  socket.on("offer", (data) => {
    try {
      const { meetingId, offer, to } = data;
      if (!to || !offer || !meetingId) return;
      io.to(to).emit("offer", { offer, from: socket.id });
    } catch (err) {
      console.error("Error in offer:", err);
    }
  });

  socket.on("answer", (data) => {
    try {
      const { meetingId, answer, to } = data;
      if (!to || !answer || !meetingId) return;
      io.to(to).emit("answer", { answer, from: socket.id });
    } catch (err) {
      console.error("Error in answer:", err);
    }
  });

  socket.on("ice-candidate", (data) => {
    try {
      const { meetingId, candidate, to } = data;
      if (!to || !candidate || !meetingId) return;
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    } catch (err) {
      console.error("Error in ice-candidate:", err);
    }
  });

  socket.on("toggle-mute", (data) => {
    try {
      const { meetingId } = data;
      if (!meetingId) return;
      const meeting = meetings.get(meetingId);
      if (!meeting) return;
      const participant = meeting.get(socket.id);
      if (participant) {
        participant.isMuted = !participant.isMuted;
        broadcastParticipants(meetingId);
      }
    } catch (err) {
      console.error("Error in toggle-mute:", err);
    }
  });

  socket.on("peer-connected", (data) => {
    try {
      const { meetingId, peerSocketId } = data;
      if (!meetingId) return;
      const meeting = meetings.get(meetingId);
      if (!meeting) return;
      const peer = meeting.get(peerSocketId);
      if (peer) peer.connected = true;
      const sender = meeting.get(socket.id);
      if (sender) sender.connected = true;
      broadcastParticipants(meetingId);
    } catch (err) {
      console.error("Error in peer-connected:", err);
    }
  });

  socket.on("peer-disconnected", (data) => {
    try {
      const { meetingId, peerSocketId } = data;
      if (!meetingId) return;
      const meeting = meetings.get(meetingId);
      if (!meeting) return;
      const peer = meeting.get(peerSocketId);
      if (peer) peer.connected = false;
      broadcastParticipants(meetingId);
    } catch (err) {
      console.error("Error in peer-disconnected:", err);
    }
  });

  socket.on("audio-level", (data) => {
    try {
      const { meetingId, level } = data;
      if (!meetingId) return;
      const meeting = meetings.get(meetingId);
      if (!meeting) return;
      const participant = meeting.get(socket.id);
      if (participant) {
        participant.audioLevel = level;
        socket.to(`meeting:${meetingId}`).emit("audio-level", {
          socketId: socket.id,
          level,
        });
      }
    } catch (err) {
      console.error("Error in audio-level:", err);
    }
  });

  socket.on("transcript-update", (data) => {
    try {
      const { meetingId, entry } = data;
      if (!meetingId || !entry?.name || !entry?.say) return;
      const enriched = { ...entry, timestamp: entry.timestamp || new Date().toISOString() };

      if (!meetingTranscripts.has(meetingId)) {
        meetingTranscripts.set(meetingId, []);
      }
      const transcript = meetingTranscripts.get(meetingId);
      const exists = transcript.some((t) => t.name === enriched.name && t.say === enriched.say);
      if (!exists) {
        transcript.push(enriched);
      }

      io.to(`meeting:${meetingId}`).emit("transcript-update", { entry: enriched, from: socket.id });
    } catch (err) {
      console.error("Error in transcript-update:", err);
    }
  });

  socket.on("end-meeting", async (data) => {
    try {
      const { meetingId } = data;
      if (!meetingId) return;
      const meeting = meetings.get(meetingId);
      if (meeting) {
        await persistMeetingTranscript(meetingId);
        for (const [sid] of meeting) {
          socketToMeeting.delete(sid);
        }
        io.to(`meeting:${meetingId}`).emit("meeting-ended", { meetingId });
        meetings.delete(meetingId);
        meetingTranscripts.delete(meetingId);
      }
    } catch (err) {
      console.error("Error in end-meeting:", err);
    }
  });

  socket.on("leave-meeting", async (data) => {
    try {
      const { meetingId } = data;
      if (!meetingId) return;
      const storedMeetingId = socketToMeeting.get(socket.id);
      if (storedMeetingId !== meetingId) return;
      const meeting = meetings.get(meetingId);
      if (meeting) {
        meeting.delete(socket.id);
        if (meeting.size === 0) {
          await persistMeetingTranscript(meetingId);
          meetings.delete(meetingId);
          meetingTranscripts.delete(meetingId);
        } else {
          broadcastParticipants(meetingId);
        }
      }
      socket.leave(`meeting:${meetingId}`);
      socketToMeeting.delete(socket.id);
    } catch (err) {
      console.error("Error in leave-meeting:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const meetingId = socketToMeeting.get(socket.id);
      if (meetingId) {
        const meeting = meetings.get(meetingId);
        if (meeting) {
          meeting.delete(socket.id);
          if (meeting.size === 0) {
            await persistMeetingTranscript(meetingId);
            meetings.delete(meetingId);
            meetingTranscripts.delete(meetingId);
          } else {
            broadcastParticipants(meetingId);
          }
        }
        socketToMeeting.delete(socket.id);
      }
    } catch (err) {
      console.error("Error in disconnect:", err);
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    activeMeetings: meetings.size,
    timestamp: new Date().toISOString(),
  });
});

app.get("/meeting/:id/participants", (req, res) => {
  const meeting = meetings.get(req.params.id);
  if (!meeting) {
    return res.json({ participants: [], meetingId: req.params.id });
  }
  res.json({ participants: getParticipantsArray(req.params.id), meetingId: req.params.id });
});

app.get("/", (req, res) => {
  res.json({ service: "mentora-meeting-server", status: "running", version: "1.1.0" });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

process.on("SIGTERM", () => httpServer.close(() => process.exit(0)));
process.on("SIGINT", () => httpServer.close(() => process.exit(0)));

export { app, httpServer, io };