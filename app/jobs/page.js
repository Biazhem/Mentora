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

const jobs = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechNova",
    location: "Remote",
    type: "Internship",
    description:
      "Join the frontend team to build clean, accessible interfaces using React and modern UI tools.",
  },
  {
    id: 2,
    title: "Junior Backend Developer",
    company: "DataSphere",
    location: "Islamabad",
    type: "Full Time",
    description:
      "Work on scalable APIs and databases using Node.js and PostgreSQL.",
  },
];

export default function JobsPage() {
  return (
    <div className="w-full">
      <div className="mb-10">
        <div className="w-full flex justify-between">
          <p className="text-2xl font-semibold tracking-tight">
            Job Opportunities
          </p>
          {/* Create a Job */}
          <Link href={"/jobs/create"}>
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

      <div className="grid gap-6 md:grid-cols-2">
        {jobs.map((job) => (
          <Link href={`/jobs/details?det=${job.id}`}>
            <Card
              key={job.id}
              className="hover:shadow-sm transition w-full flex flex-col"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription className="text-sm">
                  <Link href={`/organizations/${job.company}`}>
                    {job.company}
                  </Link>
                  , {job.location}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
                  {job.description}
                </p>

                <span className="inline-flex text-xs font-medium px-3 py-1 rounded-full bg-secondary">
                  {job.type}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
