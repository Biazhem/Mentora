"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip, Input, Card } from "@heroui/react";
import { Select, ListBox } from "@heroui/react";
import { data } from "@/config/data";
import { Button } from "@heroui/react";
import { ButtonGroup } from "@heroui/react";
import { Filter } from "lucide-react";
import { Trash } from "lucide-react";

export default function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");

  // Transform mock data to match component structure
  const organizations = data.organizations.map((org, idx) => ({
    id: idx + 1,
    slug: org.name.toLowerCase().replace(/\s+/g, "-"),
    name: org.name,
    pic: org.logo,
    category: org.category,
    location: "Remote",
    description: org.description,
  }));

  const filteredOrganizations = organizations.filter((org) => {
    return (
      org.name.toLowerCase().includes(search.toLowerCase()) &&
      (industry === "all" || org.category === industry)
    );
  });

  return (
    <div className="py-12">
      <h1 className="text-2xl font-semibold text-center mb-8">
        Partner Organizations
      </h1>

      <div className="px-4 mb-8 flex justify-between">
        <Input
          placeholder="Search organization"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-fit"
        />
        <div className="flex gap-2">
          <ButtonGroup>
          </ButtonGroup>
            <Button variant="secondary"><Filter />Filter</Button>
            <Button isIconOnly variant="danger-soft"><Trash /></Button>
          <Select onValueChange={setIndustry} defaultValue="all" className="min-w-[140px]">
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator/>
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item value="all">All Categories</ListBox.Item>
                <ListBox.Item value="Information Technology">
                  Information Technology
                </ListBox.Item>
                <ListBox.Item value="Artificial Intelligence">
                  Artificial Intelligence
                </ListBox.Item>
                <ListBox.Item value="Software">Software</ListBox.Item>
                <ListBox.Item value="SaaS">SaaS</ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      <div className="mx-auto px-4 grid md:grid-cols-2 gap-6">
        {filteredOrganizations.map((org, idx) => (
          <Link key={org.name} href={`/organizations/${idx + 1}`}>
            <Card className="w-full items-stretch md:flex-row cursor-pointer">
              <div className="relative h-[140px] w-full shrink-0 overflow-hidden rounded-2xl sm:h-[120px] sm:w-[120px]">
                <img
                  alt="alts"
                  className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover select-none"
                  src={org.pic}
                />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <Card.Header className="gap-1">
                  <Card.Title className="pr-8">{org.name}</Card.Title>
                  <Card.Description>{org.description}</Card.Description>
                </Card.Header>
                <Card.Footer className="mt-auto flex gap-1">
                  <Chip>{org.location}</Chip>
                  <Chip> {org.category}</Chip>
                </Card.Footer>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
