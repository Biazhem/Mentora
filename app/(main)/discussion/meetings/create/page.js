"use client";

import { Button, ButtonGroup, Card } from "@heroui/react";
import { Camera, Mic, MicOff, PhoneOff } from "lucide-react";
import { participants } from "@/config/data";

export default function Meetings() {
  return (
    <div className="flex h-full flex-col bg-background-secondary">
      <div className="flex gap-2 overflow-x-auto p-2">
        {participants.map((user) => (
          <Card
            key={user.id}
            className={`min-w-[120px] border-2 text-center ${
              user.isSpeaking ? "border-success" : "border-default"
            }`}
          >
            <Card.Content className="p-3">
              <div className="mb-2 flex h-12 w-full items-center justify-center rounded-md bg-default-100">
                {user.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </div>
              <p className="text-xs font-medium">{user.name}</p>
              <p className="text-[10px] text-muted">
                {user.isMuted ? "Muted" : "Speaking"}
              </p>
            </Card.Content>
          </Card>
        ))}
      </div>

      <div className="flex flex-1 items-center justify-center p-3">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-background shadow">
          <Mic size={40} />
          <p className="text-lg font-semibold">Audio Call Active</p>
          <p className="text-sm text-muted">No video, voice only</p>
        </div>
      </div>

      <div className="flex justify-center gap-4 bg-background p-4 shadow">
        <ButtonGroup>
          <Button isIconOnly variant="outline" size="lg">
            <Mic />
          </Button>
          <Button isIconOnly variant="outline" size="lg">
            <MicOff />
          </Button>
          <Button isIconOnly variant="outline" size="lg">
            <Camera />
          </Button>
          <Button variant="danger" size="lg">
            <PhoneOff />
            Turn Off
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
