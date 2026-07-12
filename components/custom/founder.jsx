"use client";

import { Avatar, Button, Card, Chip, Description, Label } from "@heroui/react";
import { Modal, TextField, Input } from "@heroui/react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";
import Link from "next/link";

export function FounderComponent() {
  const { user, isLoaded } = useUser();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  const [form, setForm] = useState({
    founder_name: "",
    founder_email: "",
    founder_phone: "",
    founder_gender: "",
    founder_dob: "",
  });

  useEffect(() => {
    async function fetchOrganizations() {
      if (!isLoaded || !user) return;

      setLoading(true);
      try {
        const { data } = await supabase
          .from("organizations")
          .select("id, org_name, description, company_type, city, country, founder_name, founder_email, founder_phone, founder_gender, founder_dob, founder_photo_url, clerk_id")
          .eq("clerk_id", user.id)
          .order("created_at", { ascending: false });

        if (data) {
          setOrganizations(data);
        }
      } catch (err) {
        console.error("Fetch organizations error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, [isLoaded, user]);

  const openEdit = (org) => {
    setEditingOrg(org);
    setForm({
      founder_name: org.founder_name || "",
      founder_email: org.founder_email || "",
      founder_phone: org.founder_phone || "",
      founder_gender: org.founder_gender || "",
      founder_dob: org.founder_dob || "",
    });
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingOrg) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          founder_name: form.founder_name,
          founder_email: form.founder_email,
          founder_phone: form.founder_phone,
          founder_gender: form.founder_gender,
          founder_dob: form.founder_dob,
        })
        .eq("id", editingOrg.id);

      if (error) throw error;

      setOrganizations((prev) =>
        prev.map((org) => (org.id === editingOrg.id ? { ...org, ...form } : org))
      );
      setEditingOrg(null);
    } catch (err) {
      console.error("Update founder error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-default-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-default-200 rounded" />
              <div className="h-3 w-24 bg-default-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (organizations.length === 0) {
    return <p className="p-4 text-sm text-muted">You are not a founder of any organization.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold">Organizations Founded ({organizations.length})</h3>

      {organizations.map((org) => (
        <Card key={org.id} className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Link href={`/organization/${org.id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div>
                <p className="font-medium">{org.org_name}</p>
                <Description className="text-xs">
                  {[org.city, org.country].filter(Boolean).join(", ") || org.description?.slice(0, 40)}
                </Description>
              </div>
            </Link>
            <div className="flex gap-1">
              <Modal>
                <Button size="sm" variant="tertiary" isIconOnly>
                  <PenLine className="size-3" />
                </Button>
                <Modal.Backdrop>
                  <Modal.Container>
                    <Modal.Dialog>
                      <Modal.CloseTrigger />
                      <Modal.Header>
                        <Modal.Icon><PenLine /></Modal.Icon>
                        <Modal.Heading>Edit Founder - {org.org_name}</Modal.Heading>
                      </Modal.Header>
                      <Modal.Body>
                        <div className="space-y-2">
                          <TextField>
                            <Label>Founder Name</Label>
                            <Input variant="secondary" fullWidth value={form.founder_name} onChange={(e) => updateField("founder_name", e.target.value)} />
                          </TextField>
                          <div className="grid grid-cols-2 gap-2">
                            <TextField>
                              <Label>Email</Label>
                              <Input variant="secondary" type="email" fullWidth value={form.founder_email} onChange={(e) => updateField("founder_email", e.target.value)} />
                            </TextField>
                            <TextField>
                              <Label>Phone</Label>
                              <Input variant="secondary" type="tel" fullWidth value={form.founder_phone} onChange={(e) => updateField("founder_phone", e.target.value)} />
                            </TextField>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <TextField>
                              <Label>Gender</Label>
                              <Input variant="secondary" fullWidth value={form.founder_gender} onChange={(e) => updateField("founder_gender", e.target.value)} />
                            </TextField>
                            <TextField>
                              <Label>Date of Birth</Label>
                              <Input variant="secondary" type="date" fullWidth value={form.founder_dob} onChange={(e) => updateField("founder_dob", e.target.value)} />
                            </TextField>
                          </div>
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
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {org.founder_name && (
              <div>
                <span className="text-xs text-muted block">Founder</span>
                <span className="font-medium">{org.founder_name}</span>
              </div>
            )}
            {org.founder_email && (
              <div>
                <span className="text-xs text-muted block">Email</span>
                <span className="font-medium">{org.founder_email}</span>
              </div>
            )}
            {org.founder_phone && (
              <div>
                <span className="text-xs text-muted block">Phone</span>
                <span className="font-medium">{org.founder_phone}</span>
              </div>
            )}
            {org.company_type && (
              <div>
                <span className="text-xs text-muted block">Type</span>
                <span className="font-medium">{org.company_type}</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
