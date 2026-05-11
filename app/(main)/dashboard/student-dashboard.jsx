"use client";

import React from "react";
import { Briefcase, Calendar, Clock, Sparkles } from "lucide-react";
import { data, tasks } from "@/config/data";
import { Card, Chip, Label, ProgressBar, Separator, Surface, Table } from "@heroui/react";

export default function StudentDashboard() {
  const appliedJobs = [
    { id: 1, title: "Frontend Developer", company: "Acme Inc", status: "Shortlisted" },
    { id: 2, title: "AI Engineer", company: "TechNova", status: "Reviewing" },
  ];

  const recentTasks = tasks.slice(0, 4);
  const joinedEvents = data.events.slice(0, 3);
  const completedTasks = recentTasks.filter((task) => task.status === "Completed").length;
  const progressValue = recentTasks.length ? Math.round((completedTasks / recentTasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Surface variant="secondary" className="rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Student Space</p>
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-sm text-muted">Track applications, tasks, and weekly progress in one place.</p>
          </div>
          <Chip color="accent" variant="soft">
            <Sparkles className="h-3.5 w-3.5" />
            <Chip.Label>Momentum {progressValue}%</Chip.Label>
          </Chip>
        </div>
      </Surface>

      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="secondary">
          <Card.Header className="flex flex-row items-center justify-between">
            <Card.Title className="text-sm">Applied Jobs</Card.Title>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">{appliedJobs.length}</div>
            <p className="text-xs text-muted">Active applications this month</p>
          </Card.Content>
        </Card>

        <Card variant="secondary">
          <Card.Header className="flex flex-row items-center justify-between">
            <Card.Title className="text-sm">Pending Tasks</Card.Title>
            <Clock className="h-4 w-4 text-orange-600" />
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">{recentTasks.filter((task) => task.status !== "Completed").length}</div>
            <p className="text-xs text-muted">Need your attention</p>
          </Card.Content>
        </Card>

        <Card variant="secondary">
          <Card.Header className="flex flex-row items-center justify-between">
            <Card.Title className="text-sm">Joined Events</Card.Title>
            <Calendar className="h-4 w-4 text-purple-600" />
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold">{joinedEvents.length}</div>
            <p className="text-xs text-muted">Registered sessions</p>
          </Card.Content>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Application Status</Card.Title>
            <Card.Description>Recent job applications and live status.</Card.Description>
          </Card.Header>
          <Card.Content>
            <Table>
              <Table.ScrollContainer>
                <Table.Content aria-label="Applied jobs table" className="min-w-[560px]">
                  <Table.Header>
                    <Table.Column isRowHeader id="title">Role</Table.Column>
                    <Table.Column id="company">Company</Table.Column>
                    <Table.Column id="status">Status</Table.Column>
                  </Table.Header>
                  <Table.Body items={appliedJobs}>
                    {(job) => (
                      <Table.Row id={job.id}>
                        <Table.Cell>{job.title}</Table.Cell>
                        <Table.Cell>{job.company}</Table.Cell>
                        <Table.Cell>
                          <Chip color={job.status === "Shortlisted" ? "success" : "warning"} size="sm" variant="soft">
                            {job.status}
                          </Chip>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Task Completion</Card.Title>
            <Card.Description>Based on your latest tasks.</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-4">
            <ProgressBar aria-label="Task completion" color="accent" value={progressValue}>
              <Label>Completion</Label>
              <ProgressBar.Output />
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>

            <Separator variant="secondary" />

            <div className="space-y-3">
              {recentTasks.map((task) => (
                <Card key={task.id} variant="transparent" className="border p-3">
                  <Card.Content className="flex items-center justify-between gap-3 p-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted">Due: {task.dueDate}</p>
                    </div>
                    <Chip
                      color={task.status === "Completed" ? "success" : "warning"}
                      size="sm"
                      variant="secondary"
                    >
                      {task.status}
                    </Chip>
                  </Card.Content>
                </Card>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
