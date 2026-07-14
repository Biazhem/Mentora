"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  Avatar,
  Button,
  Chip,
  Table,
  Alert,
  InputGroup,
  ListBox,
  Select,
} from "@heroui/react";
import { Search, Trash } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default function MentorRequestsPage() {
  const { user, isLoaded } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [mentorId, setMentorId] = useState(null);

  useEffect(() => {
    async function fetchRequests() {
      if (!isLoaded || !user) return;

      setLoading(true);
      try {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (!userData) {
          setLoading(false);
          return;
        }

        const { data: mentorData } = await supabase
          .from("mentors")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (!mentorData) {
          setLoading(false);
          return;
        }

        setMentorId(mentorData.id);

        const { data: requestData } = await supabase
          .from("mentorship_requests")
          .select(`
            id,
            user_id,
            status,
            message,
            requested_at,
            students (
              name,
              email,
              phone,
              university,
              semester,
              expertise,
              skills
            ),
            users (
              name,
              email,
              pic
            )
          `)
          .eq("mentor_id", mentorData.id)
          .order("requested_at", { ascending: false });

        if (requestData) {
          setRequests(requestData);
        }
      } catch (err) {
        console.error("Fetch requests error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, [isLoaded, user]);

  const handleStatusChange = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      const req = requests.find((r) => r.id === requestId);

      const { error } = await supabase
        .from("mentorship_requests")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: newStatus } : r
        )
      );

      if (req?.user_id) {
        const title = newStatus === "approved"
          ? "Mentorship Request Approved"
          : "Mentorship Request Rejected";
        const message = newStatus === "approved"
          ? "Your mentorship request has been approved! You can now connect with your mentor."
          : "Your mentorship request has been rejected. You can try requesting another mentor.";

        // Notify the student
        await supabase.from("notifications").insert({
          user_id: req.user_id,
          org_id: null,
          type: "mentorship",
          title,
          message,
          entity_id: req.id,
        });

        // Notify the mentor (confirmation)
        if (mentorId) {
          const { data: mentorInfo } = await supabase
            .from("mentors")
            .select("clerk_id")
            .eq("id", mentorId)
            .maybeSingle();
          if (mentorInfo?.clerk_id) {
            const { data: mentorUserRow } = await supabase
              .from("users")
              .select("id")
              .eq("clerk_id", mentorInfo.clerk_id)
              .maybeSingle();
            if (mentorUserRow) {
              const mentorTitle = newStatus === "approved"
                ? "You Approved a Mentorship Request"
                : "You Rejected a Mentorship Request";
              const mentorMessage = newStatus === "approved"
                ? `You approved ${req.students?.name || "a student"}'s mentorship request.`
                : `You rejected ${req.students?.name || "a student"}'s mentorship request.`;

              await supabase.from("notifications").insert({
                user_id: mentorUserRow.id,
                org_id: null,
                type: "mentorship",
                title: mentorTitle,
                message: mentorMessage,
                entity_id: req.id,
              });
            }
          }
        }

        // Send email to student
        const studentEmail = req.students?.email || req.users?.email;
        if (studentEmail) {
          const emailHtml = newStatus === "approved"
            ? `<h2>Mentorship Request Approved</h2><p>Great news! Your mentorship request has been approved. You can now connect with your mentor on Mentora.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/mentors">View Mentors</a></p>`
            : `<h2>Mentorship Request Rejected</h2><p>We're sorry, your mentorship request has been rejected. You can try requesting another mentor.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/mentors">Browse Mentors</a></p>`;
          try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ to: studentEmail, subject: title, html: emailHtml }),
            });
          } catch (e) { console.error("Email error:", e); }
        }
      }
    } catch (err) {
      console.error("Update status error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
      req.students?.university?.toLowerCase().includes(search.toLowerCase()) ||
      req.students?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Mentorship Requests</h1>
        <p className="text-sm text-muted">
          Manage student mentorship requests
        </p>
      </div>

      <div className="mb-8 flex justify-between gap-3 flex-wrap">
        <InputGroup>
          <InputGroup.Prefix>
            <Search className="size-4" />
          </InputGroup.Prefix>
          <InputGroup.Input
            placeholder="Search by name, university, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-fit"
          />
        </InputGroup>

        <div className="flex gap-2 flex-wrap">
          <Button
            isIconOnly
            variant="danger-soft"
            onPress={() => setStatusFilter("all")}
          >
            <Trash />
          </Button>
          <Select
            onValueChange={setStatusFilter}
            defaultValue="all"
            className="min-w-[140px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item value="all">All Status</ListBox.Item>
                <ListBox.Item value="pending">Pending</ListBox.Item>
                <ListBox.Item value="approved">Approved</ListBox.Item>
                <ListBox.Item value="rejected">Rejected</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-accent-soft-hover rounded" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Alert color="info">
          No mentorship requests yet.
        </Alert>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Mentorship requests" className="min-w-[800px]">
              <Table.Header>
                <Table.Column isRowHeader>Student</Table.Column>
                <Table.Column>University</Table.Column>
                <Table.Column>Expertise</Table.Column>
                <Table.Column>Requested</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column className="justify-end">Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {filteredRequests.map((req) => (
                  <Table.Row key={req.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {req.users?.pic ? (
                            <Avatar.Image src={req.users.pic} alt={req.users.name} />
                          ) : null}
                          <Avatar.Fallback>
                            {req.users?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() ||
                              req.students?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() ||
                              "?"}
                          </Avatar.Fallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {req.students?.name || req.users?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted">
                            {req.students?.email || req.users?.email}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm">{req.students?.university || "-"}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm line-clamp-1 max-w-[150px]">
                        {req.students?.expertise || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs text-muted">
                        {new Date(req.requested_at).toLocaleDateString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Chip
                        color={STATUS_COLORS[req.status] || "default"}
                        variant="soft"
                        size="sm"
                      >
                        {req.status}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell className="flex items-center justify-end gap-1">
                      {req.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="soft"
                            color="success"
                            onPress={() => handleStatusChange(req.id, "approved")}
                            isLoading={updatingId === req.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger-soft"
                            onPress={() => handleStatusChange(req.id, "rejected")}
                            isLoading={updatingId === req.id}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {req.status === "approved" && (
                        <Button
                          size="sm"
                          variant="danger-soft"
                          onPress={() => handleStatusChange(req.id, "rejected")}
                          isLoading={updatingId === req.id}
                        >
                          Reject
                        </Button>
                      )}
                      {req.status === "rejected" && (
                        <Button
                          size="sm"
                          variant="soft"
                          color="success"
                          onPress={() => handleStatusChange(req.id, "approved")}
                          isLoading={updatingId === req.id}
                        >
                          Approve
                        </Button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </div>
  );
}
