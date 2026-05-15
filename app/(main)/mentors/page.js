"use client";

import { useState } from "react";
import { Button, InputGroup, ListBox, Select } from "@heroui/react";
import { data } from "@/config/data";
import { Search, SlidersHorizontal, Trash } from "lucide-react";
import { MentorDrawer } from "@/components/custom/drawer-mentor";

export default function MentorsPage() {
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("all");

  // Transform mock data to match component structure
  const mentors = data.mentors.map((mentor, idx) => ({
    id: idx + 1,
    name: mentor.name,
    bio: mentor.bio,
    picture: mentor.pic,
    expertise: mentor.expertise,
    experience: mentor.experience,
  }));
  const expertiseOptions = [
    "all",
    ...Array.from(new Set(mentors.flatMap((mentor) => mentor.expertise))).sort(),
  ];
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(search.toLowerCase()) ||
      mentor.bio.toLowerCase().includes(search.toLowerCase());
    const matchesExpertise =
      expertiseFilter === "all" || mentor.expertise.includes(expertiseFilter);

    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="py-12 px-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-left">Meet Our Mentors</h1>
        <p className="text-sm text-muted">
          Learn from experienced professionals in your field
        </p>
      </div>

      <div className="mb-8 flex justify-between gap-3 flex-wrap">
        <InputGroup>
          <InputGroup.Prefix>
            <Search className="size-4" />
          </InputGroup.Prefix>
          <InputGroup.Input
            placeholder="Search mentors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-fit"
          />
        </InputGroup>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary">
            <SlidersHorizontal />
            Filter
          </Button>
          <Button
            isIconOnly
            variant="danger-soft"
            onPress={() => {
              setSearch("");
              setExpertiseFilter("all");
            }}
          >
            <Trash />
          </Button>
          <Select
            onValueChange={setExpertiseFilter}
            defaultValue="all"
            className="min-w-[180px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {expertiseOptions.map((expertise) => (
                  <ListBox.Item key={expertise} value={expertise}>
                    {expertise === "all" ? "All Expertise" : expertise}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor) => (
          <MentorDrawer key={mentor.id} mentor={mentor} />
        ))}
      </div>
    </div>
  );
}
