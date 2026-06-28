"use client";

import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { Avatar, Button, Chip, Table } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

const STATUS_COLORS = {
  pending: "default",
  shortlisted: "accent",
  interviewing: "warning",
  hired: "success",
  rejected: "danger",
  archived: "secondary",
};

export default function AppliedJobsPage() {
  const { user, isLoaded } = useUser();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      if (!isLoaded || !user) return;

      setLoading(true);
      try {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (!userData) {
          setLoading(false);
          return;
        }

        const { data: appData } = await supabase
          .from("job_applications")
          .select(`
            id,
            status,
            applied_at,
            cover_letter,
            resume_url,
            jobs (
              id,
              title,
              job_type,
              city,
              country,
              organizations (org_name)
            )
          `)
          .eq("user_id", userData.id)
          .order("applied_at", { ascending: false });

        if (appData) {
          setApplications(appData);
        }
      } catch (err) {
        console.error("Fetch applications error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [isLoaded, user]);

  if (loading) {
    return (
      <div className="py-12 px-4">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-48 bg-accent-soft-hover rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-accent-soft-hover rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">My Applications</h1>
        <p className="text-sm text-muted">
          Track the status of your job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <p className="text-muted py-12 text-center">You haven't applied to any jobs yet.</p>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Applied jobs" className="min-w-[700px]">
              <Table.Header>
                <Table.Column isRowHeader>Job</Table.Column>
                <Table.Column>Organization</Table.Column>
                <Table.Column>Applied</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column className="flex justify-end">Action</Table.Column>
              </Table.Header>
              <Table.Body>
                {applications.map((app) => (
                  <Table.Row key={app.id}>
                    <Table.Cell>
                      <div>
                        <p className="font-medium text-sm">{app.jobs?.title || "Unknown"}</p>
                        <p className="text-xs text-muted">{app.jobs?.job_type}</p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm">{app.jobs?.organizations?.org_name || "-"}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs text-muted">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Chip
                        color={STATUS_COLORS[app.status] || "default"}
                        variant="soft"
                        size="sm"
                      >
                        {app.status}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell className="flex items-center justify-end">
                      <Link href={`/job/${app.jobs?.id}`}>
                        <Button size="sm" variant="tertiary">
                          <ExternalLink className="size-3" />
                          View
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </div>
  );
}
