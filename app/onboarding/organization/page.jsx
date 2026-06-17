"use client";

import { useState } from "react";
import {
  Input,
  Button,
  Description,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { Typography } from "@heroui/react";

function GeneralForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>General</Typography.Heading>
        <Description>Tell us about your company's ganeral</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        {/* Avatar/Logo Placeholder box */}
        <div className="w-30 h-30 bg-accent-soft-hover rounded-lg" />

        {/* Organization Name Field */}
        <TextField>
          <Label htmlFor="input-org-name">Organization Name</Label>
          <Input id="input-org-name" placeholder="Acme Inc" fullWidth />
        </TextField>

        {/* Description Field */}
        <TextField>
          <Label htmlFor="input-desc">Description</Label>
          <TextArea
            id="input-desc"
            rows={4}
            fullWidth
            placeholder="small description for company"
          />
          <Description className="text-right text-xs">0/30</Description>
        </TextField>
      </div>
    </div>
  );
}

function DetailForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Details</Typography.Heading>
        <Description>Tell us about your company's info</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="input-org-name">Organization Email</Label>
          <Input id="input-org-name" placeholder="example@acme.com" fullWidth />
        </TextField>
        <TextField>
          <Label htmlFor="input-type-com">Type of company</Label>
          <Input id="input-type-com" placeholder="example@acme.com" fullWidth />
        </TextField>
        <div className="grid grid-cols-2 gap-2">
          <TextField>
            <Label htmlFor="input-type-size">Comany size</Label>
            <Input
              id="input-type-size"
              type="number"
              placeholder="intermediate"
              fullWidth
            />
          </TextField>
          <TextField>
            <Label htmlFor="input-type-strg">Company level</Label>
            <Input id="input-type-strg" placeholder="large scale" fullWidth />
          </TextField>
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Contact</Typography.Heading>
        <Description>Tell us about your company's info</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="input-org-phone">Organization Phone</Label>
          <Input
            id="input-org-phone"
            placeholder="example@acme.com"
            fullWidth
          />
        </TextField>
        <TextField>
          <Label htmlFor="input-type-web">Website</Label>
          <Input id="input-type-web" placeholder="acme.com" fullWidth />
        </TextField>
        <TextField>
          <Label htmlFor="input-type-addr">Contry</Label>
          <Input id="input-type-web" placeholder="Pakistan" fullWidth />
        </TextField>
        <div className="grid grid-cols-2 gap-2">
          <TextField>
            <Label htmlFor="input-type-ct">City</Label>
            <Input id="input-type-ct" placeholder="Islamabad" fullWidth />
          </TextField>
          <TextField>
            <Label htmlFor="input-type-pc">Postal code</Label>
            <Input id="input-type-pc" placeholder="009560" fullWidth />
          </TextField>
        </div>
        <TextField>
          <Label htmlFor="input-type-sa">Street Address</Label>
          <TextArea
            id="input-type-sa"
            placeholder="thathaal street, near bla bla"
            fullWidth
          />
        </TextField>
      </div>
    </div>
  );
}

function FounderForm() {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Founder/CEO</Typography.Heading>
        <Description>Tell us about your company's info</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <div className="w-30 h-30 bg-accent-soft-hover rounded-lg" />
        <TextField>
          <Label htmlFor="input-ceo-name">Full Name</Label>
          <Input id="input-ceo-name" placeholder="alex" fullWidth />
        </TextField>
        <TextField>
          <Label htmlFor="input-ceo-email">Email</Label>
          <Input id="input-ceo-email" placeholder="alex@em.com" fullWidth />
        </TextField>
        <TextField>
          <Label htmlFor="input-type-com">Phone</Label>
          <Input
            type="text"
            id="input-type-com"
            placeholder="+92 301900008"
            fullWidth
          />
        </TextField>
        <div className="grid grid-cols-2 gap-2">
          <TextField>
            <Label htmlFor="input-type-size">Gender</Label>
            <Input
              id="male"
              type="number"
              placeholder="intermediate"
              fullWidth
            />
          </TextField>
          <TextField>
            <Label htmlFor="input-type-strg">Date of Birth</Label>
            <Input
              id="input-type-strg"
              type="date"
              placeholder="DD/MM/YYYY"
              fullWidth
            />
          </TextField>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [activeForm, setActiveForm] = useState(1);

  return (
    <div className="grid min-h-svh w-full grid-cols-1 lg:grid-cols-2 bg-accent-soft">
      {/* Left Side: Form Container */}
      <div className="flex flex-col items-center justify-center p-6">
        <div className="flex w-80 flex-col gap-4">
          {activeForm === 1 && <GeneralForm />}
          {activeForm === 2 && <DetailForm />}
          {activeForm === 3 && <ContactForm />}
          {activeForm === 4 && <FounderForm />}
          <div className="flex gap-2 items-center">
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
              onClick={() => setActiveForm((prev) => prev + 1)}
            >
              {activeForm == 4? "Complete" : "Next"}
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
        <div className="absolute inset-0 bg-linear-to-r from-background/10 to-transparent" />
      </div>
    </div>
  );
}
