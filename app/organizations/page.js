"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ButtonGroup } from "@/components/ui/button-group";

const organizations = [
  {
    id: 1,
    slug: "technova",
    name: "TechNova",
    industry: "Software & IT",
    location: "Remote",
    university: "FAST National University",
    description:
      "TechNova partners with Mentora to provide internships and mentorship programs.",
  },
  {
    id: 2,
    slug: "datasphere",
    name: "DataSphere",
    industry: "Data & Analytics",
    location: "Islamabad",
    university: "NUST",
    description:
      "DataSphere collaborates with Mentora to offer project-based learning.",
  },
  {
    id: 3,
    slug: "innoworks",
    name: "InnoWorks",
    industry: "Startup & Innovation",
    location: "Lahore",
    university: "University of Lahore",
    description:
      "InnoWorks helps students enter startup environments through mentorship.",
  },
];

export default function OrganizationsPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [university, setUniversity] = useState("all");

  const filteredOrganizations = organizations.filter((org) => {
    return (
      org.name.toLowerCase().includes(search.toLowerCase()) &&
      (industry === "all" || org.industry === industry) &&
      (university === "all" || org.university === university)
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
          <Select onValueChange={setIndustry} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Industries</SelectItem>
              <SelectItem value="Software & IT">Software & IT</SelectItem>
              <SelectItem value="Data & Analytics">Data & Analytics</SelectItem>
              <SelectItem value="Startup & Innovation">
                Startup & Innovation
              </SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setUniversity} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Universities</SelectItem>
              <SelectItem value="FAST National University">
                FAST National University
              </SelectItem>
              <SelectItem value="NUST">NUST</SelectItem>
              <SelectItem value="University of Lahore">
                University of Lahore
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mx-aut px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <Link href={`/organizations/${org.slug}`}>
                <CardTitle className="hover:underline cursor-pointer">
                  {org.name}
                </CardTitle>
              </Link>
              <CardDescription>{org.industry}</CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">{org.description}</p>
              <p className="text-sm mt-2">Location: {org.location}</p>
              <p className="text-sm">University: {org.university}</p>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href={`/organizations/${org.slug}`}>View Profile</Link>
              </Button>

              <Button asChild>
                <Link href={`/jobs?org=${org.slug}`}>View Opportunities</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
