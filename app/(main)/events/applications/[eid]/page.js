"use client";

import { supabase } from "@/lib/supabase";
import {
  Avatar,
  Button,
  Chip,
  Table,
  Select,
  ListBox,
  Description,
  Alert,
} from "@heroui/react";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash } from "lucide-react";
import { Modal } from "@heroui/react";

function getEventStatus(startDate, endDate) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && now >= start && (!end || now <= end)) return { label: "Ongoing", color: "success" };
  if (end && now > end) return { label: "Completed", color: "default" };
  if (start && now < start) return { label: "Scheduled", color: "warning" };
  return { label: "Upcoming", color: "secondary" };
}

const STATUS_OPTIONS = [
  { id: "registered", label: "Registered" },
  { id: "attended", label: "Attended" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS = {
  registered: "primary",
  attended: "success",
  cancelled: "danger",
};

export default function EventRegistrationsDetail({ params }) {
  const { eid } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: eventData } = await supabase
          .from("events")
          .select("id, title, start_date, end_date, location, type, org_id, organizations(org_name)")
          .eq("id", eid)
          .single();

        if (eventData) {
          setEvent(eventData);
        }

        const { data: regData } = await supabase
          .from("event_registrations")
          .select("id, status, registered_at, users(name, email, pic)")
          .eq("event_id", eid)
          .order("registered_at", { ascending: false });

        if (regData) {
          setRegistrations(regData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eid]);

  const handleStatusChange = async (registrationId, newStatus) => {
    setUpdatingId(registrationId);
    try {
      const { error } = await supabase
        .from("event_registrations")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", registrationId);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, status: newStatus } : reg
        )
      );
    } catch (err) {
      console.error("Update status error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteEvent = async () => {
    setDeleting(true);
    try {
      await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eid);

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eid);

      if (error) throw error;

      router.push("/events/applications");
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("Failed to delete event. Please try again.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex mx-auto p-3 md:p-6 flex-col gap-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-accent-soft-hover rounded" />
          <div className="h-12 bg-accent-soft-hover rounded" />
          <div className="h-12 bg-accent-soft-hover rounded" />
        </div>
      </div>
    );
  }

  if (!event) {
    return <p className="p-6">Event not found</p>;
  }

  const eventStatus = getEventStatus(event.start_date, event.end_date);

  return (
    <div className="w-full flex mx-auto p-3 md:p-6 flex-col gap-4">
      <Link
        href="/events/applications"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Event Applications
      </Link>

      {message && (
        <Alert color="warning" className="mb-2">
          {message}
        </Alert>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">{event.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" color={eventStatus.color} variant="soft">{eventStatus.label}</Chip>
            <Chip variant="secondary">{event.type}</Chip>
            <Chip variant="primary">{event.organizations?.org_name}</Chip>
            <Chip color="primary" variant="soft">
              {registrations.length} Registered
            </Chip>
          </div>
          {event.start_date && (
            <p className="text-sm text-muted mt-2">
              {event.start_date}{event.end_date ? ` to ${event.end_date}` : ""}
              {event.location ? ` — ${event.location}` : ""}
            </p>
          )}
        </div>
        <Modal open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <Button variant="danger-soft" color="danger">
            <Trash className="size-4" />
            Delete Event
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Delete Event</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <p>Are you sure you want to delete <strong>{event.title}</strong>? This will also remove all {registrations.length} registrations. This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" variant="secondary">Cancel</Button>
                  <Button
                    color="danger"
                    onClick={handleDeleteEvent}
                    isLoading={deleting}
                  >
                    Delete Event & Registrations
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      {registrations.length === 0 ? (
        <p className="text-muted py-12 text-center">No registrations yet.</p>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Event registrants" className="min-w-[700px]">
              <Table.Header>
                <Table.Column isRowHeader>User</Table.Column>
                <Table.Column>Email</Table.Column>
                <Table.Column>Registered</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column className="flex justify-end">Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {registrations.map((reg) => (
                  <Table.Row key={reg.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {reg.users?.pic ? (
                            <Avatar.Image src={reg.users.pic} alt={reg.users.name} />
                          ) : null}
                          <Avatar.Fallback>
                            {reg.users?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </Avatar.Fallback>
                        </Avatar>
                        <p className="font-medium text-sm">
                          {reg.users?.name || "Unknown"}
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm">{reg.users?.email || "-"}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs text-muted">
                        {new Date(reg.registered_at).toLocaleDateString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Select
                        placeholder="Status"
                        value={reg.status}
                        onChange={(val) => handleStatusChange(reg.id, val)}
                        className="min-w-[140px]"
                        isLoading={updatingId === reg.id}
                      >
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {STATUS_OPTIONS.map((opt) => (
                              <ListBox.Item
                                key={opt.id}
                                id={opt.id}
                                textValue={opt.label}
                              >
                                {opt.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </Table.Cell>
                    <Table.Cell className="flex items-center justify-end gap-1">
                      {reg.status === "registered" && (
                        <Button
                          size="sm"
                          variant="danger-soft"
                          onPress={() => handleStatusChange(reg.id, "cancelled")}
                        >
                          Cancel
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
