"use client";

import { Card, Button } from "@heroui/react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { data } from "@/config/data";

export default function JobsPage() {
  const jobs = data.jobs.map((job, idx) => ({
    id: idx + 1,
    title: job.title,
    company: data.organizations[job.org_index].name,
    companySlug: data.organizations[job.org_index].name
      .toLowerCase()
      .replace(/\s+/g, "-"),
    location: "Remote",
    type: job.type[0],
    description: job.description,
    image: data.organizations[job.org_index].logo,
  }));

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <div className="w-full flex justify-between">
          <p className="text-2xl font-semibold tracking-tight">
            Job Opportunities
          </p>

          <Link href="/jobs/create">
            <Button size="lg">
              <Plus />
              Create
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-1">
          Carefully selected roles to help you grow your career
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {jobs.map((job) => (
          <Link key={job.id} href={`/jobs/details?det=${job.id}`}>
            <Card className="w-full items-stretch md:flex-row">
              {/* Image */}
              <div className="relative h-[120px] w-full shrink-0 overflow-hidden rounded-xl md:w-[120px]">
                <img
                  src={job.image}
                  alt={job.company}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                {/* Title + company */}
                <Card.Header className="p-0 mb-1">
                  <Card.Title className="text-lg">{job.title}</Card.Title>
                  <Card.Description>
                    {job.company}, {job.location}
                  </Card.Description>
                </Card.Header>

                {/* Description (LEFT / main area) */}
                <p className="text-sm text-muted-foreground text-left mb-3">
                  {job.description}
                </p>

                {/* Footer */}
                <Card.Footer className="p-0 mt-auto flex justify-between items-center">
                  <span className="text-xs px-3 py-1 rounded-full bg-secondary">
                    {job.type}
                  </span>

                  <Button size="sm">Apply</Button>
                </Card.Footer>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
