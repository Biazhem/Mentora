"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  X,
  Globe,
  Code,
  Briefcase,
  Building,
  Award,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
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
import Link from "next/link";

export default function MentorOnboardingPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    program: "",
    programCustom: "",
    degree: "",
    address: "",
    bio: "",
    website: "",
    skills: [],
    currentSkill: "",
    languages: [],
    currentLanguage: "",
    experiences: [],
    currentJob: "",
    currentCompany: "",
    yearsOfExperience: "",
  });

  const [slug, setSlug] = useState("");
  const [emailError, setEmailError] = useState("");
  const [skillError, setSkillError] = useState("");
  const [step, setStep] = useState(0);
  const steps = ["Name", "Contact", "Academics"];

  const degrees = [
    "Bachelor of Science (B.Sc)",
    "Bachelor of Arts (B.A)",
    "Bachelor of Engineering (B.E)",
    "Master of Science (M.Sc)",
    "Master of Arts (M.A)",
    "Master of Business Administration (MBA)",
    "PhD",
    "Diploma",
    "Certificate",
  ];

  const validateInstitutionEmail = (email) => {
    const prohibitedDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "protonmail.com"];
    const emailDomain = email.split("@")[1];

    if (!emailDomain) return false;

    if (prohibitedDomains.includes(emailDomain.toLowerCase())) {
      setEmailError("Please use your institutional email (.edu, .ac, or company email)");
      return false;
    }

    if (emailDomain.includes(".edu") || emailDomain.includes(".ac") || emailDomain.length > 4) {
      setEmailError("");
      return true;
    }

    setEmailError("Please use a valid institutional email address");
    return false;
  };

  const generateSlug = (firstName, lastName) => {
    const randomId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const slugValue = `mentor-${firstName.toLowerCase()}-${lastName.toLowerCase()}-${randomId}`;
    setSlug(slugValue);
    return slugValue;
  };

  const updateField = (name, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "email") validateInstitutionEmail(value);
      if ((name === "firstName" || name === "lastName") && newData.firstName && newData.lastName) {
        generateSlug(newData.firstName, newData.lastName);
      }

      return newData;
    });
  };

  const handleChange = (eOrValue, nameArg) => {
    if (eOrValue && eOrValue.target) {
      const { name, value } = eOrValue.target;
      updateField(name, value);
      return;
    }
    if (nameArg) updateField(nameArg, eOrValue ?? "");
  };

  const handleAddSkill = () => {
    const skill = formData.currentSkill.trim();
    if (skill && !formData.skills.includes(skill)) {
      if (formData.skills.length < 20) {
        setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill], currentSkill: "" }));
        setSkillError("");
      } else {
        setSkillError("Maximum 20 skills allowed");
      }
    } else if (formData.skills.includes(skill)) {
      setSkillError("Skill already added");
    } else {
      setSkillError("Please enter a skill");
    }
  };

  const handleAddLanguage = () => {
    const lang = formData.currentLanguage.trim();
    if (lang && !formData.languages.includes(lang)) {
      setFormData((prev) => ({ ...prev, languages: [...prev.languages, lang], currentLanguage: "" }));
    }
  };

  const handleAddExperience = () => {
    if (formData.currentJob && formData.currentCompany) {
      const newExperience = {
        id: Date.now(),
        title: formData.currentJob,
        company: formData.currentCompany,
        years: formData.yearsOfExperience || "Present",
      };
      setFormData((prev) => ({
        ...prev,
        experiences: [...prev.experiences, newExperience],
        currentJob: "",
        currentCompany: "",
        yearsOfExperience: "",
      }));
      return;
    }
    alert("Please fill in both job title and company");
  };

  const nextStep = () => {
    if (step === 0 && (!formData.firstName || !formData.lastName)) return alert("Please enter your first and last name.");
    if (step === 1) {
      if (!formData.email || !formData.phone) return alert("Please provide your institutional email and phone number.");
      if (!validateInstitutionEmail(formData.email)) return alert("Please use an institutional email.");
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 2) return nextStep();

    if (!validateInstitutionEmail(formData.email)) return alert("Please use a valid institutional email address");
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.degree) {
      return alert("Please fill in all required fields");
    }
    if (formData.skills.length === 0) return alert("Please add at least one skill");

    alert(`Mentor profile created successfully!\nSlug: ${slug}\nSkills: ${formData.skills.length}\nExperience: ${formData.experiences.length}`);
  };

  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      program: "",
      programCustom: "",
      degree: "",
      address: "",
      bio: "",
      website: "",
      skills: [],
      currentSkill: "",
      languages: [],
      currentLanguage: "",
      experiences: [],
      currentJob: "",
      currentCompany: "",
      yearsOfExperience: "",
    });
    setSlug("");
    setEmailError("");
    setSkillError("");
    setStep(0);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Surface variant="secondary" className="rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-accent p-3 text-accent-foreground">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mentor Onboarding</h1>
              <p className="text-sm text-muted">Share your expertise and guide the next generation.</p>
            </div>
          </div>
        </Surface>

        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((s, idx) => (
            <Card key={s} variant={idx === step ? "tertiary" : "default"}>
              <Card.Content className="flex items-center gap-3">
                <Chip color={idx <= step ? "accent" : "default"} size="sm" variant="soft">Step {idx + 1}</Chip>
                <p className="text-sm font-medium">{s}</p>
              </Card.Content>
            </Card>
          ))}
        </div>

        <Card>
          <Card.Content>
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField name="firstName" value={formData.firstName} onChange={(value) => handleChange(value, "firstName")}>
                    <Label>First Name *</Label>
                    <Input placeholder="Enter first name" />
                  </TextField>
                  <TextField name="lastName" value={formData.lastName} onChange={(value) => handleChange(value, "lastName")}>
                    <Label>Last Name *</Label>
                    <Input placeholder="Enter last name" />
                  </TextField>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField name="email" type="email" value={formData.email} onChange={(value) => handleChange(value, "email")}>
                    <Label>Institutional Email *</Label>
                    <Input placeholder="mentor@institution.edu" />
                  </TextField>
                  <TextField name="phone" value={formData.phone} onChange={(value) => handleChange(value, "phone")}>
                    <Label>Phone *</Label>
                    <Input placeholder="+1 234 567 8900" />
                  </TextField>
                  {emailError ? <p className="text-sm text-danger md:col-span-2">{emailError}</p> : null}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextField name="website" value={formData.website} onChange={(value) => handleChange(value, "website")}>
                      <Label>Website</Label>
                      <Input placeholder="https://yourwebsite.com" />
                    </TextField>
                    <TextField name="degree" value={formData.degree} onChange={(value) => handleChange(value, "degree")}>
                      <Label>Highest Degree *</Label>
                      <Input placeholder={degrees[0]} />
                    </TextField>
                  </div>

                  <div className="space-y-2">
                    <Label>Skills & Expertise *</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.currentSkill}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currentSkill: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                        placeholder="e.g., React, Python, Leadership"
                      />
                      <Button type="button" onPress={handleAddSkill} variant="secondary"><Plus className="h-4 w-4" /></Button>
                    </div>
                    {skillError ? <p className="text-sm text-danger">{skillError}</p> : null}
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Chip key={skill} variant="secondary">
                          <Chip.Label>{skill}</Chip.Label>
                          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))}>
                            <X className="h-3 w-3" />
                          </button>
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Languages</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.currentLanguage}
                        onChange={(e) => setFormData((prev) => ({ ...prev, currentLanguage: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLanguage())}
                        placeholder="e.g., English"
                      />
                      <Button type="button" onPress={handleAddLanguage} variant="secondary">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang) => (
                        <Chip key={lang} variant="secondary">
                          <Chip.Label>{lang}</Chip.Label>
                          <button type="button" onClick={() => setFormData((prev) => ({ ...prev, languages: prev.languages.filter((l) => l !== lang) }))}>
                            <X className="h-3 w-3" />
                          </button>
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      value={formData.currentJob}
                      onChange={(e) => setFormData((prev) => ({ ...prev, currentJob: e.target.value }))}
                      placeholder="Current Job Title"
                    />
                    <Input
                      value={formData.currentCompany}
                      onChange={(e) => setFormData((prev) => ({ ...prev, currentCompany: e.target.value }))}
                      placeholder="Company"
                    />
                    <Input
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData((prev) => ({ ...prev, yearsOfExperience: e.target.value }))}
                      placeholder="Years of experience"
                      className="md:col-span-2"
                    />
                    <Button type="button" onPress={handleAddExperience} variant="outline" className="md:col-span-2">Add Experience</Button>
                  </div>

                  {formData.experiences.length > 0 && (
                    <div className="space-y-2">
                      {formData.experiences.map((exp) => (
                        <Card key={exp.id} variant="transparent" className="border">
                          <Card.Content className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{exp.title}</p>
                              <p className="text-xs text-muted">{exp.company} • {exp.years}</p>
                            </div>
                            <Button type="button" variant="ghost" isIconOnly onPress={() => setFormData((prev) => ({ ...prev, experiences: prev.experiences.filter((item) => item.id !== exp.id) }))}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Card.Content>
                        </Card>
                      ))}
                    </div>
                  )}

                  <TextField name="address" value={formData.address} onChange={(value) => handleChange(value, "address")}>
                    <Label>Address</Label>
                    <Input placeholder="Enter your address" />
                  </TextField>

                  <TextField name="bio" value={formData.bio} onChange={(value) => handleChange(value, "bio")}>
                    <Label>Professional Bio *</Label>
                    <TextArea rows={4} placeholder="Tell us about your background..." />
                  </TextField>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <div>{step > 0 ? <Button type="button" variant="ghost" onPress={prevStep}>Back</Button> : null}</div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onPress={handleReset}>Reset</Button>
                  {step < steps.length - 1 ? (
                    <Button type="button" onPress={nextStep}>Next</Button>
                  ) : (
                    <Link href="/dashboard">
                      <Button type="submit"><CheckCircle className="mr-2 h-4 w-4" />Submit Mentor Application</Button>
                    </Link>
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
