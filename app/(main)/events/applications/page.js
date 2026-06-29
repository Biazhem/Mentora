"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  Table,
  Chip,
  Button,
  Alert,
  Avatar,
  InputGroup,
  ListBox,
  Select,
} from "@heroui/react";
import { Search, Trash } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS = {
  registered: "primary",
  cancelled: "danger",
  attended: "success",
};

export default function EventRegistrationsPage() {
  const { user, isLoaded } = useUser();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    async function fetchRegistrations() {
      if (!isLoaded || !user) return;

      setLoading(true);
      try {
        const { data: userData, error: userErr } = await supabase
          .from("users")
          .select("id, clerk_id")
          .eq("clerk_id", user.id)
          .single();

        if (userErr || !userData) {
          setDebugInfo("User not found in users table");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/events/registrations?user_id=${userData.id}`);
        const data = await res.json();

        if (data.registrations) {
          setRegistrations(data.registrations);
          setDebugInfo(`Found ${data.registrations.length} registrations`);
        } else {
          setDebugInfo(data.error || "No registrations found");
        }
      } catch (err) {
        setDebugInfo(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchRegistrations();
  }, [isLoaded, user]);

  const handleCancel = async (registrationId) => {
    await fetch("/api/events/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: registrationId, status: "cancelled" }),
    });

    setRegistrations((prev) =>
      prev.map((reg) =>
        reg.id === registrationId ? { ...reg, status: "cancelled" } : reg
      )
    );
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.event?.title?.toLowerCase().includes(search.toLowerCase()) ||
      reg.org?.org_name?.toLowerCase().includes(search.toLowerCase()) ||
      reg.event?.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">My Event Registrations</h1>
        <p className="text-sm text-muted">
          Track the events you've registered for
        </p>
      </div>

      {debugInfo && (
        <Alert color="info" className="mb-4">
          {debugInfo}
        </Alert>
      )}

      <div className="mb-8 flex justify-between gap-3 flex-wrap">
        <InputGroup>
          <InputGroup.Prefix>
            <Search className="size-4" />
          </InputGroup.Prefix>
          <InputGroup.Input
            placeholder="Search events"
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
                <ListBox.Item value="registered">Registered</ListBox.Item>
                <ListBox.Item value="attended">Attended</ListBox.Item>
                <ListBox.Item value="cancelled">Cancelled</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-accent-soft-hover rounded" />
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <Alert color="info">
          You haven't registered for any events yet.{" "}
          <Link href="/events" className="underline">Browse events</Link>
        </Alert>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Event registrations" className="min-w-[700px]">
              <Table.Header>
                <Table.Column isRowHeader>Event</Table.Column>
                <Table.Column>Organization</Table.Column>
                <Table.Column>Date</Table.Column>
                <Table.Column>Location</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column className="justify-end">Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {filteredRegistrations.map((reg) => (
                  <Table.Row key={reg.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {reg.org?.image_url ? (
                            <Avatar.Image src={reg.org.image_url} alt={reg.org.org_name} />
                          ) : null}
                          <Avatar.Fallback>
                            {reg.org?.org_name?.[0]?.toUpperCase() || "E"}
                          </Avatar.Fallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{reg.event?.title || "Unknown"}</p>
                          <p className="text-xs text-muted">{reg.event?.type}</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm">{reg.org?.org_name || "-"}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm">
                        <p>{reg.event?.start_date || "-"}</p>
                        {reg.event?.end_date && (
                          <p className="text-xs text-muted">to {reg.event.end_date}</p>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm">{reg.event?.location || "TBA"}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <Chip
                        color={STATUS_COLORS[reg.status] || "default"}
                        variant="soft"
                        size="sm"
                      >
                        {reg.status}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell className="flex items-center justify-end gap-1">
                      {reg.status === "registered" && (
                        <Button
                          size="sm"
                          variant="danger-soft"
                          onPress={() => handleCancel(reg.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {!(reg.status === "registered") && (
                        <Button
                          size="sm"
                          variant="danger-soft"
                          isDisabled
                        >
                          Canceled
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
