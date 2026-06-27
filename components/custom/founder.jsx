"use client";

import { Avatar, Button, Card, Chip, Label } from "@heroui/react";
import { Description, Surface } from "@heroui/react";
import { Modal, TextField, Input } from "@heroui/react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";

export function FounderComponent() {
  const { user, isLoaded } = useUser();
  const selectedOrganizationId = useOrgSelectorStore((s) => s.selectedOrganizationId);
  const [founder, setFounder] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    founder_name: "",
    founder_email: "",
    founder_phone: "",
    founder_gender: "",
    founder_dob: "",
  });

  useEffect(() => {
    async function fetchFounder() {
      if (!isLoaded || !selectedOrganizationId) return;

      setLoading(true);
      try {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("id, org_name, description, clerk_id, founder_name, founder_email, founder_phone, founder_gender, founder_dob")
          .eq("id", selectedOrganizationId)
          .single();

        if (orgData) {
          setOrg(orgData);
          setForm({
            founder_name: orgData.founder_name || "",
            founder_email: orgData.founder_email || "",
            founder_phone: orgData.founder_phone || "",
            founder_gender: orgData.founder_gender || "",
            founder_dob: orgData.founder_dob || "",
          });

          const { data: userData } = await supabase
            .from("users")
            .select("id, clerk_id, name, email, pic")
            .eq("clerk_id", orgData.clerk_id)
            .single();

          if (userData) {
            setFounder(userData);
          }
        }
      } catch (err) {
        console.error("Fetch founder error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFounder();
  }, [isLoaded, selectedOrganizationId]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
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
        .eq("id", selectedOrganizationId);

      if (error) throw error;
      setOrg((prev) => ({ ...prev, ...form }));
    } catch (err) {
      console.error("Update founder error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-default-200" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-default-200 rounded" />
            <div className="h-3 w-24 bg-default-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!founder || !org) {
    return <p className="p-4 text-sm text-default-400">No founder data found.</p>;
  }

  const initials = founder.name
    ? founder.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Founder / CEO</h3>
        <Modal>
          <Button size="sm" variant="ghost"><PenLine className="size-3" /> Edit</Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Icon><PenLine /></Modal.Icon>
                  <Modal.Heading>Edit Founder Details</Modal.Heading>
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

      <Card className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {founder.pic ? <Avatar.Image src={founder.pic} alt={founder.name} /> : null}
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar>
          <div>
            <p className="font-medium">{form.founder_name || founder.name}</p>
            <Description className="text-xs">{org.org_name}</Description>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {form.founder_email && (
            <div>
              <span className="text-xs text-default-400 block">Email</span>
              <span className="font-medium">{form.founder_email}</span>
            </div>
          )}
          {form.founder_phone && (
            <div>
              <span className="text-xs text-default-400 block">Phone</span>
              <span className="font-medium">{form.founder_phone}</span>
            </div>
          )}
          {form.founder_gender && (
            <div>
              <span className="text-xs text-default-400 block">Gender</span>
              <span className="font-medium">{form.founder_gender}</span>
            </div>
          )}
          {form.founder_dob && (
            <div>
              <span className="text-xs text-default-400 block">Date of Birth</span>
              <span className="font-medium">{form.founder_dob}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
