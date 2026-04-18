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
import { data } from "@/config/data";

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
          <Select onValueChange={setIndustry} defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Information Technology">
                Information Technology
              </SelectItem>
              <SelectItem value="Artificial Intelligence">
                Artificial Intelligence
              </SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="SaaS">SaaS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <Card key={org.id} className={"hover:shadow-sm cursor-pointer"}>
            <CardHeader className="w-full flex gap-2">
              <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 shrink">
                <img
                  src={org.pic}
                  alt={org.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <Link href={`/organizations/${org.slug}`}>
                <CardTitle className="hover:underline cursor-pointer">
                  {org.name}
                </CardTitle>
                <CardDescription className={"line-clamp-2"}>{org.category}</CardDescription>
              </Link>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">{org.description}</p>
              <p className="text-sm mt-2">Location: {org.location}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
