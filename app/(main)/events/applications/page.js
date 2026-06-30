"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { Alert, Button, Chip } from "@heroui/react";
import { Users } from "lucide-react";
import Link from "next/link";

function getEventStatus(startDate, endDate) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && now >= start && (!end || now <= end)) return { label: "Ongoing", color: "success" };
  if (end && now > end) return { label: "Completed", color: "default" };
  if (start && now < start) return { label: "Scheduled", color: "warning" };
  return { label: "Upcoming", color: "secondary" };
}

export default function EventApplicationsPage() {
  const selectedOrganizationId = useOrgSelectorStore((s) => s.selectedOrganizationId);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      if (!selectedOrganizationId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: eventData } = await supabase
        .from("events")
        .select("id, title, start_date, end_date, location, type, org_id")
        .eq("org_id", selectedOrganizationId)
        .order("start_date", { ascending: false });

      if (eventData && eventData.length > 0) {
        const eventIds = eventData.map((e) => e.id);

        const { data: regCounts } = await supabase
          .from("event_registrations")
          .select("event_id")
          .in("event_id", eventIds)
          .eq("status", "registered");

        const counts = {};
        (regCounts || []).forEach((r) => {
          counts[r.event_id] = (counts[r.event_id] || 0) + 1;
        });

        const enriched = eventData.map((e) => ({
          ...e,
          registrant_count: counts[e.id] || 0,
        }));

        setEvents(enriched);
      }
      setLoading(false);
    }

    fetchEvents();
  }, [selectedOrganizationId]);

  if (!selectedOrganizationId) {
    return (
      <div className="py-12 px-4">
        <Alert color="warning">Select an organization from the header to view event applications.</Alert>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Event Registrations</h1>
        <p className="text-sm text-muted">Manage registrations for your organization's events</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-accent-soft-hover p-4 space-y-3">
              <div className="h-5 w-48 bg-background-secondary rounded" />
              <div className="h-3 w-32 bg-background-secondary rounded" />
              <div className="h-6 w-24 bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-muted py-12 text-center">No events found for this organization.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => {
            const eventStatus = getEventStatus(event.start_date, event.end_date);
            return (
              <Link key={event.id} href={`/events/applications/${event.id}`}>
                <div className="rounded-xl border p-4 hover:shadow-md transition cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted">{event.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" color={eventStatus.color} variant="soft">
                        {eventStatus.label}
                      </Chip>
                      <Chip color="primary" variant="soft">
                        <div className="flex items-center gap-1">
                          <Users className="size-3" />
                          {event.registrant_count}
                        </div>
                      </Chip>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Chip size="sm" variant="secondary">
                      {event.start_date || "TBA"}
                      {event.end_date ? ` to ${event.end_date}` : ""}
                    </Chip>
                    {event.location && (
                      <Chip size="sm" variant="secondary">{event.location}</Chip>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
