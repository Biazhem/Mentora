"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Trash } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import {
  Modal,
  Description,
  Separator,
  Chip,
  InputGroup,
  ListBox,
  Select,
  Button,
  Card,
  Avatar,
  Surface,
} from "@heroui/react";
import { FacebookLogoIcon, GlobeIcon, InstagramLogoIcon, TwitterLogoIcon } from "@phosphor-icons/react";
import { MarkdownRenderer } from "@/components/custom/MarkdownRenderer";
import { supabase } from "@/lib/supabase";

function getSocialIcon(url) {
  const lower = url.toLowerCase();
  if (lower.includes("instagram")) return <InstagramLogoIcon />;
  if (lower.includes("twitter") || lower.includes("x.com")) return <TwitterLogoIcon />;
  if (lower.includes("facebook")) return <FacebookLogoIcon />;
  return null;
}

function getDomainLetter(url) {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return hostname.charAt(0).toUpperCase();
  } catch {
    return "L";
  }
}

function EventLinks({ links }) {
  if (!Array.isArray(links) || links.length === 0) return null;

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {links.map((link, idx) => {
        const socialIcon = getSocialIcon(link.url);
        return (
          <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
            <Button size="lg" isIconOnly>
              {socialIcon || <span className="text-sm font-bold">{getDomainLetter(link.url)}</span>}
            </Button>
          </a>
        );
      })}
    </div>
  );
}

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [events, setEvents] = useState([]);
  const [organizations, setOrganizations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data: eventsData, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !eventsData) {
        setLoading(false);
        return;
      }

      const orgIds = [...new Set(eventsData.map((e) => e.org_id))];

      const { data: orgsData } = await supabase
        .from("organizations")
        .select("id, org_name, image_url")
        .in("id", orgIds);

      const orgMap = {};
      if (orgsData) {
        orgsData.forEach((org) => {
          orgMap[org.id] = { name: org.org_name, image: org.image_url };
        });
      }

      setOrganizations(orgMap);
      setEvents(eventsData);
      setLoading(false);
    }

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="py-12">
      <div className="mb-4 px-4">
        <h1 className="text-2xl font-semibold text-left">Events</h1>
        <p className="text-sm text-muted">
          Learn, connect, and grow with Mentora events
        </p>
      </div>

      <div className="px-4 mb-8 flex justify-between gap-3 flex-wrap">
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
          <Button variant="secondary">
            <SlidersHorizontal />
            Filter
          </Button>
          <Button
            isIconOnly
            variant="danger-soft"
            onPress={() => setTypeFilter("all")}
          >
            <Trash />
          </Button>
          <Select
            onValueChange={setTypeFilter}
            defaultValue="all"
            className="min-w-[140px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item value="all">All Types</ListBox.Item>
                <ListBox.Item value="Hackathon">Hackathon</ListBox.Item>
                <ListBox.Item value="Webinar">Webinar</ListBox.Item>
                <ListBox.Item value="Workshop">Workshop</ListBox.Item>
                <ListBox.Item value="Meetup">Meetup</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Link href="/events/create">
            <Button>
              <Plus />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="px-4 grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-accent-soft-hover p-4 space-y-3">
              <div className="h-32 bg-background-secondary rounded-2xl" />
              <div className="h-5 w-40 bg-background-secondary rounded" />
              <div className="h-3 w-full bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 grid gap-6 md:grid-cols-2">
          {filteredEvents.map((event) => {
            const org = organizations[event.org_id] || {};
            return (
              <Modal key={event.id}>
                <Modal.Trigger>
                  <Card className="w-full items-stretch md:flex-row cursor-pointer">
                    <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px] bg-accent-soft-hover">
                      {org.image ? (
                        <img
                          alt={org.name}
                          className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                          src={org.image}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-semibold text-muted">{org.name?.[0]?.toUpperCase() || "E"}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3">
                      <Card.Header className="gap-1">
                        <Card.Title className="pr-8">{event.title}</Card.Title>
                        <Card.Description className="line-clamp-3">{event.description}</Card.Description>
                        <Button size="sm" variant="secondary" className="absolute top-2 right-2">
                          {org.name || "Unknown"}
                          <ArrowUpRight />
                        </Button>
                      </Card.Header>
                      <Card.Footer className="mt-auto flex gap-1 flex-wrap">
                        {event.type && <Chip>{event.type}</Chip>}
                        {event.location && <Chip>{event.location}</Chip>}
                        {event.start_date && <Chip>{event.start_date}</Chip>}
                        {event.end_date && <Chip>{event.end_date}</Chip>}
                      </Card.Footer>
                    </div>
                  </Card>
                </Modal.Trigger>
                <Modal.Backdrop>
                  <Modal.Container size="cover">
                    <Modal.Dialog>
                      <Modal.CloseTrigger />
                      <Modal.Body>
                        <div className="flex flex-row gap-2 items-start justify-between">
                          <div className="flex flex-row gap-3">
                            <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px] bg-accent-soft-hover">
                              {org.image ? (
                                <img
                                  alt={org.name}
                                  className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                                  src={org.image}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-lg font-semibold text-muted">{org.name?.[0]?.toUpperCase() || "E"}</span>
                                </div>
                              )}
                            </div>
                            <div className="py-2 flex flex-col gap-1">
                              <Modal.Heading className="text-xl">
                                {event.title}
                              </Modal.Heading>
                              <Description>{event.description}</Description>
                              <div className="flex flex-row gap-1">
                                {event.start_date && <Chip>{event.start_date}</Chip>}
                                {event.start_date && event.end_date && <span>-</span>}
                                {event.end_date && <Chip variant="primary" color="accent">{event.end_date}</Chip>}
                              </div>
                              <div className="flex flex-row gap-1">
                                {event.location && <Chip variant="primary" color="accent">{event.location}</Chip>}
                                {event.location && event.type && <span>-</span>}
                                {event.type && <Chip>{event.type}</Chip>}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Modal.Heading level={2} className="mt-3 text-lg">
                          About
                        </Modal.Heading>
                        <Separator className="my-3" />
                        <div className="flex gap-2 w-full">
                          <div className="w-full">
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {event.description}
                            </p>
                          </div>
                          <div className="w-lg space-y-2">
                            {Array.isArray(event.guest) && event.guest.length > 0 && (
                              <Surface
                                className="flex min-w-[320px] flex-col gap-1 rounded-3xl p-3"
                                variant="secondary"
                              >
                                <h3 className="text-base font-semibold text-foreground">
                                  Guests
                                </h3>
                                <div className="flex gap-2 items-center">
                                  {event.guest.map((g, idx) => (
                                    <Avatar key={idx} variant="soft" color="accent">
                                      <Avatar.Fallback>
                                        {g.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
                                      </Avatar.Fallback>
                                    </Avatar>
                                  ))}
                                </div>
                              </Surface>
                            )}
                            <Surface
                              className="flex min-w-[320px] flex-col gap-0 rounded-3xl p-3"
                              variant="secondary"
                            >
                              <h3 className="text-base font-semibold text-foreground">
                                Location
                              </h3>
                              <div className="flex gap-2 items-center">
                                <p className="text-sm">{event.location || "TBA"}</p>
                              </div>
                            </Surface>
                            <Surface
                              className="flex min-w-[320px] flex-col gap-1 rounded-3xl p-3"
                              variant="secondary"
                            >
                              <h3 className="text-base font-semibold text-foreground">
                                Links
                              </h3>
                              <EventLinks links={event.links} />
                            </Surface>
                          </div>
                        </div>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button slot="close" variant="secondary">
                          Close
                        </Button>
                      </Modal.Footer>
                    </Modal.Dialog>
                  </Modal.Container>
                </Modal.Backdrop>
              </Modal>
            );
          })}
          {filteredEvents.length === 0 && (
            <p className="col-span-2 text-center text-muted py-12">No events found.</p>
          )}
        </div>
      )}
    </div>
  );
}
