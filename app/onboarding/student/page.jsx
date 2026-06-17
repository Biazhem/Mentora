"use client";

import { useState } from "react";
import {
  Input,
  Button,
  Description,
  Label,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";

// STEP 1: Personal Info & Identity
function StudentGeneralForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Personal Info</Typography.Heading>
        <Description>Set up your basic profile details</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        {/* Student Profile Picture Placeholder */}
        <div className="flex flex-col items-center justify-center w-30 h-30 bg-accent-soft-hover rounded-xl border border-dashed border-muted/40 cursor-pointer hover:bg-accent-soft transition-colors mx-auto lg:mx-0">
          <span className="text-xs text-muted font-medium">Upload Avatar</span>
        </div>

        {/* Name */}
        <TextField>
          <Label htmlFor="student-name">Full Name</Label>
          <Input id="student-name" placeholder="Zain Malik" fullWidth />
        </TextField>

        {/* Contact Info */}
        <TextField>
          <Label htmlFor="student-email">Contact Email</Label>
          <Input
            id="student-email"
            type="email"
            placeholder="zain@university.edu"
            fullWidth
          />
        </TextField>

        <TextField>
          <Label htmlFor="student-phone">Phone Number</Label>
          <Input
            id="student-phone"
            type="tel"
            placeholder="+92 300 1234567"
            fullWidth
          />
        </TextField>
      </div>
    </div>
  );
}

// STEP 2: Academic Details & CV
function StudentAcademicForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Academic Info</Typography.Heading>
        <Description>Tell us where and what you are studying</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        {/* University Name */}
        <TextField>
          <Label htmlFor="student-uni">University / Institute</Label>
          <Input
            id="student-uni"
            placeholder="Fast NUCES, Islamabad"
            fullWidth
          />
        </TextField>

        {/* Semester */}
        <TextField>
          <Label htmlFor="student-semester">Current Semester</Label>
          <Input
            id="student-semester"
            type="number"
            min="1"
            max="12"
            placeholder="e.g., 6"
            fullWidth
          />
        </TextField>
      </div>
    </div>
  );
}

// STEP 3: Expertise & Learning Goals
function StudentExpertiseForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Expertise & Interests</Typography.Heading>
        <Description>Highlight your skillset and focus domains</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        {/* Area of Expertise / Domain */}
        <TextField>
          <Label htmlFor="student-expertise">Area of Expertise / Focus</Label>
          <Input
            id="student-expertise"
            placeholder="e.g., Frontend Development, UI/UX"
            fullWidth
          />
        </TextField>
        

        {/* Core Skills Summary */}
        <TextField>
          <Label htmlFor="student-bio">Skills</Label>
          <Input
            id="student-expertise"
            placeholder="e.g., Frontend Development, UI/UX"
            fullWidth
          />
        </TextField>
        {/* CV / Resume Upload Box */}
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
  const [activeForm, setActiveForm] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (activeForm < totalSteps) {
      setActiveForm((prev) => prev + 1);
    } else {
      console.log("Student Profile Setup Finalized!");
    }
  };

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2 bg-accent-soft">
      {/* Left Side: Dynamic Student Form Wizard */}
      <div className="flex flex-col items-center justify-center p-6 my-8">
        <div className="flex w-80 flex-col gap-6">
          {/* Conditional Multi-step rendering */}
          {activeForm === 1 && <StudentGeneralForm />}
          {activeForm === 2 && <StudentAcademicForm />}
          {activeForm === 3 && <StudentExpertiseForm />}

          {/* Wizard Controls */}
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
            <Button size="lg" fullWidth onClick={handleNext}>
              {activeForm === totalSteps ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side: Image Cover Panel */}
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
