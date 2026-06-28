"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";
import {
  Button,
  TextField,
  Label,
  Input,
  TextArea,
  Select,
  ListBox,
  Checkbox,
  Alert,
} from "@heroui/react";

export default function CreateJobPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const selectedOrganizationId = useOrgSelectorStore(
    (s) => s.selectedOrganizationId,
  );
  const members = useOrgSelectorStore((s) => s.members);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    workplace_type: "",
    job_type: "",
    experience_level: "",
    industry: "",
    job_function: "",
    country: "",
    city: "",
    address: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    salary_period: "yearly",
    is_easy_apply: false,
    external_apply_url: "",
    expires_at: "",
  });

  useEffect(() => {
    if (!user || !selectedOrganizationId) return;

    async function checkAdmin() {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) return;

      const { data: memberData } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", selectedOrganizationId)
        .eq("user_id", userData.id)
        .maybeSingle();

      setIsAdmin(memberData?.role === "admin");
    }

    checkAdmin();
  }, [user, selectedOrganizationId]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (status) => {
    if (
      !user ||
      !selectedOrganizationId ||
      !formData.title ||
      !formData.description
    )
      return;
    if (!isAdmin) return;

    setLoading(true);
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) return;

      const { error } = await supabase.from("jobs").insert({
        org_id: selectedOrganizationId,
        user_id: userData.id,
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        workplace_type: formData.workplace_type,
        job_type: formData.job_type,
        experience_level: formData.experience_level,
        industry: formData.industry,
        job_function: formData.job_function,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        salary_currency: formData.salary_currency,
        salary_period: formData.salary_period,
        is_easy_apply: formData.is_easy_apply,
        external_apply_url: formData.external_apply_url,
        expires_at: formData.expires_at || null,
        status,
      });

      if (error) throw error;

      router.push("/jobs");
    } catch (err) {
      console.error("Job create error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-3 max-w-3xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Create Job</h1>
        <p className="text-sm text-muted">
          Post a job opportunity for your organization
        </p>
      </div>

      <div className="flex w-full flex-col gap-4">
        {!selectedOrganizationId ? (
          <Alert color="warning">
            Select an organization from the header to create a job.
          </Alert>
        ) : !isAdmin ? (
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Are You Admin of Organization!</Alert.Title>
              <Alert.Description>
                You must be a Admin of Organization then you will able to Create a Job
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : (
          <Alert color="success">
            Creating job for:{" "}
            {members.find((m) => m.role === "Founder")?.name || "Organization"}
          </Alert>
        )}

        <TextField>
          <Label>Job Title</Label>
          <Input
            placeholder="e.g., Senior Frontend Developer"
            fullWidth
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label>Description</Label>
          <TextArea
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            rows={6}
            fullWidth
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label>Requirements</Label>
          <TextArea
            placeholder="List the required skills, qualifications, and experience..."
            rows={4}
            fullWidth
            value={formData.requirements}
            onChange={(e) => updateField("requirements", e.target.value)}
          />
        </TextField>

        <TextField>
          <Label>Benefits</Label>
          <TextArea
            placeholder="List benefits like health insurance, remote work, PTO..."
            rows={3}
            fullWidth
            value={formData.benefits}
            onChange={(e) => updateField("benefits", e.target.value)}
          />
        </TextField>

        <div className="grid grid-cols-2 gap-3">
          <TextField>
            <Label>Workplace Type</Label>
            <Select
              placeholder="Select type"
              value={formData.workplace_type}
              onChange={(val) => updateField("workplace_type", val)}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="onsite" textValue="Onsite">
                    Onsite
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="hybrid" textValue="Hybrid">
                    Hybrid
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="remote" textValue="Remote">
                    Remote
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </TextField>

          <TextField>
            <Label>Job Type</Label>
            <Select
              placeholder="Select type"
              value={formData.job_type}
              onChange={(val) => updateField("job_type", val)}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="fulltime" textValue="Full-time">
                    Full-time
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="parttime" textValue="Part-time">
                    Part-time
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="contract" textValue="Contract">
                    Contract
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="internship" textValue="Internship">
                    Internship
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </TextField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField>
            <Label>Experience Level</Label>
            <Select
              placeholder="Select level"
              value={formData.experience_level}
              onChange={(val) => updateField("experience_level", val)}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="Entry level" textValue="Entry level">
                    Entry level
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Associate" textValue="Associate">
                    Associate
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Mid-Senior" textValue="Mid-Senior">
                    Mid-Senior
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Director" textValue="Director">
                    Director
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </TextField>

          <TextField>
            <Label>Industry</Label>
            <Select
              placeholder="Select industry"
              value={formData.industry}
              onChange={(val) => updateField("industry", val)}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item
                    id="Software Development"
                    textValue="Software Development"
                  >
                    Software Development
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Finance" textValue="Finance">
                    Finance
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Marketing" textValue="Marketing">
                    Marketing
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Design" textValue="Design">
                    Design
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Healthcare" textValue="Healthcare">
                    Healthcare
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Education" textValue="Education">
                    Education
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </TextField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField>
            <Label>Job Function</Label>
            <Select
              placeholder="Select function"
              value={formData.job_function}
              onChange={(val) => updateField("job_function", val)}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="Engineering" textValue="Engineering">
                    Engineering
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Marketing" textValue="Marketing">
                    Marketing
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Sales" textValue="Sales">
                    Sales
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item
                    id="Human Resources"
                    textValue="Human Resources"
                  >
                    Human Resources
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Finance" textValue="Finance">
                    Finance
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="Operations" textValue="Operations">
                    Operations
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </TextField>

          <TextField>
            <Label>Salary Currency</Label>
            <Select
              placeholder="Select currency"
              value={formData.salary_currency}
              onChange={(val) => updateField("salary_currency", val)}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="USD" textValue="USD">
                    USD
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="EUR" textValue="EUR">
                    EUR
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="GBP" textValue="GBP">
                    GBP
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="PKR" textValue="PKR">
                    PKR
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="INR" textValue="INR">
                    INR
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </TextField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField>
            <Label>Country</Label>
            <Input
              placeholder="e.g., Pakistan"
              fullWidth
              value={formData.country}
              onChange={(e) => updateField("country", e.target.value)}
            />
          </TextField>
          <TextField>
            <Label>City</Label>
            <Input
              placeholder="e.g., Islamabad"
              fullWidth
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
          </TextField>
        </div>

        <TextField>
          <Label>Address</Label>
          <Input
            placeholder="Street address (optional)"
            fullWidth
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </TextField>

        <div className="grid grid-cols-3 gap-3">
          <TextField>
            <Label>Min Salary</Label>
            <Input
              type="number"
              min={0}
              placeholder="e.g., 50000"
              fullWidth
              value={formData.salary_min}
              onChange={(e) => updateField("salary_min", e.target.value)}
            />
          </TextField>
          <TextField>
            <Label>Max Salary</Label>
            <Input
              type="number"
              
              placeholder="e.g., 80000"
              fullWidth
              value={formData.salary_max}
              onChange={(e) => updateField("salary_max", e.target.value)}
            />
          </TextField>
          <TextField>
            <Label>Period</Label>
            <Select
              placeholder="Select period"
              value={formData.salary_period}
              onChange={(val) => updateField("salary_period", val)}
            >
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="yearly" textValue="Yearly">
                    Yearly
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="monthly" textValue="Monthly">
                    Monthly
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                  <ListBox.Item id="hourly" textValue="Hourly">
                    Hourly
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </TextField>
        </div>

        <TextField>
          <Label>External Apply URL</Label>
          <Input
            placeholder="https://..."
            fullWidth
            value={formData.external_apply_url}
            onChange={(e) => updateField("external_apply_url", e.target.value)}
          />
        </TextField>

        <Checkbox
          isSelected={formData.is_easy_apply}
          onChange={(val) => updateField("is_easy_apply", val)}
        >
          Enable Easy Apply
        </Checkbox>

        <TextField>
          <Label>Expires At (Optional)</Label>
          <Input
            type="date"
            fullWidth
            value={formData.expires_at}
            onChange={(e) => updateField("expires_at", e.target.value)}
          />
        </TextField>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Button
          variant="secondary"
          onClick={() => handleSubmit("draft")}
          isLoading={loading}
          isDisabled={!isAdmin || !selectedOrganizationId}
        >
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit("active")}
          isLoading={loading}
          isDisabled={!isAdmin || !selectedOrganizationId}
        >
          Publish Job
        </Button>
      </div>
    </div>
  );
}
