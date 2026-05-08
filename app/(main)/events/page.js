"use client";

import { Button, Card, CloseButton } from "@heroui/react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { data } from "@/config/data";
import { Chip } from "@heroui/react";
import { Separator } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";

export default function EventsPage() {
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
  return (
    <div className="container py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Learn, connect, and grow with Mentora events
          </p>
        </div>
        <Link href="/events/create">
          <Button size="sm">
            <Plus className="mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <Card className="w-full items-stretch md:flex-row cursor-pointer">
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
