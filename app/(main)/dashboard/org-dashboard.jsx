"use client";

import React from "react";
import { Briefcase, FileText, MoreHorizontal, TrendingUp, Users } from "lucide-react";
import { data } from "@/config/data";
import { Button, Card, Chip, Label, ProgressBar, Separator, Surface } from "@heroui/react";

const chartConfig = {
  count: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
};

export default function OrgDashboard() {
  const organization = data.organizations[0];
  const orgJobs = data.jobs.filter((job) => job.org_index === 0);

  const applicationData = [
    { month: "Jan", count: 45 },
    { month: "Feb", count: 52 },
    { month: "Mar", count: 38 },
    { month: "Apr", count: 65 },
    { month: "May", count: 48 },
    { month: "Jun", count: 59 },
  ];

  const stats = [
    { title: "Total Jobs", value: orgJobs.length, icon: Briefcase, color: "text-blue-600", note: "Open and managed" },
    { title: "Applications", value: "307", icon: FileText, color: "text-green-600", note: "Across all positions" },
    { title: "Active Candidates", value: "12", icon: Users, color: "text-purple-600", note: "In interview stage" },
    { title: "Hiring Rate", value: "84%", icon: TrendingUp, color: "text-orange-600", note: "Offer acceptance" },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Surface variant="secondary" className="rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Organization Space</p>
            <h1 className="text-3xl font-bold tracking-tight">Organization Dashboard</h1>
            <p className="text-sm text-muted">Welcome back, {organization.name}. Hiring performance at a glance.</p>
          </div>
          <Chip color="success" variant="soft">Pipeline Healthy</Chip>
        </div>
      </Surface>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} variant="secondary">
            <Card.Header className="flex flex-row items-center justify-between">
              <Card.Title className="text-sm">{stat.title}</Card.Title>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </Card.Header>
            <Card.Content>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted">{stat.note}</p>
            </Card.Content>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <Card.Header>
            <Card.Title>Application Trends</Card.Title>
            <Card.Description>Monthly applicant volume and hiring funnel movement.</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-4">
            {/* Chart */}
            <ProgressBar aria-label="Quarterly target" color="accent" value={84}>
              <Label>Quarterly Hiring Target</Label>
              <ProgressBar.Output />
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
          </Card.Content>
        </Card>

        <Card className="lg:col-span-3">
          <Card.Header>
            <Card.Title>Active Jobs</Card.Title>
            <Card.Description>Current openings and quick actions.</Card.Description>
          </Card.Header>
          <Card.Content className="space-y-3">
            {orgJobs.map((job, index) => (
              <Card key={`${job.title}-${index}`} variant="transparent" className="border p-3">
                <Card.Content className="flex items-center justify-between gap-3 p-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{job.title}</p>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" variant="secondary">{job.type[0]}</Chip>
                      <Chip size="sm" color="accent" variant="soft">Open</Chip>
                    </div>
                  </div>
                  <Button isIconOnly size="sm" variant="ghost" aria-label="Job actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </Card.Content>
              </Card>
            ))}
            <Separator variant="secondary" />
            <Button fullWidth variant="secondary">Create New Job Post</Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
