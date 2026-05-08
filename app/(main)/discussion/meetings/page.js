"use client";


import { Button } from "@heroui/react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { data } from "@/config/data";
import { UsersIcon } from "lucide-react";
import { Card } from "@heroui/react"
import { Chip } from "@heroui/react";

export default function Meeting() {
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
          <h1 className="text-2xl font-semibold">Recent Meetings</h1>
          <p className="text-sm text-muted-foreground">
            Learn, discuss, and grow with Meetups
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/discussion/meetings/create">
            <Button>
              <Plus className="mr-2" />
              Create Meeting
            </Button>
          </Link>
          <Link href="/discussion/meetings/join?jid=u29012090312">
            <Button>
              <UsersIcon className="mr-2" />
              Join Meeting
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {events.map((event) => (
          <Card
            key={event.id}
            className="flex flex-col cursor-pointer hover:shadow-sm"
          >
            <Card.Header className="w-full flex gap-2">
            
              <div>
                <Card.Title className="text-lg">{event.title}</Card.Title>
                <Card.Description>
                  {event.date}, {event.location}, by{" "}
                  <span className="font-bold text-foreground">
                    {organization[event.org_id]?.title}
                  </span>
                </Card.Description>
              </div>
            </Card.Header>

            <Card.Content className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                {event.description}
              </p>

              <div className="flex gap-2">
                <Chip>{event.type}</Chip>
                <Chip color="accent" variant="primary">{event.status}</Chip>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
}
