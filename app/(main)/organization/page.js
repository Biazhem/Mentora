"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Chip, Card } from "@heroui/react";
import { Select, ListBox } from "@heroui/react";
import { InputGroup } from "@heroui/react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrganizations() {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, org_name, description, company_type, country, city, org_logo_url")
        .order("created_at", { ascending: false });

      if (data) {
        setOrganizations(data);
      }
      setLoading(false);
    }

    fetchOrganizations();
  }, []);

  const industryOptions = [
    "all",
    ...Array.from(new Set(organizations.map((o) => o.company_type).filter(Boolean))).sort(),
  ];

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.org_name.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industry === "all" || org.company_type === industry;
    const matchesLocation =
      !locationFilter ||
      (org.city || "").toLowerCase().includes(locationFilter.toLowerCase()) ||
      (org.country || "").toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesIndustry && matchesLocation;
  });

  return (
    <div className="py-12">
      <div className="mb-4 px-4">
        <h1 className="text-2xl font-semibold text-left">
          Explore Organizations
        </h1>
        <p className="text-sm text-muted">
          Get deep info about organizations from the whole world
        </p>
      </div>

      <div className="px-4 mb-8 flex justify-between gap-3 flex-wrap">
        <InputGroup>
          <InputGroup.Prefix>
            <Search className="size-4" />
          </InputGroup.Prefix>
          <InputGroup.Input
            placeholder="Search organization"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-fit"
          />
        </InputGroup>
        <div className="flex gap-2 flex-wrap">
          <InputGroup>
            <InputGroup.Prefix>
              <Search className="size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-fit"
            />
          </InputGroup>
          <Select
            selectedKey={industry}
            onSelectionChange={(key) => setIndustry(key || "all")}
            className="min-w-[160px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {industryOptions.map((opt) => (
                  <ListBox.Item key={opt} id={opt} textValue={opt === "all" ? "All Industries" : opt}>
                    {opt === "all" ? "All Industries" : opt}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="mx-auto px-4 grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="w-full items-stretch md:flex-row animate-pulse">
              <div className="h-[120px] w-[120px] bg-accent-soft-hover rounded-2xl shrink-0" />
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="h-5 w-40 bg-accent-soft-hover rounded" />
                <div className="h-3 w-full bg-accent-soft-hover rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mx-auto px-4 grid md:grid-cols-2 gap-6">
          {filteredOrganizations.map((org) => (
            <Link key={org.id} href={`/organization/${org.id}`}>
              <Card className="w-full items-stretch md:flex-row cursor-pointer">
                <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
                  {org.org_logo_url ? (
                    <img
                      alt={org.org_name}
                      className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                      src={org.org_logo_url}
                    />
                  ) : (
                    <div className="absolute inset-0 h-full w-full bg-accent-soft-hover flex items-center justify-center">
                      <span className="text-lg font-semibold text-muted">{org.org_name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <Card.Header className="gap-1">
                    <Card.Title className="pr-8">{org.org_name}</Card.Title>
                    <Card.Description className="line-clamp-3">{org.description}</Card.Description>
                  </Card.Header>
                  <Card.Footer className="mt-auto flex gap-1">
                    <Chip>{org.city || "Remote"}</Chip>
                    <Chip>{org.company_type}</Chip>
                  </Card.Footer>
                </div>
              </Card>
            </Link>
          ))}
          {filteredOrganizations.length === 0 && (
            <p className="col-span-2 text-center text-muted py-12">No organizations found.</p>
          )}
        </div>
      )}
    </div>
  );
}
