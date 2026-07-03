import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

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
});

// Store active meetings and their participants
const meetings = new Map();
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-meeting", async (data) => {
    try {
      const { meetingId, user } = data;
      
      // Validation
      if (!meetingId || typeof meetingId !== "string") {
        console.error("Invalid meetingId", meetingId);
        socket.emit("error", { message: "Invalid meetingId" });
        return;
      }
      if (!user || !user.id || !user.name) {
        console.error("Invalid user data", user);
        socket.emit("error", { message: "Invalid user data" });
        return;
      }

      socket.join(`meeting:${meetingId}`);

      if (!meetings.has(meetingId)) {
        meetings.set(meetingId, new Map());
      }
      meetings.get(meetingId).set(socket.id, {
        ...user,
        socketId: socket.id,
        isMuted: false,
        isVideoOff: true,
        joined_at: new Date().toISOString(),
      });

      userSockets.set(socket.id, { meetingId, user });

      const participants = Array.from(meetings.get(meetingId).values());
      io.to(`meeting:${meetingId}`).emit("participants-update", participants);
    } catch (err) {
      console.error("Error in join-meeting:", err);
      socket.emit("error", { message: "Failed to join meeting" });
    }
  });

  socket.on("offer", (data) => {
    try {
      const { meetingId, offer, to } = data;
      if (!to || !offer || !meetingId) {
        console.error("Invalid offer data", { meetingId, to, offerExists: !!offer });
        return;
      }
      io.to(to).emit("offer", {
        offer,
        from: socket.id,
      });
    } catch (err) {
      console.error("Error in offer:", err);
    }
  });

  socket.on("answer", (data) => {
    try {
      const { meetingId, answer, to } = data;
      if (!to || !answer || !meetingId) {
        console.error("Invalid answer data", { meetingId, to, answerExists: !!answer });
        return;
      }
      io.to(to).emit("answer", {
        answer,
        from: socket.id,
      });
    } catch (err) {
      console.error("Error in answer:", err);
    }
  });

  socket.on("ice-candidate", (data) => {
    try {
      const { meetingId, candidate, to } = data;
      if (!to || !candidate || !meetingId) {
        console.error("Invalid ice-candidate data", { meetingId, to, candidateExists: !!candidate });
        return;
      }
      io.to(to).emit("ice-candidate", {
        candidate,
        from: socket.id,
      });
    } catch (err) {
      console.error("Error in ice-candidate:", err);
    }
  });

  socket.on("toggle-mute", (data) => {
    try {
      const { meetingId } = data;
      if (!meetingId) {
        console.error("Invalid meetingId in toggle-mute");
        return;
      }
      const meeting = meetings.get(meetingId);
      if (meeting) {
        const participant = meeting.get(socket.id);
        if (participant) {
          participant.isMuted = !participant.isMuted;
          io.to(`meeting:${meetingId}`).emit("participants-update", Array.from(meeting.values()));
        }
      }
    } catch (err) {
      console.error("Error in toggle-mute:", err);
    }
  });

  socket.on("toggle-video", (data) => {
    try {
      const { meetingId } = data;
      if (!meetingId) {
        console.error("Invalid meetingId in toggle-video");
        return;
      }
      const meeting = meetings.get(meetingId);
      if (meeting) {
        const participant = meeting.get(socket.id);
        if (participant) {
          participant.isVideoOff = !participant.isVideoOff;
          io.to(`meeting:${meetingId}`).emit("participants-update", Array.from(meeting.values()));
        }
      }
    } catch (err) {
      console.error("Error in toggle-video:", err);
    }
  });

  socket.on("end-meeting", (data) => {
    try {
      const { meetingId } = data;
      if (!meetingId) {
        console.error("Invalid meetingId in end-meeting");
        return;
      }
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
      if (!meetingId) {
        console.error("Invalid meetingId in leave-meeting");
        return;
      }
      const meeting = meetings.get(meetingId);
      if (meeting) {
        meeting.delete(socket.id);
        if (meeting.size === 0) {
          meetings.delete(meetingId);
        } else {
          io.to(`meeting:${meetingId}`).emit("participants-update", Array.from(meeting.values()));
        }
      }
      socket.leave(`meeting:${meetingId}`);
      userSockets.delete(socket.id);
    } catch (err) {
      console.error("Error in leave-meeting:", err);
    }
  });

  socket.on("transcript-update", (data) => {
    try {
      const { meetingId, entry } = data;
      if (!meetingId || !entry) {
        console.error("Invalid transcript data", { meetingId, entryExists: !!entry });
        return;
      }
      // Broadcast transcript to all participants in the meeting
      io.to(`meeting:${meetingId}`).emit("transcript-update", { entry, from: socket.id });
      console.log(`Transcript from ${entry.name}: ${entry.say}`);
    } catch (err) {
      console.error("Error in transcript-update:", err);
    }
  });

  socket.on("disconnect", () => {
    try {
      const userData = userSockets.get(socket.id);
      if (userData) {
        const meeting = meetings.get(userData.meetingId);
        if (meeting) {
          meeting.delete(socket.id);
          if (meeting.size === 0) {
            meetings.delete(userData.meetingId);
          } else {
            io.to(`meeting:${userData.meetingId}`).emit("participants-update", Array.from(meeting.values()));
          }
        }
        userSockets.delete(socket.id);
      }
      console.log(`User disconnected: ${socket.id}`);
    } catch (err) {
      console.error("Error in disconnect:", err);
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  try {
    res.json({ status: "ok", activeMeetings: meetings.size, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Health check error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Get active participants for a meeting
app.get("/meeting/:id/participants", (req, res) => {
  try {
    const meeting = meetings.get(req.params.id);
    if (!meeting) {
      return res.json({ participants: [], meetingId: req.params.id });
    }
    res.json({ participants: Array.from(meeting.values()), meetingId: req.params.id });
  } catch (err) {
    console.error("Get participants error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint for load balancers
app.get("/", (req, res) => {
  res.json({ service: "mentora-meeting-server", status: "running", version: "1.0.0" });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server gracefully");
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing server gracefully");
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

export { app, httpServer, io };
