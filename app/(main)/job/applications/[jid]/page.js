"use client";

import { supabase } from "@/lib/supabase";
import {
  Avatar,
  Button,
  Chip,
  Table,
  Select,
  ListBox,
  TextField,
  Label,
  Input,
  Description,
} from "@heroui/react";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Modal } from "@heroui/react";
import { File } from "lucide-react";

const STATUS_OPTIONS = [
  { id: "pending", label: "Pending" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interviewing", label: "Interviewing" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Rejected" },
  { id: "archived", label: "Archived" },
];

const STATUS_COLORS = {
  pending: "default",
  shortlisted: "primary",
  interviewing: "warning",
  hired: "success",
  rejected: "danger",
  archived: "secondary",
};

export default function JobApplicationsDetail({ params }) {
  const { jid } = use(params);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: jobData } = await supabase
          .from("jobs")
          .select("id, title, job_type, org_id, organizations(org_name)")
          .eq("id", jid)
          .single();

        if (jobData) {
          setJob(jobData);
        }

        const { data: appData } = await supabase
          .from("job_applications")
          .select(
            "id, job_id, student_id, user_id, status, cover_letter, resume_url, applied_at, students(name, email, phone, university, semester, expertise, skills), users(name, email, pic)",
          )
          .eq("job_id", jid)
          .order("applied_at", { ascending: false });

        if (appData) {
          setApplications(appData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [jid]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", applicationId);

      if (error) throw error;

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app,
        ),
      );
    } catch (err) {
      console.error("Update status error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex mx-auto p-3 md:p-6 flex-col gap-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-accent-soft-hover rounded" />
          <div className="h-12 bg-accent-soft-hover rounded" />
          <div className="h-12 bg-accent-soft-hover rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return <p className="p-6">Job not found</p>;
  }

  return (
    <div className="w-full flex mx-auto p-3 md:p-6 flex-col gap-4">
      <Link
        href="/job/applications"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Applications
      </Link>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">{job.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Chip variant="secondary">{job.job_type}</Chip>
            <Chip variant="primary">{job.organizations?.org_name}</Chip>
            <Chip color="primary" variant="soft">
              {applications.length} Applicants
            </Chip>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <p className="text-muted py-12 text-center">No applications yet.</p>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Job applicants"
              className="min-w-[800px]"
            >
              <Table.Header>
                <Table.Column isRowHeader>Applicant</Table.Column>
                <Table.Column>University</Table.Column>
                <Table.Column>Skills</Table.Column>
                <Table.Column>Applied</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column className="flex justify-end">Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {applications.map((app) => (
                  <Table.Row key={app.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {app.users?.pic ? (
                            <Avatar.Image
                              src={app.users.pic}
                              alt={app.users.name}
                            />
                          ) : null}
                          <Avatar.Fallback>
                            {app.users?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() ||
                              app.students?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() ||
                              "?"}
                          </Avatar.Fallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {app.students?.name || app.users?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted">
                            {app.students?.email || app.users?.email}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm">
                        {app.students?.university || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm line-clamp-1 max-w-[200px]">
                        {app.students?.skills || "-"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs text-muted">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Select
                        placeholder="Status"
                        value={app.status}
                        onChange={(val) => handleStatusChange(app.id, val)}
                        className="min-w-[140px]"
                        isLoading={updatingId === app.id}
                      >
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {STATUS_OPTIONS.map((opt) => (
                              <ListBox.Item
                                key={opt.id}
                                id={opt.id}
                                textValue={opt.label}
                              >
                                {opt.label}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </Table.Cell>
                    <Table.Cell className="flex items-center justify-end gap-1">
                      {app.cover_letter && (
                        <Modal>
                          <Button size="sm" variant="tertiary">
                            Cover letter
                          </Button>
                          <Modal.Backdrop>
                            <Modal.Container>
                              <Modal.Dialog className="sm:max-w-[360px]">
                                <Modal.CloseTrigger />
                                <Modal.Header>
                                  <Modal.Heading>
                                    Cover Letter
                                  </Modal.Heading>
                                </Modal.Header>
                                <Modal.Body className="max-h-lg">
                                  <p>
                                    {app.cover_letter}
                                  </p>
                                </Modal.Body>
                              </Modal.Dialog>
                            </Modal.Container>
                          </Modal.Backdrop>
                        </Modal>
                      )}
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="tertiary" isIconOnly>
                            <File />
                          </Button>
                        </a>
                      )}
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
