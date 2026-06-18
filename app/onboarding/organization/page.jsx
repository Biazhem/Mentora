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

function GeneralForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>General</Typography.Heading>
        <Description>Tell us about your company's general info</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <div className="relative flex flex-col items-center justify-center w-30 h-30 bg-accent-soft-hover rounded-lg border border-dashed border-muted/40 cursor-pointer hover:bg-accent-soft transition-colors group overflow-hidden">
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) updateField("orgLogo", URL.createObjectURL(file));
            }}
          />
          {formData.orgLogo ? (
            <img src={formData.orgLogo} alt="Logo preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-muted font-medium group-hover:text-primary transition-colors">Upload Logo</span>
          )}
        </div>

        <TextField>
          <Label htmlFor="input-org-name">Organization Name</Label>
          <Input
            id="input-org-name"
            placeholder="Acme Inc"
            fullWidth
            value={formData.orgName}
            onChange={(e) => updateField("orgName", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label htmlFor="input-desc">Description</Label>
          <TextArea
            id="input-desc"
            rows={4}
            fullWidth
            placeholder="Small description for company"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
          <Description className="text-right text-xs">{formData.description.length}/30</Description>
        </TextField>
      </div>
    </div>
  );
}

function DetailForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Details</Typography.Heading>
        <Description>Tell us about your company's info</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="input-org-email">Organization Email</Label>
          <Input
            id="input-org-email"
            placeholder="example@acme.com"
            fullWidth
            value={formData.orgEmail}
            onChange={(e) => updateField("orgEmail", e.target.value)}
          />
        </TextField>
        <TextField>
          <Label htmlFor="input-type-com">Type of company</Label>
          <Input
            id="input-type-com"
            placeholder="e.g., Tech, Finance, Healthcare"
            fullWidth
            value={formData.companyType}
            onChange={(e) => updateField("companyType", e.target.value)}
          />
        </TextField>
        <div className="grid grid-cols-2 gap-2">
          <TextField>
            <Label htmlFor="input-type-size">Company size</Label>
            <Input
              id="input-type-size"
              type="number"
              placeholder="e.g., 50"
              fullWidth
              value={formData.companySize}
              onChange={(e) => updateField("companySize", e.target.value)}
            />
          </TextField>
          <TextField>
            <Label htmlFor="input-type-strg">Company level</Label>
            <Input
              id="input-type-strg"
              placeholder="e.g., large scale"
              fullWidth
              value={formData.companyLevel}
              onChange={(e) => updateField("companyLevel", e.target.value)}
            />
          </TextField>
        </div>
      </div>
    </div>
  );
}

function ContactForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Contact</Typography.Heading>
        <Description>Tell us about your company's contact info</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <TextField>
          <Label htmlFor="input-org-phone">Organization Phone</Label>
          <Input
            id="input-org-phone"
            placeholder="+92 300 1234567"
            fullWidth
            value={formData.orgPhone}
            onChange={(e) => updateField("orgPhone", e.target.value)}
          />
        </TextField>
        <TextField>
          <Label htmlFor="input-type-web">Website</Label>
          <Input
            id="input-type-web"
            placeholder="acme.com"
            fullWidth
            value={formData.website}
            onChange={(e) => updateField("website", e.target.value)}
          />
        </TextField>
        <TextField>
          <Label htmlFor="input-type-addr">Country</Label>
          <Input
            id="input-type-addr"
            placeholder="Pakistan"
            fullWidth
            value={formData.country}
            onChange={(e) => updateField("country", e.target.value)}
          />
        </TextField>
        <div className="grid grid-cols-2 gap-2">
          <TextField>
            <Label htmlFor="input-type-ct">City</Label>
            <Input
              id="input-type-ct"
              placeholder="Islamabad"
              fullWidth
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </TextField>
          <TextField>
            <Label htmlFor="input-type-pc">Postal code</Label>
            <Input
              id="input-type-pc"
              placeholder="009560"
              fullWidth
              value={formData.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
            />
          </TextField>
        </div>
        <TextField>
          <Label htmlFor="input-type-sa">Street Address</Label>
          <TextArea
            id="input-type-sa"
            placeholder="thathaal street, near bla bla"
            fullWidth
            value={formData.streetAddress}
            onChange={(e) => updateField("streetAddress", e.target.value)}
          />
        </TextField>
      </div>
    </div>
  );
}

function FounderForm({ formData, updateField }) {
  return (
    <div className="space-y-2">
      <div>
        <Typography.Heading level={3}>Founder/CEO</Typography.Heading>
        <Description>Tell us about your company's founder</Description>
      </div>
      <div className="flex w-80 flex-col gap-4">
        <div className="relative flex flex-col items-center justify-center w-30 h-30 bg-accent-soft-hover rounded-lg border border-dashed border-muted/40 cursor-pointer hover:bg-accent-soft transition-colors group overflow-hidden">
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) updateField("founderPhoto", URL.createObjectURL(file));
            }}
          />
          {formData.founderPhoto ? (
            <img src={formData.founderPhoto} alt="Photo preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-muted font-medium group-hover:text-primary transition-colors">Upload Photo</span>
          )}
        </div>
        <TextField>
          <Label htmlFor="input-ceo-name">Full Name</Label>
          <Input
            id="input-ceo-name"
            placeholder="Alex"
            fullWidth
            value={formData.founderName}
            onChange={(e) => updateField("founderName", e.target.value)}
          />
        </TextField>
        <TextField>
          <Label htmlFor="input-ceo-email">Email</Label>
          <Input
            id="input-ceo-email"
            placeholder="alex@em.com"
            fullWidth
            value={formData.founderEmail}
            onChange={(e) => updateField("founderEmail", e.target.value)}
          />
        </TextField>
        <TextField>
          <Label htmlFor="input-ceo-phone">Phone</Label>
          <Input
            id="input-ceo-phone"
            type="text"
            placeholder="+92 301900008"
            fullWidth
            value={formData.founderPhone}
            onChange={(e) => updateField("founderPhone", e.target.value)}
          />
        </TextField>
        <div className="grid grid-cols-2 gap-2">
          <TextField>
            <Label htmlFor="input-ceo-gender">Gender</Label>
            <Input
              id="input-ceo-gender"
              placeholder="Male"
              fullWidth
              value={formData.founderGender}
              onChange={(e) => updateField("founderGender", e.target.value)}
            />
          </TextField>
          <TextField>
            <Label htmlFor="input-ceo-dob">Date of Birth</Label>
            <Input
              id="input-ceo-dob"
              type="date"
              fullWidth
              value={formData.founderDob}
              onChange={(e) => updateField("founderDob", e.target.value)}
            />
          </TextField>
        </div>
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
    orgLogo: "",
    orgName: "",
    description: "",
    orgEmail: "",
    companyType: "",
    companySize: "",
    companyLevel: "",
    orgPhone: "",
    website: "",
    country: "",
    city: "",
    postalCode: "",
    streetAddress: "",
    founderPhoto: "",
    founderName: "",
    founderEmail: "",
    founderPhone: "",
    founderGender: "",
    founderDob: "",
  });
  const totalSteps = 4;

  useEffect(() => {
    async function checkExisting() {
      if (!isLoaded || !user) return;

      const { data, error } = await supabase
        .from("organizations")
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
      const { error } = await supabase.from("organizations").insert({
        clerk_id: user.id,
        org_name: formData.orgName,
        description: formData.description,
        org_email: formData.orgEmail,
        company_type: formData.companyType,
        company_size: formData.companySize,
        company_level: formData.companyLevel,
        org_phone: formData.orgPhone,
        website: formData.website,
        country: formData.country,
        city: formData.city,
        postal_code: formData.postalCode,
        street_address: formData.streetAddress,
        founder_name: formData.founderName,
        founder_email: formData.founderEmail,
        founder_phone: formData.founderPhone,
        founder_gender: formData.founderGender,
        founder_dob: formData.founderDob,
      });

      if (error) throw error;

      router.push("/dashboard");
    } catch (err) {
      console.error("Organization insert error:", err);
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
      <div className="flex flex-col items-center justify-center p-6">
        <div className="flex w-80 flex-col gap-4">
          {activeForm === 1 && <GeneralForm formData={formData} updateField={updateField} />}
          {activeForm === 2 && <DetailForm formData={formData} updateField={updateField} />}
          {activeForm === 3 && <ContactForm formData={formData} updateField={updateField} />}
          {activeForm === 4 && <FounderForm formData={formData} updateField={updateField} />}

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
        <div className="absolute inset-0 bg-linear-to-r from-background/10 to-transparent" />
      </div>
    </div>
  );
}
