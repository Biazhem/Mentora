"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Button, Card, Input, Label, Surface, TextArea, TextField } from "@heroui/react";
import { AlertCircle, Upload, Building2, Globe, Tag, ArrowLeft, ArrowRight } from "lucide-react";

export default function OrganizationOnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    category: "",
  });

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setLogoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (eOrValue, nameArg) => {
    if (eOrValue && eOrValue.target) {
      const { name, value } = eOrValue.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (nameArg) {
      setForm((prev) => ({ ...prev, [nameArg]: eOrValue ?? "" }));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const userEmail = user.primaryEmailAddress?.emailAddress || "";
      const orgName = form.name.trim();
      if (!orgName || !form.website.trim()) throw new Error("Name and Website are required");

      const { data: userData } = await supabase.from("users").select("id").eq("email", userEmail);
      if (!userData?.length) throw new Error("User not found");

      const userId = userData[0].id;
      await supabase.from("users").update({ user_type: "organisation" }).eq("id", userId);
      await supabase.from("organisation").upsert({
        owner_id: userId,
        name: orgName,
        category: form.category,
        description: form.description,
        website: form.website,
        logo: logoBase64,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Button variant="ghost" onPress={() => router.back()} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Selection
        </Button>

        <Surface variant="secondary" className="rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-accent p-3 text-accent-foreground">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Organization Profile</h1>
              <p className="text-sm text-muted">Tell us about your company or institution.</p>
            </div>
          </div>
        </Surface>

        {error ? (
          <Card variant="secondary">
            <Card.Content className="flex items-center gap-2 text-danger">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </Card.Content>
          </Card>
        ) : null}

        <Card>
          <Card.Content className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField name="name" value={form.name} onChange={(value) => handleInputChange(value, "name")}>
                <Label>Organization Name *</Label>
                <Input placeholder="Acme Inc." />
              </TextField>

              <TextField name="website" type="url" value={form.website} onChange={(value) => handleInputChange(value, "website")}>
                <Label>Website *</Label>
                <Input placeholder="https://acme.com" />
              </TextField>

              <TextField name="category" value={form.category} onChange={(value) => handleInputChange(value, "category")}>
                <Label>Category</Label>
                <Input placeholder="Technology, Education, Research" />
              </TextField>
            </div>

            <TextField name="description" value={form.description} onChange={(value) => handleInputChange(value, "description")}>
              <Label>Description</Label>
              <TextArea rows={5} placeholder="What does your organization do?" />
            </TextField>

            <div className="space-y-2">
              <Label>Organization Logo</Label>
              <div className="rounded-2xl border border-dashed p-4">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="mb-3 h-24 w-24 rounded-xl object-cover" /> : null}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="block w-full text-sm" />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button onPress={handleSubmit} isDisabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating Profile..." : "Complete Setup"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" isDisabled={isSubmitting}>Cancel</Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
