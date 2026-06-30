"use client";

import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { Alert, Button, Chip } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";

export default function JobApplicationsPage() {
  const selectedOrganizationId = useOrgSelectorStore((s) => s.selectedOrganizationId);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      if (!selectedOrganizationId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: jobData } = await supabase
        .from("jobs")
        .select("id, title, job_type, status, applicants_count, created_at, expires_at")
        .eq("org_id", selectedOrganizationId)
        .order("created_at", { ascending: false });

      if (jobData) {
        const now = new Date();
        const sorted = [...jobData].sort((a, b) => {
          const aExpired = a.expires_at && new Date(a.expires_at) < now;
          const bExpired = b.expires_at && new Date(b.expires_at) < now;
          if (aExpired && !bExpired) return 1;
          if (!aExpired && bExpired) return -1;
          return 0;
        });
        setJobs(sorted);
      }
      setLoading(false);
    }

    fetchJobs();
  }, [selectedOrganizationId]);

  if (!selectedOrganizationId) {
    return (
      <div className="py-12 px-4">
        <Alert color="warning">Select an organization from the header to view applications.</Alert>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Job Applications</h1>
        <p className="text-sm text-muted">Manage applicants for your organization's jobs</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-accent-soft-hover p-4 space-y-3">
              <div className="h-5 w-48 bg-background-secondary rounded" />
              <div className="h-3 w-32 bg-background-secondary rounded" />
              <div className="h-6 w-24 bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-muted py-12 text-center">No jobs found for this organization.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <Link key={job.id} href={`/job/applications/${job.id}`}>
              <div className="rounded-xl border p-4 hover:shadow-md transition cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted">{job.job_type}</p>
                  </div>
                  <Chip
                    color={job.applicants_count > 0 ? "success" : "default"}
                    variant="soft"
                  >
                    <div className="flex items-center gap-1">
                      <Users className="size-3" />
                      {job.applicants_count || 0}
                    </div>
                  </Chip>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Chip size="sm" variant={job.status === "active" ? "soft" : "secondary"} color={job.status === "active" ? "success" : "default"}>
                    {job.status}
                  </Chip>
                  {job.expires_at && new Date(job.expires_at) < new Date() && (
                    <Chip size="sm" color="danger" variant="soft">
                      Expired
                    </Chip>
                  )}
                  <span className="text-xs text-muted">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
