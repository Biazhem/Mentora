// app/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";
import { TextField } from "@heroui/react";
import { Label } from "@heroui/react";
import { Input } from "@heroui/react";
import { Surface } from "@heroui/react";
import { Avatar } from "@heroui/react";
import { TextArea } from "@heroui/react";

// Disable SSR to prevent "window is not defined" errors
const MarkdownEditor = dynamic(
  () => import("@/components/custom/MarkdownEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 col-span-1 border rounded-lg animate-pulse bg-gray-100">
        Loading Editor...
      </div>
    ),
  },
);

export default function Home() {
  const [markdownCode, setMarkdownCode] = useState(
    "# Hello !\n\nType something here...",
  );

  return (
    <div className="py-12 px-3 space-y-1">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Create Event</h1>
        <p className="text-sm text-muted">
          Learn, connect, and grow with Mentora events
        </p>
      </div>
      <div className="flex gap-2">
        <MarkdownEditor value={markdownCode} onChange={setMarkdownCode} />
        <div className="flex flex-col mx-1">
          <Surface
            className="flex min-w-[320px] flex-col gap-1 rounded-3xl p-3"
            variant="secondary"
          >
            <h3 className="text-base font-semibold text-foreground">Guests</h3>
            <div className="flex gap-2 items-center">
              <Avatar variant="soft" color="accent">
                <Avatar.Fallback>AC</Avatar.Fallback>
              </Avatar>
              <Avatar variant="soft" color="accent">
                <Avatar.Fallback>HB</Avatar.Fallback>
              </Avatar>
              <Avatar variant="soft" color="accent">
                <Avatar.Fallback>IC</Avatar.Fallback>
              </Avatar>
            </div>
          </Surface>
          <TextField>
            <Label htmlFor="mentor-inst-email">Event Guests</Label>
            <Input
              id="mentor-inst-email"
              type="email"
              placeholder="alex@institute.edu"
              fullWidth
            />
            <Button variant="outline" fullWidth>Add Guest</Button>
          </TextField>
          <TextField>
            <Label htmlFor="mentor-inst-addr">Address</Label>
            <TextArea
              id="mentor-inst-addr"
              cols={3}
              placeholder="Street, City"
              fullWidth
            />
            <Button variant="outline" fullWidth>Add Guest</Button>
          </TextField>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">Draft</Button>
        <Button>Submit</Button>
      </div>
    </div>
  );
}
