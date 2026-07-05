"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { InputGroup, Select, ListBox } from "@heroui/react";
import { JobDrawer } from "@/components/custom/drawer-jobs";

export default function JobsPage() {
  const { user } = useUser();
  const selectedOrganizationId = useOrgSelectorStore(
    (s) => s.selectedOrganizationId,
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [timingFilter, setTimingFilter] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      const { data: jobData, error } = await supabase
        .from("jobs")
        .select("*, organizations(org_name)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && jobData) {
        const mapped = jobData.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.organizations?.org_name || "Unknown",
          location: job.city
            ? `${job.city}, ${job.country}`
            : job.country || "Remote",
          type: job.job_type,
          timing: job.workplace_type,
          description: job.description,
          org_image: null,
          requirements: job.requirements,
          expires_at: job.expires_at,
        }));
        setJobs(mapped);
      }
      setLoading(false);
    }

    fetchJobs();
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      if (!user || !selectedOrganizationId) {
        setIsAdmin(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) {
        setIsAdmin(false);
        return;
      }

      const { data: memberData } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", selectedOrganizationId)
        .eq("user_id", userData.id)
        .maybeSingle();

      setIsAdmin(memberData?.role === "admin");
    }

    checkAdmin();
  }, [user, selectedOrganizationId]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || job.type === typeFilter;
    const matchesTiming = timingFilter === "all" || job.timing === timingFilter;

    return matchesSearch && matchesType && matchesTiming;
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
        <div className="flex items-center gap-2">
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
          {isAdmin && (
            <Link href="/job/applications">
              <Button>Applications</Button>
            </Link>
          )}
          {!isAdmin && (
            <Link href="/job/applied">
              <Button>Applied Jobs</Button>
            </Link>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            selectedKey={typeFilter}
            onSelectionChange={(key) => setTypeFilter(key || "all")}
            className="min-w-[140px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="All Types">
                  All Types
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="fulltime" textValue="Full-time">
                  Full-time
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="parttime" textValue="Part-time">
                  Part-time
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="contract" textValue="Contract">
                  Contract
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="internship" textValue="Internship">
                  Internship
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Select
            selectedKey={timingFilter}
            onSelectionChange={(key) => setTimingFilter(key || "all")}
            className="min-w-[160px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="All Workplaces">
                  All Workplaces
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="remote" textValue="Remote">
                  Remote
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="hybrid" textValue="Hybrid">
                  Hybrid
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="onsite" textValue="On-site">
                  On-site
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          {isAdmin && (
            <Link href="/job/create">
              <Button>
                <Plus />
                Create
              </Button>
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="px-4 grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-accent-soft-hover p-4 space-y-3"
            >
              <div className="h-5 w-40 bg-background-secondary rounded" />
              <div className="h-3 w-full bg-background-secondary rounded" />
              <div className="h-3 w-3/4 bg-background-secondary rounded" />
              <div className="h-6 w-20 bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 grid gap-6 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <JobDrawer key={job.id} job={job} showImage={false} />
          ))}
          {filteredJobs.length === 0 && (
            <p className="col-span-2 text-center text-muted py-12">
              No jobs found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
