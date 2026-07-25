"use client";

import { Avatar } from "@heroui/react";
import { Chip } from "@heroui/react";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Surface } from "@heroui/react";
import { Label } from "@heroui/react";
import { Description } from "@heroui/react";
import { Typography } from "@heroui/react";
import { Modal, TextField, Input, TextArea } from "@heroui/react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Plus, X, Pencil, PenLine } from "lucide-react";

export function MentorComponent({ viewOnly }) {
  const { user, isLoaded } = useUser();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingExp, setSavingExp] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "", bio: "", email: "", phone: "",
    field: "", expertise: "", institute: "", inst_email: "",
  });

  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    const fetchMentorProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("mentors")
          .select("*, users!clerk_id(id, pic, name, email)")
          .eq("clerk_id", user.id)
          .single();

        if (error) throw error;
        setMentor(data);

        setProfileForm({
          name: data.name || "", bio: data.bio || "", email: data.email || "",
          phone: data.phone || "", field: data.field || "", expertise: data.expertise || "",
          institute: data.institute || "", inst_email: data.inst_email || "",
        });

        setExperiences(
          Array.isArray(data.experiences) && data.experiences.length > 0
            ? data.experiences
            : [{ year: "", title: "", company: "", location: "" }]
        );
      } catch (err) {
        console.error("Error fetching mentor profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorProfile();
  }, [user?.id, isLoaded]);

  const updateProfileField = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("mentors")
        .update({
          name: profileForm.name, bio: profileForm.bio, email: profileForm.email,
          phone: profileForm.phone, field: profileForm.field, expertise: profileForm.expertise,
          institute: profileForm.institute, inst_email: profileForm.inst_email,
        })
        .eq("clerk_id", user.id);

      if (error) throw error;
      setMentor((prev) => ({ ...prev, ...profileForm }));
    } catch (err) {
      console.error("Update profile error:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const addExperience = () => setExperiences((prev) => [...prev, { year: "", title: "", company: "", location: "" }]);
  const removeExperience = (idx) => setExperiences((prev) => prev.filter((_, i) => i !== idx));
  const updateExperience = (idx, field, value) => {
    setExperiences((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const handleSaveExperiences = async () => {
    setSavingExp(true);
    try {
      const filtered = experiences.filter((e) => e.title || e.company);
      const { error } = await supabase
        .from("mentors")
        .update({ experiences: filtered })
        .eq("clerk_id", user.id);

      if (error) throw error;
      setMentor((prev) => ({ ...prev, experiences: filtered }));
    } catch (err) {
      console.error("Update experiences error:", err);
    } finally {
      setSavingExp(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 w-full animate-pulse space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-start border-b pb-6 border-default-100">
          <div className="h-44 w-44 bg-default-200 rounded-2xl" />
          <div className="flex flex-col gap-3 flex-1">
            <div className="h-8 w-48 bg-default-200 rounded" />
            <div className="h-4 w-64 bg-default-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!mentor) return <p className="p-6">Profile not found</p>;

  const userPic = mentor.users?.pic;
  const initials = mentor.name ? mentor.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "?";
  const expList = Array.isArray(mentor.experiences) ? mentor.experiences : [];
  const reviewList = Array.isArray(mentor.reviews) ? mentor.reviews : [];

  return (
    <div className="max-w-6xl mx-auto p-4 w-full flex flex-col gap-8">

      {/* 1. PROFILE HERO SECTION */}
      <div className="flex flex-col md:flex-row gap-6 items-start border-b pb-6 border-default-100">
        <div className="h-36 w-36 md:h-44 md:w-44 bg-muted rounded-2xl flex-shrink-0 flex items-center justify-center border border-default-200 shadow-sm font-bold text-xl text-muted-foreground overflow-hidden">
          {userPic ? <img src={userPic} alt={mentor.name} className="w-full h-full object-cover" /> : initials}
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-0 w-full">
          <div className="flex justify-between items-start w-full gap-4">
            <div className="flex flex-col gap-0.5">
              <Typography.Heading level={1} className="tracking-tight font-bold">{mentor.name}</Typography.Heading>
              <p className="text-base text-muted-foreground font-medium">{mentor.bio}</p>
            </div>
            {!viewOnly && (<Modal>
              <Button size="sm" variant="flat">Edit Profile</Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Icon><PenLine /></Modal.Icon>
                      <Modal.Heading>Edit Profile</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="space-y-2">
                        <TextField>
                          <Label>Full Name</Label>
                          <Input variant="secondary" fullWidth value={profileForm.name} onChange={(e) => updateProfileField("name", e.target.value)} />
                        </TextField>
                        <TextField>
                          <Label>Bio</Label>
                          <TextArea variant="secondary" rows={3} fullWidth value={profileForm.bio} onChange={(e) => updateProfileField("bio", e.target.value)} />
                        </TextField>
                        <div className="grid grid-cols-2 gap-2">
                          <TextField>
                            <Label>Email</Label>
                            <Input variant="secondary" type="email" fullWidth value={profileForm.email} onChange={(e) => updateProfileField("email", e.target.value)} />
                          </TextField>
                          <TextField>
                            <Label>Phone</Label>
                            <Input variant="secondary" type="tel" fullWidth value={profileForm.phone} onChange={(e) => updateProfileField("phone", e.target.value)} />
                          </TextField>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <TextField>
                            <Label>Field / Industry</Label>
                            <Input variant="secondary" fullWidth value={profileForm.field} onChange={(e) => updateProfileField("field", e.target.value)} />
                          </TextField>
                          <TextField>
                            <Label>Expertise</Label>
                            <Input variant="secondary" fullWidth value={profileForm.expertise} onChange={(e) => updateProfileField("expertise", e.target.value)} />
                          </TextField>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <TextField>
                            <Label>Institute / Company</Label>
                            <Input variant="secondary" fullWidth value={profileForm.institute} onChange={(e) => updateProfileField("institute", e.target.value)} />
                          </TextField>
                          <TextField>
                            <Label>Institutional Email</Label>
                            <Input variant="secondary" type="email" fullWidth value={profileForm.inst_email} onChange={(e) => updateProfileField("inst_email", e.target.value)} />
                          </TextField>
                        </div>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="secondary">Cancel</Button>
                      <Button slot="close" onClick={handleSaveProfile} isLoading={savingProfile}>Save Changes</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
            )}
          </div>

          <Label className="text-default-400 font-mono text-sm">{mentor.email}</Label>

          {mentor.expertise && (
            <div className="flex flex-row items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-semibold text-default-500 uppercase tracking-wider mr-1">Expertise:</span>
              <Chip variant="flat" size="sm">{mentor.expertise}</Chip>
            </div>
          )}

          {mentor.institute && (
            <div className="pt-2">
              <Surface variant="secondary" className="p-3 flex flex-row gap-3 items-center rounded-xl border border-default-100 max-w-sm">
                <Avatar size="sm" className="bg-primary/10 text-primary font-bold">
                  <Avatar.Fallback>{mentor.institute?.[0]?.toUpperCase()}</Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col">
                  <Label className="font-semibold text-sm">{mentor.institute}</Label>
                  {mentor.field && <Description className="text-xs">{mentor.field}</Description>}
                </div>
              </Surface>
            </div>
          )}
        </div>
      </div>

      {/* 2. ABOUT & CONTACT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <Typography.Heading level={3} className="font-semibold">About</Typography.Heading>
            {!viewOnly && (<Modal>
              <Button size="sm" variant="ghost">Edit</Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Icon><PenLine /></Modal.Icon>
                      <Modal.Heading>Edit About</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="space-y-2">
                        <TextField>
                          <Label>Bio</Label>
                          <TextArea variant="secondary" rows={4} fullWidth value={profileForm.bio} onChange={(e) => updateProfileField("bio", e.target.value)} />
                        </TextField>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="secondary">Cancel</Button>
                      <Button slot="close" onClick={handleSaveProfile} isLoading={savingProfile}>Save Changes</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
            )}
          </div>
          <p className="text-sm text-default-600 leading-relaxed bg-default-50 p-4 rounded-xl border border-default-100">
            {mentor.bio}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Typography.Heading level={3} className="font-semibold">Contact Details</Typography.Heading>
          <div className="bg-default-50 p-4 rounded-xl border border-default-100 flex flex-col gap-2.5 text-sm">
            {mentor.email && (
              <div>
                <span className="text-xs text-default-400 block">Email Address</span>
                <span className="font-medium text-default-700">{mentor.email}</span>
              </div>
            )}
            {mentor.phone && (
              <div>
                <span className="text-xs text-default-400 block">Phone</span>
                <span className="font-medium text-default-700">{mentor.phone}</span>
              </div>
            )}
            {mentor.inst_email && (
              <div>
                <span className="text-xs text-default-400 block">Institutional Email</span>
                <span className="font-medium text-default-700">{mentor.inst_email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. WORK EXPERIENCE SECTION */}
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex justify-between items-center">
          <Typography.Heading level={3} className="font-semibold">Work Experience</Typography.Heading>
          {!viewOnly && (<Modal>
            <Button size="sm" variant="ghost">Edit</Button>
            <Modal.Backdrop>
              <Modal.Container size="cover">
                <Modal.Dialog>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Icon><PenLine /></Modal.Icon>
                    <Modal.Heading>Edit Work Experience</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                      {experiences.map((exp, idx) => (
                        <div key={idx} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-default-500">Experience {idx + 1}</span>
                            {experiences.length > 1 && (
                              <Button isIconOnly size="sm" variant="danger-soft" onClick={() => removeExperience(idx)}>
                                <X className="size-3" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <TextField>
                              <Label>Year</Label>
                              <Input variant="secondary" placeholder="e.g., 2024 - Present" fullWidth value={exp.year} onChange={(e) => updateExperience(idx, "year", e.target.value)} />
                            </TextField>
                            <TextField>
                              <Label>Title</Label>
                              <Input variant="secondary" placeholder="e.g., Software Engineer" fullWidth value={exp.title} onChange={(e) => updateExperience(idx, "title", e.target.value)} />
                            </TextField>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <TextField>
                              <Label>Company</Label>
                              <Input variant="secondary" placeholder="e.g., Google" fullWidth value={exp.company} onChange={(e) => updateExperience(idx, "company", e.target.value)} />
                            </TextField>
                            <TextField>
                              <Label>Location</Label>
                              <Input variant="secondary" placeholder="e.g., Remote" fullWidth value={exp.location} onChange={(e) => updateExperience(idx, "location", e.target.value)} />
                            </TextField>
                          </div>
                        </div>
                      ))}
                      <Button size="sm" variant="tertiary" onClick={addExperience}>
                        <Plus className="size-3" /> Add Experience
                      </Button>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button slot="close" variant="secondary">Cancel</Button>
                    <Button slot="close" onClick={handleSaveExperiences} isLoading={savingExp}>Save Changes</Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
          )}
        </div>
        {expList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expList.map((exp, index) => (
              <div key={index} className="flex flex-col p-4 rounded-xl border border-default-200 bg-background shadow-sm hover:shadow-md transition-shadow">
                {exp.year && <span className="text-xs font-semibold text-primary tracking-wide mb-1">{exp.year}</span>}
                <Label className="font-bold text-base text-default-800">{exp.title}</Label>
                {exp.company && <Description className="text-sm font-medium text-default-600 mt-0.5">{exp.company}</Description>}
                {exp.location && <p className="text-xs text-default-400 mt-3">{exp.location}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-default-400">No work experience added yet.</p>
        )}
      </div>

      {/* 4. REVIEWS SECTION */}
      {reviewList.length > 0 && (
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex justify-between items-center">
            <Typography.Heading level={3} className="font-semibold">Student Reviews</Typography.Heading>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewList.map((review, index) => (
              <Card key={index} className="p-4 flex flex-col gap-3 border border-default-100 bg-default-50/50 shadow-none">
                <div className="flex flex-row gap-3 items-center">
                  <Avatar size="sm" className="bg-secondary/20 text-secondary font-medium">
                    <Avatar.Fallback>{review.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Label className="font-semibold text-sm">{review.name}</Label>
                    <Description className="text-xs">{review.role}</Description>
                  </div>
                  {review.date && <span className="ml-auto text-[10px] text-default-400 font-medium">{review.date}</span>}
                </div>
                <p className="text-xs text-default-600 italic leading-relaxed">"{review.text}"</p>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

