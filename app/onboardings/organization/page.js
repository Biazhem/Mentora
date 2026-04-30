"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Upload, Building2, Globe, Tag, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 hover:bg-blue-50 text-blue-700 font-medium"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Selection
        </Button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl w-16 h-16 mb-6 shadow-lg shadow-blue-200">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Organization Profile</h1>
          <p className="text-slate-500 text-lg">Tell us about your company or institution</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        <Card className="shadow-xl border-slate-200/60 overflow-hidden rounded-3xl">
          <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-cyan-500" />
          <CardContent className="p-8 md:p-12">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Organization Name *</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input name="name" value={form.name} onChange={handleInputChange} className="pl-12 h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500" placeholder="Acme Inc." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Website *</Label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input name="website" type="url" value={form.website} onChange={handleInputChange} className="pl-12 h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500" placeholder="https://acme.com" />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-semibold text-slate-700">Category</Label>
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input name="category" value={form.category} onChange={handleInputChange} className="pl-12 h-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500" placeholder="e.g. Technology, Education, Research" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Description</Label>
                  <Textarea name="description" value={form.description} onChange={handleInputChange} rows={5} className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none" placeholder="What does your organization do?" />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <Label className="text-sm font-semibold text-slate-700">Organization Logo</Label>
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {logoPreview && (
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-blue-100 shadow-inner group">
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        <button onClick={() => setLogoPreview(null)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Remove</span>
                        </button>
                      </div>
                    )}
                    <label className={`flex-1 w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${logoPreview ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm font-medium text-slate-900">Click to upload logo</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8 border-t border-slate-100">
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-200">
                  {isSubmitting ? "Creating Profile..." : "Complete Setup"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 text-slate-600 font-semibold" disabled={isSubmitting}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
