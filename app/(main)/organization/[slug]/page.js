"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Separator } from "@heroui/react";
import { JobDrawer } from "@/components/custom/drawer-jobs";
import { supabase } from "@/lib/supabase";

export default function OrganizationProfile({ params }) {
  const { slug } = use(params);
  const [organization, setOrganization] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrganization() {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", slug)
        .single();

      if (!error && data) {
        setOrganization(data);
      }

      const { data: jobData } = await supabase
        .from("jobs")
        .select("*")
        .eq("org_id", slug);

      if (jobData) {
        setJobs(jobData);
      }

      setLoading(false);
    }

    fetchOrganization();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-12 px-4 animate-pulse space-y-4">
        <div className="flex gap-3">
          <div className="w-32 h-32 rounded-md bg-accent-soft-hover shrink-0" />
          <div className="flex flex-col gap-2">
            <div className="h-8 w-48 bg-accent-soft-hover rounded" />
            <div className="h-4 w-32 bg-accent-soft-hover rounded" />
          </div>
        </div>
        <Separator className="my-2" />
        <div className="h-4 w-full bg-accent-soft-hover rounded" />
        <div className="h-4 w-3/4 bg-accent-soft-hover rounded" />
      </div>
    );
  }

  if (!organization) {
    return <p className="p-6">Organization not found</p>;
  }

  return (
    <div className="py-12 px-4">
      <div className="w-full flex gap-3">
        <div className="w-32 h-32 rounded-md overflow-hidden bg-gray-100 shrink-0">
          {organization.image_url ? (
            <img
              src={organization.image_url}
              alt={organization.org_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-accent-soft-hover flex items-center justify-center">
              <span className="text-2xl font-semibold text-muted">{organization.org_name?.[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold">{organization.org_name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Category: {organization.company_type}
          </p>
          {organization.website && (
            <a href={`https://${organization.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              {organization.website}
            </a>
          )}
          {organization.city && (
            <a href={"#"} className="text-orange-500">
              {organization.city}, {organization.country}
            </a>
          )}
        </div>
      </div>

      <Separator className="my-2" />

      <div className="space-y-1 min-h-32">
        <h1 className="text-2xl font-bold">About</h1>
        <p>{organization.description}</p>
      </div>

      {organization.founder_name && (
        <div className="space-y-1 mt-4">
          <h1 className="text-2xl font-bold">Founder</h1>
          <p>{organization.founder_name}</p>
          {organization.founder_email && <p className="text-sm text-muted">{organization.founder_email}</p>}
        </div>
      )}

      {jobs.length > 0 && (
        <div className="space-y-1 mt-4">
          <h1 className="text-2xl font-bold">Jobs</h1>
          <div className="grid gap-6 md:grid-cols-3">
            {jobs.map((job, idx) => (
              <JobDrawer key={idx} job={job} showImage={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
