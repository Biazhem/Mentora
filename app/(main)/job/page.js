"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Trash } from "lucide-react";
import { data } from "@/config/data";
import { InputGroup, Select, ListBox } from "@heroui/react";
import { JobDrawer } from "@/components/custom/drawer-jobs";

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const jobs = data.jobs.map((job, idx) => ({
    id: idx + 1,
    title: job.title,
    company: data.organizations[job.org_index].name,
    companySlug: data.organizations[job.org_index].name
      .toLowerCase()
      .replace(/\s+/g, "-"),
    location: "Remote",
    type: job.type[0],
    timing: job.timing[0],
    description: job.description,
    image: data.organizations[job.org_index].logo,
  }));
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || job.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="py-12">
      <div className="mb-4 px-4">
        <h1 className="text-2xl font-semibold text-left">Job Opportunities</h1>
        <p className="text-sm text-muted">
          Carefully selected roles to help you grow your career
        </p>
      </div>

      <div className="px-4 mb-8 flex justify-between gap-3 flex-wrap">
        <InputGroup>
          <InputGroup.Prefix>
            <Search className="size-4" />
          </InputGroup.Prefix>
          <InputGroup.Input
            placeholder="Search jobs"
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
                <ListBox.Item value="Full-time">Full-time</ListBox.Item>
                <ListBox.Item value="Part-time">Part-time</ListBox.Item>
                <ListBox.Item value="Internship">Internship</ListBox.Item>
                <ListBox.Item value="Contract">Contract</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Link href="/job/create">
            <Button>
              <Plus />
              Create
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 grid gap-6 md:grid-cols-2">
        {filteredJobs.map((job) => (
          <JobDrawer key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
