// app/chat/page.jsx
"use client";

import {
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Image,
  Send,
} from "lucide-react";
import { Drawer, Button } from "@heroui/react";

export default function ChatPage() {
  const messages = [
    {
      id: 1,
      text: "Hey! How are you doing today?",
      sender: "them",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      text: "I'm doing great, thanks for asking! Just working on the new project.",
      sender: "me",
      timestamp: "10:32 AM",
    },
    {
      id: 3,
      text: "That sounds exciting! What project are you working on?",
      sender: "them",
      timestamp: "10:33 AM",
    },
    {
      id: 4,
      text: "Building a chat application with Next.js and Tailwind CSS.",
      sender: "me",
      timestamp: "10:35 AM",
    },
    {
      id: 5,
      text: "Nice! I'd love to see it when you're done.",
      sender: "them",
      timestamp: "10:36 AM",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto h-screen flex flex-col p-4">
        {/* Chat Container */}
        
      </div>
    </div>
  );
}
