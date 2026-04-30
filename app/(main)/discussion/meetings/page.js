"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { data } from "@/config/data";
import { UsersIcon } from "lucide-react";

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
            <Button size="lg">
              <Plus className="mr-2" />
              Create Meeting
            </Button>
          </Link>
          <Link href="/discussion/meetings/join?jid=u29012090312">
            <Button size="lg">
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
            <CardHeader className="w-full flex gap-2">
            
              <div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription>
                  {event.date}, {event.location}, by{" "}
                  <span className="font-bold text-foreground">
                    {organization[event.org_id]?.title}
                  </span>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                {event.description}
              </p>

              <div className="flex gap-2">
                <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-secondary">
                  {event.status}
                </span>
                <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  {event.type}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
