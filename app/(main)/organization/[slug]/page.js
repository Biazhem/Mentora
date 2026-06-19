"use client";

import { supabase } from "@/lib/supabase";
import { Avatar, Button, Chip, Table } from "@heroui/react";
import { use, useEffect, useState } from "react";
import {
  DotsThreeIcon,
  PencilSimpleLineIcon,
  TrashIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { RotateCcw } from "lucide-react";
import { Pencil } from "lucide-react";
import { UserPlus } from "lucide-react";
import { data } from "@/config/data";
import { JobDrawer } from "@/components/custom/drawer-jobs";
import { Modal } from "@heroui/react";
import { TextField } from "@heroui/react";
import { Label } from "@heroui/react";
import { Input } from "@heroui/react";

export default function OrganizationProfile({ params }) {
  const { slug } = use(params);
  const [organization, setOrganization] = useState(null);
  const [owner, setOwner] = useState(null);
  // const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock Data
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
  // mock data

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", slug)
          .single();

        if (orgError || !orgData) {
          setLoading(false);
          return;
        }

        setOrganization(orgData);

        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_id", orgData.clerk_id)
          .single();

        if (userData) {
          setOwner(userData);
        }

        const { data: jobData } = await supabase
          .from("jobs")
          .select("*")
          .eq("org_id", slug)
          .order("created_at", { ascending: false });

        if (jobData) {
          setJobs(jobData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full flex mx-auto p-3 md:p-6 flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-pulse">
          <div className="w-44 h-44 bg-accent-soft-hover rounded-xl shrink-0" />
          <div className="flex-1 min-w-0 space-y-3">
            <div className="h-8 w-48 bg-accent-soft-hover rounded" />
            <div className="h-4 w-full bg-accent-soft-hover rounded" />
            <div className="h-4 w-3/4 bg-accent-soft-hover rounded" />
          </div>
        </div>
        <div className="space-y-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-accent-soft-hover rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!organization) {
    return <p className="p-6">Organization not found</p>;
  }

  return (
    <div className="w-full flex mx-auto p-3 md:p-6 flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-44 h-44 shrink-0 bg-accent-soft-hover rounded-xl shadow-lg ring-1 overflow-hidden">
          {organization.image_url ? (
            <img
              src={organization.image_url}
              alt={organization.org_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl font-semibold text-muted">
                {organization.org_name?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold mb-4">
            {organization.org_name}
          </h1>
          <p className="text-muted mb-6 leading-relaxed line-clamp-4 text-sm lg:text-base">
            {organization.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip>{organization.company_type}</Chip>
            <Chip>
              {organization.city}, {organization.country}
            </Chip>
            <Chip>{jobs.length} Jobs</Chip>
            {organization.company_size && (
              <Chip>{organization.company_size} Employees</Chip>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Modal>
            <Button isIconOnly variant="tertiary">
              <Pencil />
            </Button>
            <Modal.Backdrop>
              <Modal.Container>
                <Modal.Dialog>
                  <Modal.CloseTrigger /> {/* Optional: Close button */}
                  <Modal.Header>
                    <Modal.Icon /> {/* Optional: Icon */}
                    <Modal.Heading>Edit Organization</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="space-y-2">
                      <TextField>
                        <Label htmlFor="input-org-name">
                          Organization Name
                        </Label>
                        <Input
                          variant="secondary"
                          id="input-org-name"
                          placeholder="Acme Inc"
                          fullWidth
                        />
                      </TextField>
                    </div>
                  </Modal.Body>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
          <Button>
            <UserPlus /> Invite
          </Button>
        </div>
      </div>

      {owner && (
        <div className="mt-2">
          <h2 className="text-lg font-bold mb-3">Members</h2>
          <Table>
            <Table.ScrollContainer>
              <Table.Content
                aria-label="Team members"
                className="min-w-[600px]"
              >
                <Table.Header>
                  <Table.Column isRowHeader>Name</Table.Column>
                  <Table.Column>Role</Table.Column>
                  <Table.Column>Email</Table.Column>
                  <Table.Column className="justify-end items-center flex gap-2">
                    Actions
                    <Button variant="tertiary" isIconOnly size="sm">
                      <RotateCcw />
                    </Button>
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>{owner.name}</Table.Cell>
                    <Table.Cell>
                      <Chip variant={"primary"}>Founder</Chip>
                    </Table.Cell>
                    <Table.Cell>{owner.email}</Table.Cell>
                    <Table.Cell
                      className={"flex items-center justify-end gap-1"}
                    >
                      <Button isIconOnly size="sm" variant="tertiary">
                        <DotsThreeIcon weight="bold" />
                      </Button>
                      <Button isIconOnly size="sm" variant="tertiary">
                        <UserIcon weight="bold" />
                      </Button>
                      {/* <Button isIconOnly variant="danger-soft" size="sm">
                      <TrashIcon weight="bold" />
                    </Button> */}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>
      )}

      <div className="mt-2">
        <h2 className="text-lg font-bold mb-3">Jobs</h2>
        <div className="w-full grid grid-cols-3 gap-2">
          {jobs.map((job) => (
            <JobDrawer showImage={false} key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
