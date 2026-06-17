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

// STEP 1: General Info (Name, Pic, Bio)
function GeneralForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>General Info</Typography.Heading>
        <Description>Introduce yourself to your future mentees</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        {/* Mentor Profile Picture Placeholder */}
        <div className="flex flex-col items-center justify-center w-30 h-30 bg-accent-soft-hover rounded-xl border border-dashed border-muted/40 cursor-pointer hover:bg-accent-soft transition-colors">
          <span className="text-xs text-muted font-medium">Upload Pic</span>
        </div>

        {/* Mentor Full Name */}
        <TextField>
          <Label htmlFor="mentor-name">Full Name</Label>
          <Input id="mentor-name" placeholder="Alex Johnson" fullWidth />
        </TextField>

        {/* Mentor Bio */}
        <TextField>
          <Label htmlFor="mentor-bio">Biography / Summary</Label>
          <TextArea
            id="mentor-bio"
            rows={4}
            fullWidth
            placeholder="Share a short summary about your background, passions, and mentorship style..."
          />
          <Description className="text-right text-xs">0/160</Description>
        </TextField>
      </div>
    </div>
  );
}

// STEP 2: Personal Information (Gender, Contact, DOB)
function PersonalInfoForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Personal Details</Typography.Heading>
        <Description>Provide your personal contact information</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="mentor-email">Personal Email</Label>
          <Input id="mentor-email" type="email" placeholder="alex@example.com" fullWidth />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-phone">Phone Number</Label>
          <Input id="mentor-phone" type="tel" placeholder="+92 301 9000008" fullWidth />
        </TextField>

        <div className="grid grid-cols-2 gap-2">
          <TextField>
            <Label htmlFor="mentor-gender">Gender</Label>
            <Input id="mentor-gender" placeholder="e.g., Male, Female" fullWidth />
          </TextField>
          <TextField>
            <Label htmlFor="mentor-dob">Date of Birth</Label>
            <Input id="mentor-dob" type="date" fullWidth />
          </TextField>
        </div>
      </div>
    </div>
  );
}

// STEP 3: Professional & Expertise Information
function ExpertiseForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Expertise & Background</Typography.Heading>
        <Description>Share your professional credentials and target domains</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="mentor-field">Field / Industry</Label>
          <Input id="mentor-field" placeholder="e.g., Software Engineering" fullWidth />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-expertise">Area of Expertise</Label>
          <Input id="mentor-expertise" placeholder="e.g., React, System Design, Cloud" fullWidth />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-experience">Years of Experience</Label>
          <Input id="mentor-experience" type="number" min="0" placeholder="5" fullWidth />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-institute">Affiliated Institute / Company</Label>
          <Input id="mentor-institute" placeholder="NUST / Google" fullWidth />
        </TextField>

        <TextField>
          <Label htmlFor="mentor-inst-email">Institutional Email</Label>
          <Input id="mentor-inst-email" type="email" placeholder="alex@institute.edu" fullWidth />
        </TextField>
      </div>
    </div>
  );
}

export default function Page() {
  const [activeForm, setActiveForm] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (activeForm < totalSteps) {
      setActiveForm((prev) => prev + 1);
    } else {
      // Final step submit logic
      console.log("Profile Data Submitted Successfully!");
    }
  };

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2 bg-accent-soft">
      {/* Left Side: Form Container */}
      <div className="flex flex-col items-center justify-center p-6 my-8">
        <div className="flex w-80 flex-col gap-6">
          {/* Dynamic multi-step rendering */}
          {activeForm === 1 && <GeneralForm />}
          {activeForm === 2 && <PersonalInfoForm />}
          {activeForm === 3 && <ExpertiseForm />}

          {/* Flow Controls */}
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
            >
              {activeForm === totalSteps ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Image Cover Panel */}
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