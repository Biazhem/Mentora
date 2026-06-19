"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  Input,
  Button,
  Description,
  Label,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";

function StudentGeneralForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Personal Info</Typography.Heading>
        <Description>Set up your basic profile details</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <div className="flex flex-col items-center justify-center w-30 h-30 bg-accent-soft-hover rounded-xl border border-dashed border-muted/40 cursor-pointer hover:bg-accent-soft transition-colors mx-auto lg:mx-0">
          <span className="text-xs text-muted font-medium">Upload Avatar</span>
        </div>

        <TextField>
          <Label htmlFor="student-name">Full Name</Label>
          <Input
            id="student-name"
            placeholder="Zain Malik"
            fullWidth
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="student-email">Contact Email</Label>
          <Input
            id="student-email"
            type="email"
            placeholder="zain@university.edu"
            fullWidth
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="student-phone">Phone Number</Label>
          <Input
            id="student-phone"
            type="tel"
            placeholder="+92 300 1234567"
            fullWidth
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </TextField>
      </div>
    </div>
  );
}

function StudentAcademicForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Academic Info</Typography.Heading>
        <Description>Tell us where and what you are studying</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="student-uni">University / Institute</Label>
          <Input
            id="student-uni"
            placeholder="Fast NUCES, Islamabad"
            fullWidth
            value={formData.university}
            onChange={(e) => updateField("university", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="student-semester">Current Semester</Label>
          <Input
            id="student-semester"
            type="number"
            min="1"
            max="12"
            placeholder="e.g., 6"
            fullWidth
            value={formData.semester}
            onChange={(e) => updateField("semester", e.target.value)}
          />
        </TextField>
      </div>
    </div>
  );
}

function StudentExpertiseForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Expertise & Interests</Typography.Heading>
        <Description>Highlight your skillset and focus domains</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="student-expertise">Area of Expertise / Focus</Label>
          <Input
            id="student-expertise"
            placeholder="e.g., Frontend Development, UI/UX"
            fullWidth
            value={formData.expertise}
            onChange={(e) => updateField("expertise", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="student-skills">Skills</Label>
          <Input
            id="student-skills"
            placeholder="e.g., JavaScript, React, Tailwind"
            fullWidth
            value={formData.skills}
            onChange={(e) => updateField("skills", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="student-cv">Upload CV / Resume</Label>
          <div className="relative flex flex-col items-center justify-center p-4 border border-dashed border-muted/40 rounded-xl bg-background-secondary hover:bg-accent-soft transition-colors cursor-pointer group">
            <input
              type="file"
              id="student-cv"
              accept=".pdf,.doc,.docx"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
              Choose PDF / Word file
            </span>
            <span className="text-[10px] text-muted mt-1">Max size 5MB</span>
          </div>
        </TextField>
      </div>
    </div>
  );
}

export default function StudentOnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeForm, setActiveForm] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    university: "",
    semester: "",
    expertise: "",
    skills: "",
  });
  const totalSteps = 3;

  useEffect(() => {
    async function checkExisting() {
      if (!isLoaded || !user) return;

      const { data, error } = await supabase
        .from("students")
        .select("id")
        .eq("clerk_id", user.id)
        .maybeSingle();

      if (!error && data) {
        router.push("/dashboard");
      }
    }

    checkExisting();
  }, [isLoaded, user, router]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("students").insert({
        clerk_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        university: formData.university,
        semester: formData.semester,
        expertise: formData.expertise,
        skills: formData.skills,
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (err) {
      console.error("Student insert error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeForm < totalSteps) {
      setActiveForm((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2 bg-accent-soft">
      <div className="flex flex-col items-center justify-center p-6 my-8">
        <div className="flex w-80 flex-col gap-6">
          {activeForm === 1 && <StudentGeneralForm formData={formData} updateField={updateField} />}
          {activeForm === 2 && <StudentAcademicForm formData={formData} updateField={updateField} />}
          {activeForm === 3 && <StudentExpertiseForm formData={formData} updateField={updateField} />}

          <div className="flex gap-2 items-center w-full mt-2">
            {activeForm > 1 && (
              <Button
                size="lg"
                fullWidth
                onClick={() => setActiveForm((prev) => prev - 1)}
                variant="tertiary"
              >
                Back
              </Button>
            )}
            <Button size="lg" fullWidth onClick={handleNext} isLoading={loading}>
              {activeForm === totalSteps ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative hidden h-full w-full lg:block bg-background-secondary">
        <img
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/neo2.jpeg"
          alt="NEO Home Robot"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/10 to-transparent" />
      </div>
    </div>
  );
}
