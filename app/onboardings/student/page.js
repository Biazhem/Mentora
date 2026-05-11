"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  Upload,
} from "lucide-react";
import {
  Button,
  Card,
  Chip,
  Input,
  Label,
  Surface,
  TextArea,
  TextField,
} from "@heroui/react";
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
  const [parsedData, setParsedData] = useState(null);
  const [step, setStep] = useState(0);
  const steps = ["Name", "Contact", "Academics"];

  const handleSelectChange = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

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
      const res = await fetch("/api/conver-parse", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Parsing failed");
      const json = await res.json();
      setParsedData(json.parsed || { name: json.name || "", email: json.email || "" });
    } catch (err) {
      console.error("Resume upload error", err);
      setParseError("Error uploading or parsing resume.");
    } finally {
      setIsParsing(false);
    }
  };

  useEffect(() => {
    if (formData.firstName || formData.lastName) {
      const s = `${formData.firstName} ${formData.lastName}`.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
      setSlug(s);
    } else {
      setSlug("");
    }
  }, [formData.firstName, formData.lastName]);

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const fetchFromCv = async () => {
    if (!formData.cv) return setParseError("Please upload a CV first.");
    try {
      setIsParsing(true);
      setParseError("");
      const fd = new FormData();
      fd.append("file", formData.cv);
      fd.append("fetch_fields", "qualifications,skills,program,bio");
      const res = await fetch("/api/conver-parse", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Parsing failed");
      const json = await res.json();
      const p = json.parsed || {};
      setFormData((prev) => ({
        ...prev,
        program: p.program || prev.program,
        programCustom: p.programCustom || prev.programCustom || "",
        degree: p.degree || prev.degree,
        bio: p.bio || p.about_me || prev.bio,
        skills: p.skills ? [...new Set([...(Array.isArray(p.skills) ? p.skills : [p.skills]), ...prev.skills])] : prev.skills,
        languages: p.languages ? [...new Set([...(Array.isArray(p.languages) ? p.languages : [p.languages]), ...prev.languages])] : prev.languages,
      }));
    } catch (err) {
      console.error("Fetch from CV error", err);
      setParseError("Unable to fetch details from CV.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddSkill = () => {
    if (formData.currentSkill.trim() && !formData.skills.includes(formData.currentSkill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, prev.currentSkill.trim()], currentSkill: "" }));
    }
  };

  const handleAddLanguage = () => {
    if (formData.currentLanguage.trim() && !formData.languages.includes(formData.currentLanguage.trim())) {
      setFormData((prev) => ({ ...prev, languages: [...prev.languages, prev.currentLanguage.trim()], currentLanguage: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < steps.length - 1) return nextStep();
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
      skills: parsedData.skills ? [...new Set([...prev.skills, ...(Array.isArray(parsedData.skills) ? parsedData.skills : [parsedData.skills])])] : prev.skills,
      languages: parsedData.languages ? [...new Set([...prev.languages, ...(Array.isArray(parsedData.languages) ? parsedData.languages : [parsedData.languages])])] : prev.languages,
      experiences: parsedData.experience ? (Array.isArray(parsedData.experience) ? parsedData.experience : [parsedData.experience]) : prev.experiences,
    }));

    setParsedData(null);
  };

  const handleChange = (eOrValue, nameArg) => {
    if (eOrValue && eOrValue.target) {
      const { name, value } = eOrValue.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (nameArg) {
      setFormData((prev) => ({ ...prev, [nameArg]: eOrValue ?? "" }));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Button variant="ghost" onPress={() => router.back()} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Selection
        </Button>

        <Surface variant="secondary" className="rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-success p-3 text-success-foreground">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Student Profile</h1>
              <p className="text-sm text-muted">Set up your academic identity and start your journey.</p>
            </div>
          </div>
        </Surface>

        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={s} variant={i === step ? "tertiary" : "default"}>
              <Card.Content className="flex items-center gap-3">
                <Chip color={i <= step ? "success" : "default"} size="sm" variant="soft">Step {i + 1}</Chip>
                <p className="text-sm font-medium">{s}</p>
              </Card.Content>
            </Card>
          ))}
        </div>

        {isParsing ? (
          <Card variant="secondary"><Card.Content className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Analyzing your resume...</Card.Content></Card>
        ) : null}
        {parseError ? (
          <Card variant="secondary"><Card.Content className="flex items-center gap-2 text-sm text-danger"><AlertCircle className="h-4 w-4" />{parseError}</Card.Content></Card>
        ) : null}

        <Card>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField name="firstName" value={formData.firstName} onChange={(value) => handleChange(value, "firstName")}><Label>First Name *</Label><Input /></TextField>
                  <TextField name="lastName" value={formData.lastName} onChange={(value) => handleChange(value, "lastName")}><Label>Last Name *</Label><Input /></TextField>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField name="email" type="email" value={formData.email} onChange={(value) => handleChange(value, "email")}><Label>Email *</Label><Input /></TextField>
                  <TextField name="phone" value={formData.phone} onChange={(value) => handleChange(value, "phone")}><Label>Phone *</Label><Input /></TextField>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField name="program" value={formData.program} onChange={(value) => handleChange(value, "program")}><Label>Program</Label><Input placeholder="Computer Science" /></TextField>
                    <TextField name="degree" value={formData.degree} onChange={(value) => handleChange(value, "degree")}><Label>Highest Degree</Label><Input placeholder="Bachelor" /></TextField>
                  </div>

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input value={formData.currentSkill} onChange={(e) => setFormData((prev) => ({ ...prev, currentSkill: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())} placeholder="Add a skill" />
                      <Button type="button" variant="secondary" onPress={handleAddSkill}>Add</Button>
                      <Button type="button" variant="outline" onPress={fetchFromCv}>Fetch from CV</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Chip key={skill} color="success" variant="soft">
                          <Chip.Label>{skill}</Chip.Label>
                          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))}><X className="h-3 w-3" /></button>
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="flex gap-2">
                      <Input value={formData.currentLanguage} onChange={(e) => setFormData((prev) => ({ ...prev, currentLanguage: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLanguage())} placeholder="Add a language" />
                      <Button type="button" variant="secondary" onPress={handleAddLanguage}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang) => (
                        <Chip key={lang} color="accent" variant="soft">
                          <Chip.Label>{lang}</Chip.Label>
                          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, languages: prev.languages.filter((l) => l !== lang) }))}><X className="h-3 w-3" /></button>
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <TextField name="bio" value={formData.bio} onChange={(value) => handleChange(value, "bio")}><Label>Bio</Label><TextArea rows={4} /></TextField>

                  <div className="space-y-2">
                    <Label>CV / Resume</Label>
                    <div className="rounded-2xl border border-dashed p-4">
                      <input type="file" name="cv" accept=".pdf,.doc,.docx,.txt,.rtf" onChange={handleFileChange} className="mb-3 block w-full text-sm" />
                      <p className="text-sm text-muted">{cvFileName || "Upload your CV"}</p>
                      <div className="mt-3 flex gap-2">
                        <Button type="button" size="sm" variant="outline" onPress={fetchFromCv}><Upload className="mr-2 h-3 w-3" />Fetch qualifications</Button>
                        {parsedData ? <Button type="button" size="sm" onPress={applyParsedData}>Apply Parsed Data</Button> : null}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between border-t pt-4">
                <div>{step > 0 ? <Button type="button" variant="ghost" onPress={prevStep}>Back</Button> : null}</div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onPress={() => setFormData(initialForm)}>Reset</Button>
                  {step < 2 ? (
                    <Button type="button" onPress={nextStep}>Next</Button>
                  ) : (
                    <Link href="/dashboard"><Button type="submit">Complete Registration</Button></Link>
                  )}
                </div>
              </div>
            </form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
