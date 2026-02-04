"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

const events = [
  {
    id: 1,
    title: "Mentora Career Bootcamp",
    date: "12 March 2026",
    location: "Online",
    description:
      "A focused bootcamp covering career planning, CV reviews, and mentor guidance for final year students.",
    status: "Upcoming",
  },
  {
    id: 2,
    title: "Alumni Connect Session",
    date: "20 March 2026",
    location: "University Auditorium",
    description:
      "An interactive session with Mentora alumni working in top tech companies.",
    status: "Open",
  },
]

export default function EventsPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-sm text-muted-foreground">
          Learn, connect, and grow with Mentora events
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {events.map(event => (
          <Card key={event.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription>
                {event.date}, {event.location}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                {event.description}
              </p>

              <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-secondary">
                {event.status}
              </span>
            </CardContent>

            <CardFooter className="flex gap-3 justify-between">
              <Button variant="outline" className="w-full">
                Register
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
