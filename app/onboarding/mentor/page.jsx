"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Input,
  Button,
  Description,
  Label,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import { Card } from "@heroui/react";
import { ArrowLeft } from "lucide-react";

function GeneralForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>General Info</Typography.Heading>
        <Description>Introduce yourself to your future mentees</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <div className="flex flex-col items-center justify-center w-30 h-30 bg-accent-soft-hover rounded-xl border border-dashed border-muted/40 cursor-pointer hover:bg-accent-soft transition-colors">
          <span className="text-xs text-muted font-medium">Upload Pic</span>
        </div>

        <TextField>
          <Label htmlFor="mentor-name">Full Name</Label>
          <Input
            id="mentor-name"
            placeholder="Alex Johnson"
            fullWidth
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-bio">Biography / Summary</Label>
          <TextArea
            id="mentor-bio"
            rows={4}
            fullWidth
            placeholder="Share a short summary about your background, passions, and mentorship style..."
            value={formData.bio}
            onChange={(e) => updateField("bio", e.target.value)}
          />
          <Description className="text-right text-xs">
            {formData.bio.length}/160
          </Description>
        </TextField>
      </div>
    </div>
  );
}

function PersonalInfoForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Personal Details</Typography.Heading>
        <Description>Provide your personal contact information</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="mentor-email">Personal Email</Label>
          <Input
            id="mentor-email"
            type="email"
            placeholder="alex@example.com"
            fullWidth
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-phone">Phone Number</Label>
          <Input
            id="mentor-phone"
            type="tel"
            placeholder="+92 301 9000008"
            fullWidth
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </TextField>

        <div className="grid grid-cols-2 gap-2">
          <TextField>
            <Label htmlFor="mentor-gender">Gender</Label>
            <Input
              id="mentor-gender"
              placeholder="e.g., Male, Female"
              fullWidth
              value={formData.gender}
              onChange={(e) => updateField("gender", e.target.value)}
            />
          </TextField>
          <TextField>
            <Label htmlFor="mentor-dob">Date of Birth</Label>
            <Input
              id="mentor-dob"
              type="date"
              fullWidth
              value={formData.dob}
              onChange={(e) => updateField("dob", e.target.value)}
            />
          </TextField>
        </div>
      </div>
    </div>
  );
}

function ExpertiseForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>
          Expertise & Background
        </Typography.Heading>
        <Description>
          Share your professional credentials and target domains
        </Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="mentor-field">Field / Industry</Label>
          <Input
            id="mentor-field"
            placeholder="e.g., Software Engineering"
            fullWidth
            value={formData.field}
            onChange={(e) => updateField("field", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-expertise">Area of Expertise</Label>
          <Input
            id="mentor-expertise"
            placeholder="e.g., React, System Design, Cloud"
            fullWidth
            value={formData.expertise}
            onChange={(e) => updateField("expertise", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-experience">Years of Experience</Label>
          <Input
            id="mentor-experience"
            type="number"
            min="0"
            placeholder="5"
            fullWidth
            value={formData.experience}
            onChange={(e) => updateField("experience", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-institute">
            Affiliated Institute / Company
          </Label>
          <Input
            id="mentor-institute"
            placeholder="NUST / Google"
            fullWidth
            value={formData.institute}
            onChange={(e) => updateField("institute", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-inst-email">Institutional Email</Label>
          <Input
            id="mentor-inst-email"
            type="email"
            placeholder="alex@institute.edu"
            fullWidth
            value={formData.instEmail}
            onChange={(e) => updateField("instEmail", e.target.value)}
          />
        </TextField>
      </div>
    </div>
  );
}

export default function Page() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeForm, setActiveForm] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    field: "",
    expertise: "",
    experience: "",
    institute: "",
    instEmail: "",
  });
  const totalSteps = 3;

  useEffect(() => {
    async function checkExisting() {
      if (!isLoaded || !user) return;

      const res = await fetch("/api/auth/sync-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerk_id: user.id, name: "" }),
      });

      const data = await res.json();

      if (data.isNew === false) {
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
      const res = await fetch("/api/auth/sync-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_id: user.id,
          name: formData.name,
          bio: formData.bio,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          dob: formData.dob,
          field: formData.field,
          expertise: formData.expertise,
          experience: formData.experience,
          institute: formData.institute,
          inst_email: formData.instEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Sync failed");

      router.push("/dashboard");
    } catch (err) {
      console.error("Mentor insert error:", err);
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
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2 bg-accent-soft relative">
          <Button className="absolute top-6 left-6" onClick={() => router.back()}>
            <ArrowLeft />
            Back
          </Button>
      <div className="flex flex-col items-center justify-center p-6 my-8">
        <div className="flex w-80 flex-col gap-6">
          {activeForm === 1 && (
            <GeneralForm formData={formData} updateField={updateField} />
          )}
          {activeForm === 2 && (
            <PersonalInfoForm formData={formData} updateField={updateField} />
          )}
          {activeForm === 3 && (
            <ExpertiseForm formData={formData} updateField={updateField} />
          )}

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
            <Button
              size="lg"
              fullWidth
              onClick={handleNext}
              isLoading={loading}
            >
              {activeForm === totalSteps ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden h-svh w-full lg:block bg-[url(/grad-1.png)] object-right p-8 pt-16">
        <Typography.Heading level={3}>
          Build your Mentor Profile
        </Typography.Heading>
        <Typography.Paragraph>
          To create your mentor profile which requires the information about
          you and your verified qualifications.
        </Typography.Paragraph>
        <div className="h-full w-full flex items-center justify-center">
          <Card className="w-fit flex-col rotate-6">
            <img
              className="w-80 rounded-xl"
              src="https://static.vecteezy.com/system/resources/previews/004/579/655/non_2x/online-education-concept-woman-teacher-illustration-flat-vector.jpg"
            />
            <p className="text-wrap w-50 text-sm">
              Grow your careers with ease and all at one place
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
