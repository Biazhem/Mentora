"use client"

import { MentorComponent } from "@/components/custom/mentor";
import { StudentComponent } from "@/components/custom/student";
import { FounderComponent } from "@/components/custom/founder";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Page() {
  const { user, isLoaded } = useUser();
  const [roles, setRoles] = useState({ isStudent: false, isMentor: false, isFounder: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRoles() {
      if (!isLoaded || !user) return;

      try {
        const { data: studentData } = await supabase
          .from("students")
          .select("id")
          .eq("clerk_id", user.id)
          .maybeSingle();

        const { data: mentorData } = await supabase
          .from("mentors")
          .select("id")
          .eq("clerk_id", user.id)
          .maybeSingle();

        const { data: founderData } = await supabase
          .from("organizations")
          .select("id")
          .eq("clerk_id", user.id)
          .maybeSingle();

        setRoles({
          isStudent: !!studentData,
          isMentor: !!mentorData,
          isFounder: !!founderData,
        });
      } catch (err) {
        console.error("Check roles error:", err);
      } finally {
        setLoading(false);
      }
    }

    checkRoles();
  }, [isLoaded, user]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse h-8 w-48 bg-accent-soft-hover rounded" />
        <div className="animate-pulse h-32 bg-accent-soft-hover rounded" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {roles.isFounder && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Founder</h2>
          <FounderComponent />
        </div>
      )}

      {roles.isMentor && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Mentor</h2>
          <MentorComponent />
        </div>
      )}

      {roles.isStudent && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Student</h2>
          <StudentComponent />
        </div>
      )}

      {!roles.isFounder && !roles.isMentor && !roles.isStudent && (
        <p className="text-muted">No profile data found. Complete onboarding to set up your profile.</p>
      )}
    </div>
  );
}
