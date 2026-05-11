"use client";

import React from "react";
import { Calendar, Users, Video } from "lucide-react";
import { Button, Card, Chip, Label, ProgressBar, Separator, Surface } from "@heroui/react";
import { ChartBarDefault } from "@/components/custom/graphs/bar-chart";

const chartConfig = {
  count: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
};

export default function MentorDashboard() {
  const myStudents = [
    { id: 1, name: "Zaid Khan", joined: "2024-01-10", progress: 72 },
    { id: 2, name: "Sara Lee", joined: "2024-02-15", progress: 54 },
    { id: 3, name: "Ali Ahmed", joined: "2024-03-01", progress: 88 },
  ];

  const joinedTrendData = [
    { month: "Jan", count: 2 },
    { month: "Feb", count: 5 },
    { month: "Mar", count: 8 },
    { month: "Apr", count: 12 },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Surface variant="secondary" className="rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Mentor Space</p>
            <h1 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
            <p className="text-sm text-muted">Manage student progress, sessions, and mentorship flow.</p>
          </div>
          <Chip color="accent" variant="soft">Team Health: Strong</Chip>
        </div>
      </Surface>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="secondary">
          <Card.Header className="flex flex-row items-center justify-between">
            <Card.Title className="text-sm">Total Students</Card.Title>
            <Users className="h-4 w-4 text-blue-600" />
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">{myStudents.length}</div>
            <p className="text-xs text-muted">Active mentees</p>
          </Card.Content>
        </Card>

        <Card variant="secondary">
          <Card.Header className="flex flex-row items-center justify-between">
            <Card.Title className="text-sm">Live Sessions</Card.Title>
            <Video className="h-4 w-4 text-green-600" />
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">4</div>
            <p className="text-xs text-muted">Running this week</p>
          </Card.Content>
        </Card>

        <Card variant="secondary">
          <Card.Header className="flex flex-row items-center justify-between">
            <Card.Title className="text-sm">Upcoming Meetings</Card.Title>
            <Calendar className="h-4 w-4 text-purple-600" />
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">2</div>
            <p className="text-xs text-muted">Scheduled next 3 days</p>
          </Card.Content>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <Card.Header>
            <Card.Title>Student Onboarding Trend</Card.Title>
            <Card.Description>Monthly student intake and team growth.</Card.Description>
          </Card.Header>
          <Card.Content>
            <ChartBarDefault
              data={joinedTrendData}
              config={chartConfig}
              title=""
              description=""
            />
          </Card.Content>
        </Card>

        <Card className="lg:col-span-3">
          <Card.Header>
            <Card.Title>My Team</Card.Title>
            <Card.Description>Progress snapshot for each mentee.</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-3">
            {myStudents.map((student) => (
              <Card key={student.id} variant="transparent" className="border p-3">
                <Card.Content className="space-y-3 p-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted">Joined: {student.joined}</p>
                    </div>
                    <Button size="sm" variant="outline">Profile</Button>
                  </div>
                  <ProgressBar aria-label={`${student.name} progress`} color="success" size="sm" value={student.progress}>
                    <Label>Progress</Label>
                    <ProgressBar.Output />
                    <ProgressBar.Track>
                      <ProgressBar.Fill />
                    </ProgressBar.Track>
                  </ProgressBar>
                </Card.Content>
              </Card>
            ))}
            <Separator variant="secondary" />
            <Chip color="success" variant="soft">Average completion: 71%</Chip>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
