"use client";

import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { Avatar, Button, Chip, Table, Card } from "@heroui/react";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PencilSimpleLineIcon,
  TrashIcon,
  UserIcon,
  DotsThreeIcon,
} from "@phosphor-icons/react";
import {
  RotateCcw,
  Pencil,
  UserPlus,
  PenLine,
  Copy,
  Check,
} from "lucide-react";
import { JobDrawer } from "@/components/custom/drawer-jobs";
import {
  Modal,
  TextField,
  Label,
  Input,
  TextArea,
  Description,
} from "@heroui/react";
import { Popover } from "@heroui/react";
import { ArrowLeftRight } from "lucide-react";
import { UserStar } from "lucide-react";

export default function OrganizationProfile({ params }) {
  const { slug } = use(params);
  const { user } = useUser();
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const router = useRouter();
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    org_name: "",
    description: "",
    street_address: "",
    company_size: "",
    company_type: "",
    org_logo_url: "",
  });

  const updateEditField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

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
        setEditForm({
          org_name: orgData.org_name || "",
          description: orgData.description || "",
          street_address: orgData.street_address || "",
          company_size: orgData.company_size || "",
          company_type: orgData.company_type || "",
          org_logo_url: orgData.org_logo_url || "",
        });

        if (user) {
          const { data: userData } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", user.id)
            .single();

          if (userData) {
            setCurrentUserId(userData.id);
            const { data: memberCheck } = await supabase
              .from("organization_members")
              .select("role")
              .eq("organization_id", slug)
              .eq("user_id", userData.id)
              .maybeSingle();

            setIsMember(!!memberCheck);
            setIsAdmin(memberCheck?.role === "admin");
          }
        }

        const { data: memberRows } = await supabase
          .from("organization_members")
          .select("role, joined_at, user_id")
          .eq("organization_id", slug);

        if (memberRows && memberRows.length > 0) {
          const userIds = memberRows.map((m) => m.user_id);
          const { data: usersData } = await supabase
            .from("users")
            .select("id, name, email, pic")
            .in("id", userIds);

          const usersMap = {};
          (usersData || []).forEach((u) => {
            usersMap[u.id] = u;
          });

          const enriched = memberRows.map((m) => ({
            ...m,
            user: usersMap[m.user_id] || null,
          }));

          setMembers(enriched);
        }

        const { data: jobData } = await supabase
          .from("jobs")
          .select("*")
          .eq("org_id", slug)
          .order("created_at", { ascending: false });

        if (jobData) {
          const mappedJobs = jobData.map((job) => ({
            id: job.id,
            title: job.title,
            company: orgData.org_name || "Unknown",
            location: job.city
              ? `${job.city}, ${job.country}`
              : job.country || "Remote",
            type: job.job_type,
            timing: job.workplace_type,
            description: job.description,
            requirements: job.requirements,
            org_image: null,
          }));
          setJobs(mappedJobs);
        }

        const { data: eventData } = await supabase
          .from("events")
          .select("*")
          .eq("org_id", slug)
          .order("start_date", { ascending: false });

        if (eventData) {
          setEvents(eventData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug, user]);

  const handleLogoChange = (file) => {
    if (!file) return;
    setLogoFile(file);
    setEditForm((prev) => ({
      ...prev,
      org_logo_url: URL.createObjectURL(file),
    }));
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpdate = async () => {
    setEditLoading(true);
    try {
      let logoUrl = editForm.org_logo_url;
      if (logoFile) {
        logoUrl = await fileToBase64(logoFile);
      }

      const { error } = await supabase
        .from("organizations")
        .update({
          org_name: editForm.org_name,
          description: editForm.description,
          street_address: editForm.street_address,
          company_size: editForm.company_size,
          company_type: editForm.company_type,
          org_logo_url: logoUrl,
        })
        .eq("id", slug);

      if (error) throw error;

      setOrganization((prev) => ({
        ...prev,
        ...editForm,
        org_logo_url: logoUrl,
      }));
      setLogoFile(null);
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/organization/${slug}/invite`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
          {organization.org_logo_url ? (
            <img
              src={organization.org_logo_url}
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
          {isAdmin && (
            <Modal>
              <Button isIconOnly variant="tertiary">
                <Pencil />
              </Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger /> {/* Optional: Close button */}
                    <Modal.Header>
                      <Modal.Icon>
                        <PenLine />
                      </Modal.Icon>
                      <Modal.Heading>Edit Organization</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="space-y-2">
                        <div className="relative flex flex-col items-center justify-center w-30 h-30 bg-accent-soft-hover rounded-lg border border-dashed border-muted/40 cursor-pointer hover:bg-accent-soft transition-colors group overflow-hidden">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            onChange={(e) =>
                              handleLogoChange(e.target.files?.[0])
                            }
                          />
                          {editForm.org_logo_url ? (
                            <img
                              src={editForm.org_logo_url}
                              alt="Logo preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted font-medium group-hover:text-primary transition-colors">
                              Upload Logo
                            </span>
                          )}
                        </div>
                        <TextField>
                          <Label htmlFor="input-org-name">
                            Organization Name
                          </Label>
                          <Input
                            variant="secondary"
                            id="input-org-name"
                            placeholder="Acme Inc"
                            fullWidth
                            value={editForm.org_name}
                            onChange={(e) =>
                              updateEditField("org_name", e.target.value)
                            }
                          />
                        </TextField>
                        <TextField>
                          <Label htmlFor="input-org-des">Description</Label>
                          <TextArea
                            variant="secondary"
                            id="input-org-des"
                            placeholder="A industry builds something"
                            rows={3}
                            fullWidth
                            value={editForm.description}
                            onChange={(e) =>
                              updateEditField("description", e.target.value)
                            }
                          />
                          <Description className="self-end">
                            {editForm.description.length}/30
                          </Description>
                        </TextField>
                        <TextField>
                          <Label htmlFor="input-org-ads">Address</Label>
                          <TextArea
                            variant="secondary"
                            id="input-org-ads"
                            placeholder="Pakistan, Islamabad"
                            rows={2}
                            fullWidth
                            value={editForm.street_address}
                            onChange={(e) =>
                              updateEditField("street_address", e.target.value)
                            }
                          />
                        </TextField>
                        <div className="grid grid-cols-2 gap-2">
                          <TextField>
                            <Label htmlFor="input-org-size">Company Size</Label>
                            <Input
                              variant="secondary"
                              id="input-org-size"
                              placeholder="e.g., 50"
                              fullWidth
                              value={editForm.company_size}
                              onChange={(e) =>
                                updateEditField("company_size", e.target.value)
                              }
                            />
                          </TextField>
                          <TextField>
                            <Label htmlFor="input-org-typ">Company Type</Label>
                            <Input
                              variant="secondary"
                              id="input-org-typ"
                              placeholder="e.g., Tech"
                              fullWidth
                              value={editForm.company_type}
                              onChange={(e) =>
                                updateEditField("company_type", e.target.value)
                              }
                            />
                          </TextField>
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="secondary">
                        Cancel
                      </Button>
                      <Button
                        slot="close"
                        onClick={handleUpdate}
                        isLoading={editLoading}
                      >
                        Save Changes
                      </Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          )}
          {isAdmin && (
            <Button onClick={handleCopyInvite}>
              {copied ? <Check /> : <UserPlus />}
              {copied ? "Copied!" : "Invite"}
            </Button>
          )}
        </div>
      </div>

      {isMember && members.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-2 items-center">
            <h2 className="text-lg font-bold">Members</h2>
            <Chip variant="primary" color="accent" size="sm">
              {members.length}
            </Chip>
          </div>
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
                  </Table.Column>
                </Table.Header>
                <Table.Body>
                  {members.map((member) => (
                    <Table.Row key={member.user_id}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            {member.user?.pic ? (
                              <Avatar.Image
                                src={member.user.pic}
                                alt={member.user.name}
                              />
                            ) : null}
                            <Avatar.Fallback>
                              {member.user?.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "?"}
                            </Avatar.Fallback>
                          </Avatar>
                          {member.user?.name || "Unknown"}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Chip
                          variant={
                            member.role === "admin" ? "primary" : "tertiary"
                          }
                        >
                          {member.role}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>{member.user?.email || "-"}</Table.Cell>
                      <Table.Cell className="flex items-center justify-end gap-1">
                        <Popover>
                          <Button isIconOnly size="sm" variant="tertiary">
                            <DotsThreeIcon weight="bold" />
                          </Button>
                          <Popover.Content className="max-w-64">
                            <Popover.Dialog className="p-2 flex flex-col gap-2 *:w-full *:justify-start">
                              <Popover.Heading>Actions</Popover.Heading>
                              <Button variant="danger-soft">
                                <TrashIcon/> Remove
                              </Button>
                              <Button variant="outline">
                                <UserStar /> Create admin
                              </Button>
                            </Popover.Dialog>
                          </Popover.Content>
                        </Popover>
                        <Link href={`/profile?id=${member.user_id}`}>
                          <Button isIconOnly size="sm" variant="tertiary">
                            <UserIcon weight="bold" />
                          </Button>
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-2 items-center mb-3">
            <h2 className="text-lg font-bold">Jobs</h2>
            <Chip variant="primary" color="accent" size="sm">
              {jobs.length}
            </Chip>
          </div>
          <div className="w-full grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobDrawer showImage={false} key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-2 items-center mb-3">
            <h2 className="text-lg font-bold">Events</h2>
            <Chip variant="primary" color="accent" size="sm">
              {events.length}
            </Chip>
          </div>
          <div className="w-full grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Link key={event.id} href={`/events`}>
                <Card className="cursor-pointer hover:shadow-md transition">
                  <Card.Header>
                    <Card.Title>{event.title}</Card.Title>
                    {event.location && (
                      <Card.Description>{event.location}</Card.Description>
                    )}
                  </Card.Header>
                  <Card.Content className="space-y-2">
                    {event.description && (
                      <p className="text-sm line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {event.type && <Chip size="sm">{event.type}</Chip>}
                      {event.start_date && (
                        <Chip size="sm" variant="secondary">
                          {event.start_date}
                        </Chip>
                      )}
                      {event.end_date && (
                        <Chip size="sm" variant="secondary">
                          {event.end_date}
                        </Chip>
                      )}
                    </div>
                  </Card.Content>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
