"use client"

import { MentorComponent } from "@/components/custom/mentor";
import { StudentComponent } from "@/components/custom/student";
import { FounderComponent } from "@/components/custom/founder";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";

export default function Page() {
  const { user, isLoaded } = useUser();
  const [roles, setRoles] = useState({ isStudent: false, isMentor: false, isFounder: false });
  const [loading, setLoading] = useState(true);
  const [founderData, setFounderData] = useState(null);
  const [founderAvatar, setFounderAvatar] = useState(null);

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

        const { data: founderOrg } = await supabase
          .from("organizations")
          .select("id, org_name, founder_name, founder_photo_url, description, company_type, city, country")
          .eq("clerk_id", user.id)
          .maybeSingle();

        setRoles({
          isStudent: !!studentData,
          isMentor: !!mentorData,
          isFounder: !!founderOrg,
        });

        if (founderOrg) {
          setFounderData(founderOrg);
          setFounderAvatar(founderOrg.founder_photo_url || null);
        }
      } catch (err) {
        console.error("Check roles error:", err);
      } finally {
        setLoading(false);
      }
    }

    checkRoles();
  }, [isLoaded, user]);

  const handleFounderAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      const { error } = await supabase
        .from("organizations")
        .update({ founder_photo_url: base64 })
        .eq("clerk_id", user.id);

      if (!error) {
        setFounderAvatar(base64);
        setFounderData((prev) => prev ? { ...prev, founder_photo_url: base64 } : prev);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto space-y-4">
        <div className="animate-pulse h-8 w-48 bg-accent-soft-hover rounded" />
        <div className="animate-pulse h-32 bg-accent-soft-hover rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted mt-1">Manage your profile and personal information</p>
      </div>

      {roles.isFounder && (
        <div className="rounded-2xl border border-default bg-background overflow-hidden">
          <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 p-6 pb-16">
            <div className="flex items-end gap-5">
              <div className="relative group">
                <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl bg-muted border-2 border-background shadow-lg overflow-hidden flex items-center justify-center">
                  {founderAvatar ? (
                    <img src={founderAvatar} alt="Founder" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-muted">
                      {founderData?.founder_name?.[0]?.toUpperCase() || founderData?.org_name?.[0]?.toUpperCase() || "F"}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                  <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleFounderAvatarUpload} />
                  <PenLine className="size-5 text-white" />
                </label>
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold">{founderData?.founder_name || "Founder"}</h2>
                <p className="text-sm text-muted">{founderData?.org_name || "Organization"}</p>
                {founderData?.company_type && (
                  <p className="text-xs text-muted mt-0.5">{founderData.company_type}</p>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 pt-0 mt-4">
            <FounderComponent />
          </div>
        </div>
      )}

      {roles.isMentor && (
        <div className="rounded-2xl border border-default bg-background p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-success/10 flex items-center justify-center">
              <span className="text-sm font-bold text-success">M</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Mentor</h2>
              <p className="text-xs text-muted">Your mentorship profile and expertise</p>
            </div>
          </div>
          <MentorComponent />
        </div>
      )}

      {roles.isStudent && (
        <div className="rounded-2xl border border-default bg-background p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <span className="text-sm font-bold text-accent">S</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Student</h2>
              <p className="text-xs text-muted">Your academic profile and skills</p>
            </div>
          </div>
          <StudentComponent />
        </div>
      )}

      {!roles.isFounder && !roles.isMentor && !roles.isStudent && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-default">
          <p className="text-muted">No profile data found. Complete onboarding to set up your profile.</p>
        </div>
      )}
    </div>
  );
}
