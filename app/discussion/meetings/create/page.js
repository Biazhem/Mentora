"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Camera } from "lucide-react";

export default function Meetings() {
  const participants = [
    { id: 1, name: "You", isMuted: false, isSpeaking: true },
    { id: 2, name: "Sarah", isMuted: false, isSpeaking: false },
    { id: 3, name: "Mike", isMuted: true, isSpeaking: false },
    { id: 4, name: "Emma", isMuted: false, isSpeaking: false },
    { id: 5, name: "Alex", isMuted: false, isSpeaking: true },
    { id: 6, name: "Lisa", isMuted: true, isSpeaking: false },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Participants list */}
      <div className="flex gap-2 overflow-x-auto p-2">
        {participants.map((user) => (
          <Card
            key={user.id}
            className={`min-w-[120px] text-center border-2 ${
              user.isSpeaking ? "border-green-500" : ""
            }`}
          >
            <CardContent className="p-3">
              <div className="w-full h-12 flex items-center justify-center bg-gray-200 rounded-md mb-2">
                {user.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </div>
              <p className="text-xs font-medium">{user.name}</p>
              <p className="text-[10px] text-gray-500">
                {user.isMuted ? "Muted" : "Speaking"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main audio status */}
      <div className="flex-1 flex items-center justify-center p-3">
        <div className="h-full w-full bg-white rounded-2xl shadow flex flex-col items-center justify-center gap-2">
          <Mic size={40} />
          <p className="text-lg font-semibold">Audio Call Active</p>
          <p className="text-sm text-gray-500">No video, voice only</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 p-4 bg-white shadow">
        <ButtonGroup>
          <Button variant="outline" size="icon-lg">
            <Mic />
          </Button>
          <Button variant="outline" size="icon-lg">
            <MicOff />
          </Button>
          <Button variant="outline" size="icon-lg">
            <Camera />
          </Button>
          <Button variant="destructive" size="lg">
            <PhoneOff />
            Turn Off
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
