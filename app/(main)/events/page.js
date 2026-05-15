"use client";

import { useState } from "react";
import { Button, Card, CloseButton } from "@heroui/react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Trash } from "lucide-react";
import { data } from "@/config/data";
import { Chip, InputGroup, ListBox, Select } from "@heroui/react";
import { Separator } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Transform mock data to match component structure
  const organization = data.organizations.map((org) => ({
    image: org.logo,
    title: org.name,
  }));

  const events = data.events.map((event, idx) => ({
    id: idx + 1,
    org_id: event.org_index,
    title: event.title,
    date: new Date(event.start_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    location: event.location,
    description: event.description,
    status: "Upcoming",
    type: event.type,
    startDate: event.start_date,
    endDate: event.end_date,
  }));
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || event.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="py-12">
      <div className="mb-4 px-4">
        <h1 className="text-2xl font-semibold text-left">Events</h1>
        <p className="text-sm text-muted">Learn, connect, and grow with Mentora events</p>
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
          <Button isIconOnly variant="danger-soft" onPress={() => setTypeFilter("all")}>
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

      <div className="px-4 grid gap-6 md:grid-cols-2">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="w-full items-stretch md:flex-row cursor-pointer">
            <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
              <img
                alt="alts"
                className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                src={organization[event.org_id].image}
              />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <Card.Header className="gap-1">
                <Card.Title className="pr-8">{event.title}</Card.Title>
                <Card.Description>{event.description}</Card.Description>
                <Button 
                  size="sm"  
                  variant="secondary"
                  className="absolute top-2 right-2"
                >{organization[event.org_id].title}<ArrowUpRight/></Button>
              </Card.Header>
              <Card.Footer className="mt-auto flex gap-1">
                  <Chip>{event.type}</Chip>
                  <Chip>{event.location}</Chip>
                  -
                  <Chip> {event.startDate.split(" ")[0].replaceAll("-","/")} </Chip>
                  <Chip> {event.endDate.split(" ")[0].replaceAll("-","/")} </Chip>
                  
              </Card.Footer>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
