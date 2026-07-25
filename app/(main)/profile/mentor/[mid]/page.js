"use client";

import { use, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Description,
  Label,
  Surface,
  Alert,
} from "@heroui/react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2 } from "lucide-react";

export default function MentorProfilePage({ params }) {
  const { mid } = use(params);
  const { user } = useUser();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStudent, setIsStudent] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchMentor() {
      try {
        setLoading(true);

        const { data: mentorData, error } = await supabase
          .from("mentors")
          .select("*")
          .eq("id", mid)
          .single();

        if (error || !mentorData) {
          setLoading(false);
          return;
        }

        const { data: userData } = await supabase
          .from("users")
          .select("name, pic, email")
          .eq("clerk_id", mentorData.clerk_id)
          .single();

        setMentor({
          ...mentorData,
          picture: userData?.pic || null,
          displayName: userData?.name || mentorData.name,
        });
      } catch (err) {
        console.error("Fetch mentor error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMentor();
  }, [mid]);

  useEffect(() => {
    async function checkStudent() {
      if (!user || !mentor) return;

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) return;

      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("clerk_id", user.id)
        .maybeSingle();

      setIsStudent(!!studentData);

      if (studentData) {
        const { data: requestData } = await supabase
          .from("mentorship_requests")
          .select("id, status")
          .eq("mentor_id", mentor.id)
          .eq("student_id", studentData.id)
          .maybeSingle();

        if (requestData) {
          setHasRequested(true);
          setMessage(`You have a ${requestData.status} request with this mentor.`);
        }
      }
    }

    checkStudent();
  }, [user, mentor]);

  const handleRequest = async () => {
    if (!user || !mentor) return;

    setRequesting(true);
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
        .single();

      if (!studentData) {
        setMessage("Only students can request mentorship.");
        return;
      }

      const { error } = await supabase.from("mentorship_requests").insert({
        mentor_id: mentor.id,
        student_id: studentData.id,
        user_id: userData.id,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          setMessage("You have already sent a request to this mentor.");
          setHasRequested(true);
        } else {
          throw error;
        }
      } else {
        setHasRequested(true);
        setMessage("Mentorship request sent successfully!");

        // Notify the mentor
        const { data: mentorUser } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", mentor.clerk_id)
          .maybeSingle();

        if (mentorUser) {
          await supabase.from("notifications").insert({
            user_id: mentorUser.id,
            org_id: null,
            type: "mentorship",
            title: "New Mentorship Request",
            message: `${userData.name || "A student"} wants to connect with you for mentorship`,
            entity_id: mentor.id,
          });
        }

        // Notify the student (confirmation)
        await supabase.from("notifications").insert({
          user_id: userData.id,
          org_id: null,
          type: "mentorship",
          title: "Mentorship Request Sent",
          message: `Your mentorship request to ${mentor.displayName || "the mentor"} has been sent successfully`,
          entity_id: mentor.id,
        });

        // Send email to mentor about new request
        if (mentorUser) {
          const { data: mentorUserData } = await supabase
            .from("users")
            .select("email")
            .eq("id", mentorUser.id)
            .maybeSingle();
          if (mentorUserData?.email) {
            try {
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to: mentorUserData.email,
                  subject: "New Mentorship Request on Mentora",
                  html: `<h2>New Mentorship Request</h2><p>${userData.name || "A student"} has requested mentorship from you on Mentora.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/mentors/requests">View Request</a></p>`,
                }),
              });
            } catch (e) { console.error("Email error:", e); }
          }
        }

        // Send confirmation email to student
        const { data: studentEmailData } = await supabase
          .from("users")
          .select("email")
          .eq("id", userData.id)
          .maybeSingle();
        if (studentEmailData?.email) {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: studentEmailData.email,
                subject: "Mentorship Request Sent",
                html: `<h2>Mentorship Request Sent</h2><p>Your mentorship request to ${mentor.displayName || "your mentor"} has been sent. You will be notified when they respond.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/mentors">Browse Mentors</a></p>`,
              }),
            });
          } catch (e) { console.error("Email error:", e); }
        }
      }
    } catch (err) {
      console.error("Request error:", err);
      setMessage("Failed to send request. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-accent-soft-hover rounded" />
          <div className="h-40 bg-accent-soft-hover rounded-xl" />
          <div className="h-32 bg-accent-soft-hover rounded-xl" />
        </div>
      </div>
    );
  }

  if (!mentor) {
    return <p className="p-6 text-center">Mentor not found</p>;
  }

  const expertiseList = mentor.expertise
    ? mentor.expertise.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const experiences = Array.isArray(mentor.experiences) ? mentor.experiences : [];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/mentors" className="flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Mentors
      </Link>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar size="xl">
            {mentor.picture ? (
              <Avatar.Image src={mentor.picture} alt={mentor.displayName} />
            ) : null}
            <Avatar.Fallback>{mentor.displayName?.charAt(0) || "?"}</Avatar.Fallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{mentor.displayName}</h1>
            <p className="text-muted text-sm mt-1">{mentor.bio || "No bio provided"}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {mentor.field && <Chip>{mentor.field}</Chip>}
              {mentor.institute && <Chip>{mentor.institute}</Chip>}
              {mentor.gender && <Chip variant="secondary">{mentor.gender}</Chip>}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-3">Expertise</h2>
        <div className="flex flex-wrap gap-2">
          {expertiseList.length > 0 ? (
            expertiseList.map((skill, idx) => (
              <Chip key={idx} variant="soft">{skill}</Chip>
            ))
          ) : (
            <p className="text-muted text-sm">No expertise listed</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-bold mb-3">Contact Information</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-muted" />
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium">{mentor.email || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="size-4 text-muted" />
            <div>
              <p className="text-xs text-muted">Phone</p>
              <p className="text-sm font-medium">{mentor.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="size-4 text-muted" />
            <div>
              <p className="text-xs text-muted">Institute</p>
              <p className="text-sm font-medium">{mentor.institute || "Not provided"}</p>
            </div>
          </div>
          {mentor.inst_email && (
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted" />
              <div>
                <p className="text-xs text-muted">Institutional Email</p>
                <p className="text-sm font-medium">{mentor.inst_email}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {experiences.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-3">Experience</h2>
          <div className="space-y-3">
            {experiences.map((exp, idx) => (
              <Surface key={idx} variant="secondary" className="rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Label>{exp.title || exp.role || ""}</Label>
                  {exp.type && <Chip size="sm" variant="soft">{exp.type}</Chip>}
                </div>
                {exp.company && <p className="text-sm text-muted">At {exp.company}</p>}
                {exp.description && <p className="text-sm mt-1">{exp.description}</p>}
              </Surface>
            ))}
          </div>
        </Card>
      )}

      {(mentor.mentoring_style || mentor.availability) && (
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-3">Mentoring Details</h2>
          <div className="space-y-3">
            {mentor.mentoring_style && (
              <div>
                <p className="text-xs text-muted">Mentoring Style</p>
                <p className="text-sm font-medium">{mentor.mentoring_style}</p>
              </div>
            )}
            {mentor.availability && (
              <div>
                <p className="text-xs text-muted">Availability</p>
                <p className="text-sm font-medium">{mentor.availability}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {message && (
        <Alert color={message.includes("success") ? "success" : "warning"}>
          {message}
        </Alert>
      )}

      <div className="flex gap-2">
        <Link href="/mentors">
          <Button variant="secondary">View All Mentors</Button>
        </Link>
        {user && isStudent && (
          hasRequested ? (
            <Button variant="secondary" isDisabled>
              Request Sent
            </Button>
          ) : (
            <Button
              onClick={handleRequest}
              isLoading={requesting}
            >
              Request Mentorship
            </Button>
          )
        )}
      </div>
    </div>
  );
}
