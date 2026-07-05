"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { useRouter } from "next/navigation";
import { Button, InputGroup } from "@heroui/react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, Chip, Alert } from "@heroui/react";

export default function Meeting() {
  const { user } = useUser();
  const router = useRouter();
  const selectedOrganizationId = useOrgSelectorStore((s) => s.selectedOrganizationId);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      if (!user || !selectedOrganizationId) {
        setIsAdmin(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", selectedOrganizationId)
        .eq("user_id", userData.id)
        .maybeSingle();

      setIsAdmin(data?.role === "admin");
    }

    checkAdmin();
  }, [user, selectedOrganizationId]);

  useEffect(() => {
    async function fetchMeetings() {
      if (!selectedOrganizationId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from("meetings")
        .select("*, organizations(org_name)")
        .eq("org_id", selectedOrganizationId)
        .order("started_at", { ascending: false });

      if (data) {
        setMeetings(data);
      }
      setLoading(false);
    }

    fetchMeetings();
  }, [selectedOrganizationId]);

  const handleCreateMeeting = async () => {
    if (!user || !selectedOrganizationId) return;

    const title = meetingTitle.trim() || "New Meeting";

    setCreating(true);
    setCreateError("");
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) return;

      const { data: meeting } = await supabase
        .from("meetings")
        .insert({
          org_id: selectedOrganizationId,
          host_id: userData.id,
          title,
          status: "active",
        })
        .select("id")
        .single();

      if (meeting) {
        await supabase.from("meeting_participants").insert({
          meeting_id: meeting.id,
          user_id: userData.id,
        });
        router.push(`/discussion/meetings/${meeting.id}`);
      }
    } catch (err) {
      setCreateError(err?.message || "Could not create meeting");
      console.error("Create meeting error:", err);
    } finally {
      setCreating(false);
    }
  };

  if (!selectedOrganizationId) {
    return (
      <div className="container py-10">
        <Alert color="warning">Select an organization from the header to view meetings.</Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Recent Meetings</h1>
          <p className="text-sm text-muted">
            Learn, discuss, and grow with Meetups
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {isAdmin && (
            <>
              <InputGroup>
                <InputGroup.Input
                  placeholder="Meeting title"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-[200px]"
                />
              </InputGroup>
              <Button onClick={handleCreateMeeting} isLoading={creating}>
                <Plus className="mr-2" />
                Create Meeting
              </Button>
            </>
          )}
        </div>
      </div>

      {createError && (
        <Alert status="danger" className="mb-6">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Could not create meeting</Alert.Title>
            <Alert.Description>{createError}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-accent-soft-hover p-4 space-y-3">
              <div className="h-5 w-48 bg-background-secondary rounded" />
              <div className="h-3 w-full bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <p className="text-center text-muted py-12">No meetings yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {meetings.map((meeting) => (
            <Link key={meeting.id} href={`/discussion/meetings/${meeting.id}`}>
              <Card className="flex flex-col cursor-pointer hover:shadow-sm">
                <Card.Header className="w-full flex gap-2">
                  <div>
                    <Card.Title className="text-lg">{meeting.title}</Card.Title>
                    <Card.Description>
                      {new Date(meeting.started_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      })}{" "}
                      by{" "}
                      <span className="font-bold text-foreground">
                        {meeting.organizations?.org_name || "Organization"}
                      </span>
                    </Card.Description>
                  </div>
                </Card.Header>
                <Card.Content className="flex-1">
                  <div className="flex gap-2">
                    <Chip>{meeting.status}</Chip>
                    {meeting.transcript && (
                      <Chip color="success" variant="soft">
                        Transcript available
                      </Chip>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
