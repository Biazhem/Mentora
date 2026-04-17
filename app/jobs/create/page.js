"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Temporary",
];

const TIMINGS = [
  "Immediate",
  "1-2 weeks",
  "2-4 weeks",
  "1-3 months",
  "Flexible",
];

export default function JobCreatePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: [],
    timing: [],
  });

  useEffect(() => {
    async function checkOrganization() {
      if (!isLoaded || !user) return;

      try {
        const userEmail = user.primaryEmailAddress?.emailAddress || "";
        if (!userEmail) {
          setError("No email found from Clerk");
          setLoading(false);
          return;
        }

        // Get user ID
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", userEmail);

        if (userError || !userData || userData.length === 0) {
          setError("User not found");
          setLoading(false);
          return;
        }

        const userId = userData[0].id;

        // Check if user has an organization
        const { data: orgData, error: orgError } = await supabase
          .from("organisation")
          .select("id")
          .eq("owner_id", userId);

        setOrgId(orgData[0].id);

        if (orgError || !orgData || orgData.length === 0) {
          setError("You need to create an organization first to post jobs");
          setLoading(false);
          return;
        }

        console.log("Org data -", orgData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load organization");
        setLoading(false);
      }
    }

    checkOrganization();
  }, [isLoaded, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleType = (type) => {
    setForm((prev) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type],
    }));
  };

  const toggleTiming = (timing) => {
    setForm((prev) => ({
      ...prev,
      timing: prev.timing.includes(timing)
        ? prev.timing.filter((t) => t !== timing)
        : [...prev.timing, timing],
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form
      const title = form.title.trim();
      if (!title) throw new Error("Job title is required");
      if (!form.description.trim())
        throw new Error("Job description is required");
      if (form.type.length === 0)
        throw new Error("Please select at least one job type");
      if (form.timing.length === 0)
        throw new Error("Please select at least one timing option");
      if (!orgId) throw new Error("Organization not found");

      // Create job
      const { error: jobError } = await supabase.from("jobs").insert({
        org_id: orgId,
        title: title,
        description: form.description,
        type: form.type,
        timing: form.timing,
        expeired: false,
      });

      if (jobError) throw jobError;

      router.push("/jobs");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create job");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-2xl">
            <CardTitle className="text-2xl">Create a New Job</CardTitle>
            <CardDescription className="text-emerald-100">
              Post a job opportunity from your organization
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Job Title */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-900"
                >
                  Job Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Senior React Developer"
                  value={form.title}
                  onChange={handleInputChange}
                  className="border-slate-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-900"
                >
                  Job Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the job role, responsibilities, and requirements..."
                  value={form.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="border-slate-200 resize-none"
                />
              </div>

              {/* Job Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-900">
                  Job Type *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {JOB_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={form.type.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                        className="rounded"
                      />
                      <Label
                        htmlFor={`type-${type}`}
                        className="text-sm font-normal text-slate-700 cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timing */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-900">
                  Available Timing *
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TIMINGS.map((timing) => (
                    <div key={timing} className="flex items-center space-x-2">
                      <Checkbox
                        id={`timing-${timing}`}
                        checked={form.timing.includes(timing)}
                        onCheckedChange={() => toggleTiming(timing)}
                        className="rounded"
                      />
                      <Label
                        htmlFor={`timing-${timing}`}
                        className="text-sm font-normal text-slate-700 cursor-pointer"
                      >
                        {timing}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Tags */}
              {(form.type.length > 0 || form.timing.length > 0) && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-900">
                    Selected Options
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {form.type.map((type) => (
                      <div
                        key={type}
                        className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {type}
                      </div>
                    ))}
                    {form.timing.map((timing) => (
                      <div
                        key={timing}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {timing}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 text-white"
            >
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
