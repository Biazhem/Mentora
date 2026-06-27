"use client";

import { Avatar, Chip, Button, Card, Label, Description, Typography } from "@heroui/react";
import { Modal, TextField, Input, TextArea } from "@heroui/react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";

export function StudentComponent() {
  const { user, isLoaded } = useUser();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", university: "",
    semester: "", expertise: "", skills: "",
  });

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("students")
          .select("*, users!clerk_id(id, pic, name, email)")
          .eq("clerk_id", user.id)
          .single();

        if (error) throw error;
        setStudent(data);

        setForm({
          name: data.name || "", email: data.email || "", phone: data.phone || "",
          university: data.university || "", semester: data.semester || "",
          expertise: data.expertise || "", skills: data.skills || "",
        });
      } catch (err) {
        console.error("Error fetching student profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [user?.id, isLoaded]);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("students")
        .update({
          name: form.name, email: form.email, phone: form.phone,
          university: form.university, semester: form.semester,
          expertise: form.expertise, skills: form.skills,
        })
        .eq("clerk_id", user.id);

      if (error) throw error;
      setStudent((prev) => ({ ...prev, ...form }));
    } catch (err) {
      console.error("Update student error:", err);
    } finally {
      setSaving(false);
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

  if (!student) return <p className="p-6">Student profile not found</p>;

  const userPic = student.users?.pic;
  const initials = student.name ? student.name.split(" ").map((n) => n[0]).join("").toUpperCase() : "?";
  const skillsList = student.skills ? student.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-6xl mx-auto p-4 w-full flex flex-col gap-8">

      {/* PROFILE HERO */}
      <div className="flex flex-col md:flex-row gap-6 items-start border-b pb-6 border-default-100">
        <div className="h-36 w-36 md:h-44 md:w-44 bg-muted rounded-2xl flex-shrink-0 flex items-center justify-center border border-default-200 shadow-sm font-bold text-xl text-muted-foreground overflow-hidden">
          {userPic ? <img src={userPic} alt={student.name} className="w-full h-full object-cover" /> : initials}
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-0 w-full">
          <div className="flex justify-between items-start w-full gap-4">
            <div className="flex flex-col gap-0.5">
              <Typography.Heading level={1} className="tracking-tight font-bold">{student.name}</Typography.Heading>
              <p className="text-base text-muted-foreground font-medium">Student</p>
            </div>
            <Modal>
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
                          <Input variant="secondary" fullWidth value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                        </TextField>
                        <div className="grid grid-cols-2 gap-2">
                          <TextField>
                            <Label>Email</Label>
                            <Input variant="secondary" type="email" fullWidth value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                          </TextField>
                          <TextField>
                            <Label>Phone</Label>
                            <Input variant="secondary" type="tel" fullWidth value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
                          </TextField>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <TextField>
                            <Label>University</Label>
                            <Input variant="secondary" fullWidth value={form.university} onChange={(e) => updateField("university", e.target.value)} />
                          </TextField>
                          <TextField>
                            <Label>Semester</Label>
                            <Input variant="secondary" fullWidth value={form.semester} onChange={(e) => updateField("semester", e.target.value)} />
                          </TextField>
                        </div>
                        <TextField>
                          <Label>Expertise</Label>
                          <Input variant="secondary" fullWidth value={form.expertise} onChange={(e) => updateField("expertise", e.target.value)} />
                        </TextField>
                        <TextField>
                          <Label>Skills (comma separated)</Label>
                          <TextArea variant="secondary" rows={2} fullWidth value={form.skills} onChange={(e) => updateField("skills", e.target.value)} />
                        </TextField>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="secondary">Cancel</Button>
                      <Button slot="close" onClick={handleSave} isLoading={saving}>Save Changes</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </div>

          <Label className="text-default-400 font-mono text-sm">{student.email}</Label>

          {student.university && (
            <div className="pt-2">
              <div className="p-3 flex flex-row gap-3 items-center rounded-xl border border-default-100 bg-default-50 max-w-sm">
                <Avatar size="sm" className="bg-primary/10 text-primary font-bold">
                  <Avatar.Fallback>{student.university?.[0]?.toUpperCase()}</Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col">
                  <Label className="font-semibold text-sm">{student.university}</Label>
                  {student.semester && <Description className="text-xs">Semester {student.semester}</Description>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EXPERTISE & SKILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <Typography.Heading level={3} className="font-semibold">Expertise</Typography.Heading>
            <Modal>
              <Button size="sm" variant="ghost">Edit</Button>
              <Modal.Backdrop>
                <Modal.Container>
                  <Modal.Dialog>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Icon><PenLine /></Modal.Icon>
                      <Modal.Heading>Edit Expertise</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <div className="space-y-2">
                        <TextField>
                          <Label>Expertise</Label>
                          <Input variant="secondary" fullWidth value={form.expertise} onChange={(e) => updateField("expertise", e.target.value)} />
                        </TextField>
                        <TextField>
                          <Label>Skills (comma separated)</Label>
                          <TextArea variant="secondary" rows={3} fullWidth value={form.skills} onChange={(e) => updateField("skills", e.target.value)} />
                        </TextField>
                      </div>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button slot="close" variant="secondary">Cancel</Button>
                      <Button slot="close" onClick={handleSave} isLoading={saving}>Save Changes</Button>
                    </Modal.Footer>
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          </div>
          {student.expertise && (
            <p className="text-sm text-default-600 leading-relaxed bg-default-50 p-4 rounded-xl border border-default-100">
              {student.expertise}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Typography.Heading level={3} className="font-semibold">Contact</Typography.Heading>
          <div className="bg-default-50 p-4 rounded-xl border border-default-100 flex flex-col gap-2.5 text-sm">
            {student.email && (
              <div>
                <span className="text-xs text-default-400 block">Email</span>
                <span className="font-medium text-default-700">{student.email}</span>
              </div>
            )}
            {student.phone && (
              <div>
                <span className="text-xs text-default-400 block">Phone</span>
                <span className="font-medium text-default-700">{student.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SKILLS */}
      {skillsList.length > 0 && (
        <div className="flex flex-col gap-4 pt-2">
          <Typography.Heading level={3} className="font-semibold">Skills</Typography.Heading>
          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill, idx) => (
              <Chip key={idx} variant="secondary">{skill}</Chip>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
