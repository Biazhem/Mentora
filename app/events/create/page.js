"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

const EVENT_TYPES = [
  "Workshop",
  "Webinar",
  "Conference",
  "Networking",
  "Bootcamp",
  "Seminar",
  "Hackathon",
  "Meetup",
];

export default function EventCreatePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    location: "",
  });

  useEffect(() => {
    async function checkOrganization() {
      if (!isLoaded || !user) return;

      try {
        const userEmail = user.primaryEmailAddress?.emailAddress || "";
        if (!userEmail) {
          setError("No email found from Clerk");
          setLoading(false);
          return;
        }

        // Get user ID
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", userEmail);

        if (userError || !userData || userData.length === 0) {
          setError("User not found");
          setLoading(false);
          return;
        }

        const userId = userData[0].id;

        // Check if user has an organization
        const { data: orgData, error: orgError } = await supabase
          .from("organisation")
          .select("id")
          .eq("owner_id", userId);

        if (orgError || !orgData || orgData.length === 0) {
          setError("You need to create an organization first to create events");
          setLoading(false);
          return;
        }

        setOrgId(orgData[0].id);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load organization");
        setLoading(false);
      }
    }

    checkOrganization();
  }, [isLoaded, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate form
      if (!form.title.trim()) throw new Error("Event title is required");
      if (!form.description.trim())
        throw new Error("Event description is required");
      if (!form.type) throw new Error("Event type is required");
      if (!form.start_date) throw new Error("Start date is required");
      if (!form.start_time) throw new Error("Start time is required");
      if (!form.end_date) throw new Error("End date is required");
      if (!form.end_time) throw new Error("End time is required");
      if (!form.location.trim()) throw new Error("Location is required");
      if (!orgId) throw new Error("Organization not found");

      // Combine date and time
      const startDateTime = new Date(
        `${form.start_date}T${form.start_time}`
      ).toISOString();
      const endDateTime = new Date(
        `${form.end_date}T${form.end_time}`
      ).toISOString();

      if (new Date(startDateTime) >= new Date(endDateTime)) {
        throw new Error("End date and time must be after start date and time");
      }

      // Create event
      const { error: eventError } = await supabase.from("events").insert({
        org_id: orgId,
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        start_date: startDateTime,
        end_date: endDateTime,
        location: form.location.trim(),
      });

      if (eventError) throw eventError;

      router.push("/events");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
            <CardTitle className="text-2xl">Create a New Event</CardTitle>
            <CardDescription className="text-blue-100">
              Organize and promote your event to connect with participants
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Event Title */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-medium text-slate-900"
                >
                  Event Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Summer Coding Bootcamp"
                  value={form.title}
                  onChange={handleInputChange}
                  className="border-slate-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-slate-900"
                >
                  Event Description *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the event, its goals, agenda, and what participants will learn..."
                  value={form.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="border-slate-200 resize-none"
                />
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label
                  htmlFor="type"
                  className="text-sm font-medium text-slate-900"
                >
                  Event Type *
                </Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    handleSelectChange("type", value)
                  }
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-slate-900"
                >
                  Location *
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Online or City, Venue Name"
                  value={form.location}
                  onChange={handleInputChange}
                  className="border-slate-200"
                />
              </div>

              {/* Date and Time Section */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-medium text-slate-900">
                  Event Date & Time
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="start_date"
                      className="text-sm font-medium text-slate-900"
                    >
                      Start Date *
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={form.start_date}
                      onChange={handleInputChange}
                      className="border-slate-200"
                    />
                  </div>

                  {/* Start Time */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="start_time"
                      className="text-sm font-medium text-slate-900"
                    >
                      Start Time *
                    </Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={form.start_time}
                      onChange={handleInputChange}
                      className="border-slate-200"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="end_date"
                      className="text-sm font-medium text-slate-900"
                    >
                      End Date *
                    </Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={form.end_date}
                      onChange={handleInputChange}
                      className="border-slate-200"
                    />
                  </div>

                  {/* End Time */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="end_time"
                      className="text-sm font-medium text-slate-900"
                    >
                      End Time *
                    </Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={form.end_time}
                      onChange={handleInputChange}
                      className="border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
