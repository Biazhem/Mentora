import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Store active meetings: meetingId -> Map of socketId -> participant data
const meetings = new Map();
// Store socket -> meeting mapping for quick lookup on disconnect
const socketToMeeting = new Map();

function getParticipantsArray(meetingId) {
  const meeting = meetings.get(meetingId);
  if (!meeting) return [];
  return Array.from(meeting.values());
}

function broadcastParticipants(meetingId) {
  const participants = getParticipantsArray(meetingId);
  io.to(`meeting:${meetingId}`).emit("participants-update", participants);
}

async function persistTranscript(meetingId, entry) {
  try {
    const { data: existing, error: selErr } = await supabase
      .from("meetings")
      .select("transcript")
      .eq("id", meetingId)
      .single();

    if (selErr) {
      console.error("Supabase select transcript error:", selErr);
      return;
    }

    const serverTranscript = Array.isArray(existing?.transcript) ? existing.transcript : [];
    const exists = serverTranscript.some(
      (t) => t.name === entry.name && t.say === entry.say
    );
    if (exists) return;

    const merged = [...serverTranscript, entry];
    const { error: updErr } = await supabase
      .from("meetings")
      .update({ transcript: merged })
      .eq("id", meetingId);

    if (updErr) console.error("Supabase update transcript error:", updErr);
  } catch (err) {
    console.error("persistTranscript error:", err);
  }
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-meeting", async (data) => {
    try {
      const { meetingId, user } = data;

      if (!meetingId || typeof meetingId !== "string") {
        socket.emit("error", { message: "Invalid meetingId" });
        return;
      }
      if (!user || !user.id || !user.name) {
        socket.emit("error", { message: "Invalid user data" });
        return;
      }

      // If user was already in another meeting, remove them first
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
        isVideoOff: true,
        joined_at: new Date().toISOString(),
      };

      meetings.get(meetingId).set(socket.id, participantData);
      socketToMeeting.set(socket.id, meetingId);

      const participants = getParticipantsArray(meetingId);
      console.log(`User ${user.name} (${socket.id}) joined meeting ${meetingId}. Total: ${participants.length}`);
      io.to(`meeting:${meetingId}`).emit("participants-update", participants);
    } catch (err) {
      console.error("Error in join-meeting:", err);
      socket.emit("error", { message: "Failed to join meeting" });
    }
  });

  socket.on("offer", (data) => {
    try {
      const { meetingId, offer, to } = data;
      if (!to || !offer || !meetingId) return;
      console.log(`Forwarding offer from ${socket.id} to ${to}`);
      io.to(to).emit("offer", { offer, from: socket.id });
    } catch (err) {
      console.error("Error in offer:", err);
    }
  });

  socket.on("answer", (data) => {
    try {
      const { meetingId, answer, to } = data;
      if (!to || !answer || !meetingId) return;
      console.log(`Forwarding answer from ${socket.id} to ${to}`);
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

  socket.on("toggle-video", (data) => {
    try {
      const { meetingId } = data;
      if (!meetingId) return;
      const meeting = meetings.get(meetingId);
      if (!meeting) return;
      const participant = meeting.get(socket.id);
      if (participant) {
        participant.isVideoOff = !participant.isVideoOff;
        broadcastParticipants(meetingId);
      }
    } catch (err) {
      console.error("Error in toggle-video:", err);
    }
  });

  // Audio level reporting for speaking detection
  socket.on("audio-level", (data) => {
    try {
      const { meetingId, level } = data;
      if (!meetingId) return;
      const meeting = meetings.get(meetingId);
      if (!meeting) return;
      const participant = meeting.get(socket.id);
      if (participant) {
        participant.audioLevel = level;
        // Broadcast to everyone except sender
        socket.to(`meeting:${meetingId}`).emit("audio-level", {
          socketId: socket.id,
          level,
        });
      }
    } catch (err) {
      console.error("Error in audio-level:", err);
    }
  });

  // Transcript: client sends entry, server persists + broadcasts
  socket.on("transcript-update", (data) => {
    try {
      const { meetingId, entry } = data;
      if (!meetingId || !entry || !entry.name || !entry.say) return;
      const enriched = { ...entry, timestamp: entry.timestamp || new Date().toISOString() };
      // Broadcast to all participants in the meeting
      io.to(`meeting:${meetingId}`).emit("transcript-update", { entry: enriched, from: socket.id });
      console.log(`Transcript from ${entry.name}: ${entry.say}`);
      // Persist to Supabase (debounced on server via timeout per entry)
      persistTranscript(meetingId, enriched);
    } catch (err) {
      console.error("Error in transcript-update:", err);
    }
  });

  socket.on("end-meeting", (data) => {
    try {
      const { meetingId } = data;
      if (!meetingId) return;
      const meeting = meetings.get(meetingId);
      if (meeting) {
        io.to(`meeting:${meetingId}`).emit("meeting-ended", { meetingId });
        meetings.delete(meetingId);
      }
    } catch (err) {
      console.error("Error in end-meeting:", err);
    }
  });

  socket.on("leave-meeting", (data) => {
    try {
      const { meetingId } = data;
      if (!meetingId) return;
      const meeting = meetings.get(meetingId);
      if (meeting) {
        meeting.delete(socket.id);
        if (meeting.size === 0) {
          meetings.delete(meetingId);
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

  socket.on("disconnect", () => {
    try {
      const meetingId = socketToMeeting.get(socket.id);
      if (meetingId) {
        const meeting = meetings.get(meetingId);
        if (meeting) {
          meeting.delete(socket.id);
          if (meeting.size === 0) {
            meetings.delete(meetingId);
          } else {
            broadcastParticipants(meetingId);
          }
        }
        socketToMeeting.delete(socket.id);
      }
      console.log(`User disconnected: ${socket.id}`);
    } catch (err) {
      console.error("Error in disconnect:", err);
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    activeMeetings: meetings.size,
    timestamp: new Date().toISOString(),
  });
});

// Get active participants for a meeting
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

process.on("SIGTERM", () => {
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  httpServer.close(() => process.exit(0));
});

export { app, httpServer, io };
