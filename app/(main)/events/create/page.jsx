"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { Button, TextField, Label, Input, TextArea, Description } from "@heroui/react";
import { Plus, X } from "lucide-react";

export default function CreateEventPage() {
  const { user } = useUser();
  const router = useRouter();
  const selectedOrganizationId = useOrgSelectorStore((s) => s.selectedOrganizationId);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    headline: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    type: "",
  });
  const [guests, setGuests] = useState([{ name: "" }]);
  const [links, setLinks] = useState([{ url: "" }]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addGuest = () => setGuests((prev) => [...prev, { name: "" }]);
  const removeGuest = (idx) => setGuests((prev) => prev.filter((_, i) => i !== idx));
  const updateGuest = (idx, value) => {
    setGuests((prev) => prev.map((g, i) => (i === idx ? { name: value } : g)));
  };

  const addLink = () => setLinks((prev) => [...prev, { url: "" }]);
  const removeLink = (idx) => setLinks((prev) => prev.filter((_, i) => i !== idx));
  const updateLink = (idx, value) => {
    setLinks((prev) => prev.map((l, i) => (i === idx ? { url: value } : l)));
  };

  const handleSubmit = async () => {
    if (!user || !selectedOrganizationId) return;

    setLoading(true);
    try {
      const filteredGuests = guests.filter((g) => g.name.trim());
      const filteredLinks = links.filter((l) => l.url.trim());

      const { error } = await supabase.from("events").insert({
        org_id: selectedOrganizationId,
        title: formData.title,
        headline: formData.headline,
        description: formData.description,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        location: formData.location,
        type: formData.type,
        guest: filteredGuests,
        links: filteredLinks,
      });

      if (error) throw error;

      router.push("/events");
    } catch (err) {
      console.error("Event create error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-3 max-w-3xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Create Event</h1>
        <p className="text-sm text-muted">
          Learn, connect, and grow with Mentora events
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <TextField>
          <Label>Event Title</Label>
          <Input
            placeholder="e.g., Tech Meetup 2026"
            fullWidth
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label>Headline</Label>
          <TextArea
            placeholder="Short tagline for the event"
            rows={2}
            fullWidth
            maxLength={100}
            value={formData.headline}
            onChange={(e) => updateField("headline", e.target.value)}
          />
          <Description className="text-right text-xs">{formData.headline.length}/100</Description>
        </TextField>

        <TextField>
          <Label>Description</Label>
          <TextArea
            placeholder="Describe your event, what attendees will learn, agenda, etc."
            rows={6}
            fullWidth
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </TextField>

        <div className="grid grid-cols-2 gap-3">
          <TextField>
            <Label>Start Date</Label>
            <Input
              type="date"
              fullWidth
              value={formData.start_date}
              onChange={(e) => updateField("start_date", e.target.value)}
            />
          </TextField>
          <TextField>
            <Label>End Date</Label>
            <Input
              type="date"
              fullWidth
              value={formData.end_date}
              onChange={(e) => updateField("end_date", e.target.value)}
            />
          </TextField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField>
            <Label>Location</Label>
            <Input
              placeholder="e.g., Online / Islamabad"
              fullWidth
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </TextField>
          <TextField>
            <Label>Event Type</Label>
            <Input
              placeholder="e.g., Workshop, Meetup, Webinar"
              fullWidth
              value={formData.type}
              onChange={(e) => updateField("type", e.target.value)}
            />
          </TextField>
        </div>

        <div className="border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Guests</p>
            <Button size="sm" variant="tertiary" onClick={addGuest}>
              <Plus className="size-3" /> Add
            </Button>
          </div>
          {guests.map((guest, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <TextField className="flex-1">
                <Input
                  placeholder="Guest name"
                  fullWidth
                  value={guest.name}
                  onChange={(e) => updateGuest(idx, e.target.value)}
                />
              </TextField>
              {guests.length > 1 && (
                <Button isIconOnly size="sm" variant="danger-soft" onClick={() => removeGuest(idx)}>
                  <X className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Links</p>
            <Button size="sm" variant="tertiary" onClick={addLink}>
              <Plus className="size-3" /> Add
            </Button>
          </div>
          {links.map((link, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <TextField className="flex-1">
                <Input
                  placeholder="https://..."
                  fullWidth
                  value={link.url}
                  onChange={(e) => updateLink(idx, e.target.value)}
                />
              </TextField>
              {links.length > 1 && (
                <Button isIconOnly size="sm" variant="danger-soft" onClick={() => removeLink(idx)}>
                  <X className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Button onClick={handleSubmit} isLoading={loading}>
          Publish Event
        </Button>
      </div>
    </div>
  );
}
