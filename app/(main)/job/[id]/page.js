"use client";

import { supabase } from "@/lib/supabase";
import {
  Avatar,
  Button,
  Chip,
  Separator,
  Modal,
  TextField,
  Label,
  Input,
  TextArea,
  Description,
  Alert,
} from "@heroui/react";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  MapPin,
  Clock,
  Briefcase,
  Building2,
  Globe,
  DollarSign,
  ArrowLeft,
} from "lucide-react";

export default function JobDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useUser();
  const [job, setJob] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);

        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .single();

        if (jobError || !jobData) {
          setLoading(false);
          return;
        }

        setJob(jobData);

        const { data: orgData } = await supabase
          .from("organizations")
          .select(
            "id, org_name, description, website, city, country, company_type, company_size",
          )
          .eq("id", jobData.org_id)
          .single();

        if (orgData) {
          setOrganization(orgData);
        }
      } catch (err) {
        console.error("Fetch job error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  useEffect(() => {
    async function checkApplied() {
      if (!user || !id) return;

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) return;

      const { data: appData } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", id)
        .eq("user_id", userData.id)
        .maybeSingle();

      if (appData) {
        setApplied(true);
      }
    }

    checkApplied();
  }, [user, id]);

  const handleApply = async () => {
    if (!user) {
      setMessage("Please sign in to apply.");
      return;
    }

    setApplying(true);
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) {
        setMessage("User not found. Please complete onboarding.");
        return;
      }

      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("clerk_id", user.id)
        .maybeSingle();

      if (!studentData) {
        setMessage(
          "Only students can apply to jobs. Please complete student onboarding.",
        );
        return;
      }

      const { error } = await supabase.from("job_applications").insert({
        job_id: id,
        student_id: studentData.id,
        user_id: userData.id,
        cover_letter: coverLetter,
        resume_url: resumeUrl || null,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          setMessage("You have already applied to this job.");
          setApplied(true);
        } else {
          throw error;
        }
      } else {
        setApplied(true);
        setMessage("Application submitted successfully!");
        setApplyModalOpen(false);

        await supabase
          .from("jobs")
          .update({ applicants_count: (job.applicants_count || 0) + 1 })
          .eq("id", id);
      }
    } catch (err) {
      console.error("Apply error:", err);
      setMessage("Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex mx-auto p-3 md:p-6 flex-col gap-4 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-accent-soft-hover rounded" />
          <div className="h-4 w-full bg-accent-soft-hover rounded" />
          <div className="h-4 w-3/4 bg-accent-soft-hover rounded" />
          <div className="h-32 bg-accent-soft-hover rounded" />
        </div>
      </div>
    );
  }

  if (!job) {
    return <p className="p-6">Job not found</p>;
  }

  const location =
    [job.city, job.country].filter(Boolean).join(", ") || "Remote";
  const isExpired = job.expires_at && new Date(job.expires_at) < new Date();

  return (
    <div className="w-full flex mx-auto p-3 md:p-6 flex-col gap-6 max-w-4xl">
      <Link
        href="/job"
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Jobs
      </Link>

      {message && (
        <Alert color={applied ? "success" : "warning"}>{message}</Alert>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {organization && (
                <Link
                  href={`/organization/${organization.id}`}
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <Avatar size="md">
                    <Avatar.Fallback>
                      {organization.org_name?.[0]?.toUpperCase() || "O"}
                    </Avatar.Fallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {organization.org_name}
                  </span>
                </Link>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{job.title}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <Chip color="primary" variant="soft">
                {job.job_type}
              </Chip>
              <Chip variant="secondary">{job.workplace_type}</Chip>
              <Chip variant="secondary">{job.experience_level}</Chip>
              <Chip variant="secondary">{location}</Chip>
              {isExpired && (
                <Chip color="danger" variant="soft">
                  Expired
                </Chip>
              )}
              {!isExpired && job.expires_at && (
                <Chip color="warning" variant="soft">
                  Expires {new Date(job.expires_at).toLocaleDateString()}
                </Chip>
              )}
            </div>

            <p className="text-muted leading-relaxed text-sm lg:text-base">
              {job.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {isExpired ? (
              <Button size="lg" isDisabled>
                Expired
              </Button>
            ) : applied ? (
              <Button size="lg" isDisabled>
                Applied
              </Button>
            ) : (
              <Modal>
                <Button size="lg">Apply Now</Button>
                <Modal.Backdrop>
                  <Modal.Container>
                    <Modal.Dialog>
                      <Modal.CloseTrigger />
                      <Modal.Header>
                        <Modal.Heading>Apply for {job.title}</Modal.Heading>
                      </Modal.Header>
                      <Modal.Body>
                        <Description>
                          Cover letter and resume URL are optional.
                        </Description>
                        <div className="space-y-3">
                          <TextField>
                            <Label>Cover Letter (Optional)</Label>
                            <TextArea
                              placeholder="Tell the employer why you are a great fit for this role..."
                              rows={5}
                              fullWidth
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                            />
                          </TextField>
                          <TextField>
                            <Label>Resume URL (Optional)</Label>
                            <Input
                              placeholder="https://drive.google.com/your-resume.pdf"
                              fullWidth
                              value={resumeUrl}
                              onChange={(e) => setResumeUrl(e.target.value)}
                            />
                          </TextField>
                        </div>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button slot="close" variant="secondary">
                          Cancel
                        </Button>
                        <Button onClick={handleApply} isLoading={applying}>
                          Submit Application
                        </Button>
                      </Modal.Footer>
                    </Modal.Dialog>
                  </Modal.Container>
                </Modal.Backdrop>
              </Modal>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Briefcase className="size-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Job Type</p>
            <p className="text-sm font-medium">{job.job_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Workplace</p>
            <p className="text-sm font-medium">{job.workplace_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Location</p>
            <p className="text-sm font-medium">{location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Experience</p>
            <p className="text-sm font-medium">{job.experience_level}</p>
          </div>
        </div>
      </div>

      {(job.salary_min || job.salary_max) && (
        <div className="flex items-center gap-2">
          <DollarSign className="size-4 text-muted" />
          <div>
            <p className="text-xs text-muted">Salary</p>
            <p className="text-sm font-medium">
              {job.salary_min && job.salary_max
                ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                : job.salary_min
                  ? `From ${job.salary_min.toLocaleString()}`
                  : `Up to ${job.salary_max.toLocaleString()}`}{" "}
              {job.salary_currency} / {job.salary_period}
            </p>
          </div>
        </div>
      )}

      <Separator />

      {job.requirements && (
        <div>
          <h2 className="text-lg font-bold mb-3">Requirements</h2>
          <p className="text-sm text-foreground whitespace-pre-line">
            {job.requirements}
          </p>
        </div>
      )}

      {job.benefits && (
        <div>
          <h2 className="text-lg font-bold mb-3">Benefits</h2>
          <p className="text-sm text-foreground whitespace-pre-line">
            {job.benefits}
          </p>
        </div>
      )}

      <Separator />

      {organization && (
        <div>
          <h2 className="text-lg font-bold mb-3">About the Company</h2>
          <div className="flex flex-col gap-2">
            <Link
              href={`/organization/${organization.id}`}
              className="flex items-center gap-3 hover:opacity-80"
            >
              <Avatar size="lg">
                <Avatar.Fallback>
                  {organization.org_name?.[0]?.toUpperCase() || "O"}
                </Avatar.Fallback>
              </Avatar>
              <div>
                <p className="font-medium">{organization.org_name}</p>
                <p className="text-xs text-muted">
                  {organization.company_type}
                </p>
              </div>
            </Link>
            {organization.description && (
              <p className="text-sm text-muted mt-2">
                {organization.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              {organization.company_size && (
                <span className="text-muted">
                  {organization.company_size} employees
                </span>
              )}
              {organization.city && (
                <span className="text-muted">
                  {organization.city}, {organization.country}
                </span>
              )}
              {organization.website && (
                <a
                  href={`https://${organization.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Globe className="size-3" />
                  {organization.website}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted">
        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
        <span>•</span>
        <span>{job.views_count} views</span>
        <span>•</span>
        <span>{job.applicants_count} applicants</span>
      </div>
    </div>
  );
}
