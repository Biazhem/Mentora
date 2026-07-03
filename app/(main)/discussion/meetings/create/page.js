"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Input, Label, TextField } from "@heroui/react";
import { Video } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";

export default function MeetingCreate() {
  const { user } = useUser();
  const router = useRouter();
  const selectedOrganizationId = useOrgSelectorStore((s) => s.selectedOrganizationId);
  const [title, setTitle] = useState("New Meeting");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateMeeting = async () => {
    if (!user || !selectedOrganizationId) return;

    setCreating(true);
    setError("");

    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) {
        throw new Error("Your profile is not synced with Supabase.");
      }

      const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .insert({
          org_id: selectedOrganizationId,
          host_id: userData.id,
          title,
          status: "active",
        })
        .select("id")
        .single();

      if (meetingError) throw meetingError;

      await supabase.from("meeting_participants").insert({
        meeting_id: meeting.id,
        user_id: userData.id,
      });

      router.push(`/discussion/meetings/${meeting.id}`);
    } catch (err) {
      setError(err?.message || "Could not create meeting");
      console.error("Create meeting error:", err);
    } finally {
      setCreating(false);
    }
  };

  if (!selectedOrganizationId) {
    return (
      <div className="container py-10">
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Select an organization</Alert.Title>
            <Alert.Description>
              Choose an organization from the header before creating a meeting.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-10">
      <Card className="w-full max-w-xl">
        <Card.Header>
          <Card.Title>Create video meeting</Card.Title>
          <Card.Description>
            Start a Daily video room and sync it with your organization meeting.
          </Card.Description>
        </Card.Header>
        <Card.Content className="space-y-4">
          {error && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Could not create meeting</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <TextField value={title} onChange={setTitle}>
            <Label>Meeting title</Label>
            <Input />
          </TextField>
        </Card.Content>
        <Card.Footer className="justify-end">
          <Button
            onPress={handleCreateMeeting}
            isPending={creating}
            isDisabled={!title.trim()}
          >
            <Video className="size-4" />
            Start meeting
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
