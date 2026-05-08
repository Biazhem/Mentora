"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  School,
  GraduationCap,
  Calendar,
  MapPin,
  FileText,
  Upload,
  X,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const initialForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    program: "",
    programCustom: "",
    degree: "",
    dateOfBirth: "",
    address: "",
    bio: "",
    cv: null,
    skills: [],
    experiences: [],
    languages: [],
    currentSkill: "",
    currentLanguage: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [cvFileName, setCvFileName] = useState("");
  const [slug, setSlug] = useState("");

  const programs = [
    "Computer Science",
    "Electrical Engineering",
    "Business",
    "Economics",
    "Other",
  ];
  const degrees = [
    "High School",
    "Associate",
    "Bachelor",
    "Master",
    "PhD",
    "Other",
  ];

  const handleSelectChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, cv: file }));
    setCvFileName(file.name);
    setParsedData(null);

    try {
      setIsParsing(true);
      setParseError("");

      const fd = new FormData();
      fd.append("file", file);

      // Upload file to internal API which will call APYHub and return extracted text + parsed fields
      const res = await fetch("/api/conver-parse", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Parsing failed: ${res.status} ${text}`);
      }

      const json = await res.json();
      // Expected shape: { text: string, parsed: { name, email, phone, bio, skills, languages, experience } }
      setParsedData(
        json.parsed || { name: json.name || "", email: json.email || "" },
      );
    } catch (err) {
      console.error("Resume upload error", err);
      setParseError("Error uploading or parsing resume.");
    } finally {
      setIsParsing(false);
    }
  };

  useEffect(() => {
    if (formData.firstName || formData.lastName) {
      const s = `${formData.firstName} ${formData.lastName}`
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
      setSlug(s);
    } else {
      setSlug("");
    }
  }, [formData.firstName, formData.lastName]);

  const [parsedData, setParsedData] = useState(null);

  const [step, setStep] = useState(0);
  const steps = ["Name", "Contact", "Academics"];

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const fetchFromCv = async () => {
    if (!formData.cv) {
      setParseError("Please upload a CV first.");
      return;
    }

    try {
      setIsParsing(true);
      setParseError("");

      const fd = new FormData();
      fd.append("file", formData.cv);
      // Inform backend we're only interested in qualifications/skills/program/bio (backend may ignore)
      fd.append("fetch_fields", "qualifications,skills,program,bio");

      const res = await fetch("/api/conver-parse", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Parsing failed: ${res.status} ${txt}`);
      }

      const json = await res.json();
      const p = json.parsed || {};

      setFormData((prev) => ({
        ...prev,
        program: p.program || prev.program,
        programCustom: p.programCustom || prev.programCustom || "",
        degree: p.degree || prev.degree,
        bio: p.bio || p.about_me || prev.bio,
        skills: p.skills
          ? [
              ...new Set([
                ...(Array.isArray(p.skills) ? p.skills : [p.skills]),
                ...prev.skills,
              ]),
            ]
          : prev.skills,
        languages: p.languages
          ? [
              ...new Set([
                ...(Array.isArray(p.languages) ? p.languages : [p.languages]),
                ...prev.languages,
              ]),
            ]
          : prev.languages,
      }));
    } catch (err) {
      console.error("Fetch from CV error", err);
      setParseError("Unable to fetch details from CV.");
    } finally {
      setIsParsing(false);
    }
  };

  const pollJobStatus = async (statusUrl) => {
    const apiKey = process.env.NEXT_PUBLIC_RESUMEAPI;

    try {
      const response = await fetch(statusUrl, {
        headers: {
          "apy-token": apiKey,
        },
      });

      const result = await response.json();

      if (
        result.status === "success" ||
        (result.data && result.status !== "processing")
      ) {
        const resumeData = result.data || result;

        // Store parsed data for user to review and apply manually
        setParsedData(resumeData);
        setIsParsing(false);
      } else if (result.status === "failed") {
        setParseError("Resume parsing failed. Please fill details manually.");
        setIsParsing(false);
      } else {
        setTimeout(() => pollJobStatus(statusUrl), 2000);
      }
    } catch (error) {
      console.error("Polling error:", error);
      setParseError("Error checking parsing status.");
      setIsParsing(false);
    }
  };

  const handleAddSkill = () => {
    if (
      formData.currentSkill.trim() &&
      !formData.skills.includes(formData.currentSkill.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.currentSkill.trim()],
        currentSkill: "",
      }));
    }
  };

  const handleAddLanguage = () => {
    if (
      formData.currentLanguage.trim() &&
      !formData.languages.includes(formData.currentLanguage.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, prev.currentLanguage.trim()],
        currentLanguage: "",
      }));
    }
  };

  const removeSkill = (skill) =>
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  const removeLanguage = (lang) =>
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // If not on final step, move to next step instead of submitting
    if (step < steps.length - 1) {
      nextStep();
      return;
    }

    // TODO: persist formData to backend (validate and save here)
  };

  const applyParsedData = () => {
    if (!parsedData) return;
    const names = parsedData.name ? parsedData.name.split(" ") : [];
    const fName = names[0] || "";
    const lName = names.slice(1).join(" ") || "";

    setFormData((prev) => ({
      ...prev,
      firstName: fName || prev.firstName,
      lastName: lName || prev.lastName,
      email: parsedData.email || prev.email,
      phone: parsedData.phone || prev.phone,
      bio: parsedData.bio || prev.bio || parsedData.about_me || prev.bio,
      skills: parsedData.skills
        ? [
            ...new Set([
              ...prev.skills,
              ...(Array.isArray(parsedData.skills)
                ? parsedData.skills
                : [parsedData.skills]),
            ]),
          ]
        : prev.skills,
      languages: parsedData.languages
        ? [
            ...new Set([
              ...prev.languages,
              ...(Array.isArray(parsedData.languages)
                ? parsedData.languages
                : [parsedData.languages]),
            ]),
          ]
        : prev.languages,
      experiences: parsedData.experience
        ? Array.isArray(parsedData.experience)
          ? parsedData.experience
          : [parsedData.experience]
        : prev.experiences,
    }));

    setParsedData(null);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files && files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      setCvFileName(files && files[0] ? files[0].name : "");
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 hover:bg-emerald-50 text-emerald-700 font-medium"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Selection
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl w-16 h-16 mb-4 shadow-lg shadow-emerald-200">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
            Student Profile
          </h1>
          <p className="text-slate-500">
            Set up your academic identity and start your journey
          </p>
        </div>

        {/* Step Indicators */}
        <div className="mb-6 flex items-center justify-between gap-4">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={`flex items-center gap-3 p-3 rounded-xl ${i === step ? "bg-emerald-600 text-white" : "bg-white border border-slate-100 text-slate-700"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === step ? "bg-white text-emerald-600" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {i + 1}
                </div>
                <div>
                  <div className="text-xs font-semibold">{s}</div>
                  <div className="text-xs text-slate-400">
                    {i === 0
                      ? "Your name"
                      : i === 1
                        ? "Contact"
                        : "Academics & CV"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isParsing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-800 font-medium">
              Analyzing your resume... Parsing results will be available for
              review.
            </p>
          </div>
        )}

        {parseError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">{parseError}</p>
          </div>
        )}

        <Card className="shadow-xl border-slate-200/60 overflow-hidden rounded-3xl">
          <div className="h-2 w-full bg-gradient-to-r from-emerald-600 to-teal-500" />
          <CardContent className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP CONTENT */}
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      First Name *
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="pl-12 h-12 rounded-xl"
                        placeholder="John"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Last Name *
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="pl-12 h-12 rounded-xl"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Email Address *
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-12 h-12 rounded-xl"
                        placeholder="john@university.edu"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Phone Number *
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="pl-12 h-12 rounded-xl"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Program
                    </Label>
                    <div className="relative group">
                      <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                      <Select
                        value={formData.program}
                        onValueChange={(v) => handleSelectChange("program", v)}
                      >
                        <SelectTrigger className="pl-12 h-12 rounded-xl">
                          <SelectValue placeholder="Select Program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Highest Degree
                    </Label>
                    <div className="relative group">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                      <Select
                        value={formData.degree}
                        onValueChange={(v) => handleSelectChange("degree", v)}
                      >
                        <SelectTrigger className="pl-12 h-12 rounded-xl">
                          <SelectValue placeholder="Select Degree" />
                        </SelectTrigger>
                        <SelectContent>
                          {degrees.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.program === "Other" && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-sm font-semibold text-slate-700">
                        Specify Program
                      </Label>
                      <Input
                        name="programCustom"
                        value={formData.programCustom}
                        onChange={handleChange}
                        className="h-12 rounded-xl"
                        placeholder="Enter your custom program name"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">
                      Skills
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill (e.g. React, Python)"
                        value={formData.currentSkill}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            currentSkill: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddSkill())
                        }
                        className="rounded-xl"
                      />
                      <Button
                        type="button"
                        onClick={handleAddSkill}
                        variant="secondary"
                      >
                        Add
                      </Button>
                      <div className="ml-auto flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={fetchFromCv}
                        >
                          Fetch from CV
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge
                          key={skill}
                          className="bg-emerald-100 text-emerald-700 border-emerald-200 py-1 px-3 flex items-center gap-2"
                        >
                          {skill}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-emerald-900"
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">
                      Languages
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a language (e.g. English, French)"
                        value={formData.currentLanguage}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            currentLanguage: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddLanguage())
                        }
                        className="rounded-xl"
                      />
                      <Button
                        type="button"
                        onClick={handleAddLanguage}
                        variant="secondary"
                      >
                        Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang) => (
                        <Badge
                          key={lang}
                          className="bg-blue-100 text-blue-700 border-blue-200 py-1 px-3 flex items-center gap-2"
                        >
                          {lang}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-blue-900"
                            onClick={() => removeLanguage(lang)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">
                      Bio
                    </Label>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="rounded-xl"
                      placeholder="Tell us about your academic interests and career goals..."
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-sm font-semibold text-slate-700">
                      CV / Resume
                    </Label>
                    <div
                      className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${cvFileName ? "bg-emerald-50 border-emerald-300" : "bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"}`}
                    >
                      <input
                        type="file"
                        name="cv"
                        accept=".pdf,.doc,.docx,.txt,.rtf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${cvFileName ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-400 shadow-sm"}`}
                        >
                          {cvFileName ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Upload className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {cvFileName ||
                              "Click to upload your CV (PDF preferred)"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            PDF/DOC/DOCX/TXT/RTF up to 10MB
                          </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={fetchFromCv}
                            variant="outline"
                          >
                            Fetch qualifications & skills
                          </Button>
                          {parsedData && (
                            <Button size="sm" onClick={() => applyParsedData()}>
                              Apply Parsed Data
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NAV CONTROLS */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="flex-1">
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={prevStep}
                      className="h-12"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData(initialForm)}
                    className="h-12"
                  >
                    Reset
                  </Button>
                  {step < 2 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="h-12 bg-emerald-600 text-white"
                    >
                      Next
                    </Button>
                  ) : (
                    <Link href={"/dashboard"}>
                      <Button
                        type="submit"
                        className="h-12 bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
                      >
                        Complete Registration
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}
    >
      {children}
    </span>
  );
}
