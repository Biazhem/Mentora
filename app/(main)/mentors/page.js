"use client";

import { useState, useEffect } from "react";
import { Button, InputGroup, ListBox, Select } from "@heroui/react";
import { supabase } from "@/lib/supabase";
import { Search, SlidersHorizontal, Trash } from "lucide-react";
import { MentorDrawer } from "@/components/custom/drawer-mentor";

export default function MentorsPage() {
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentors() {
      const { data, error } = await supabase
        .from("mentors")
        .select("*");

      if (!error && data) {
        setMentors(data);
      }
      setLoading(false);
    }

    fetchMentors();
  }, []);

  


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
                
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-accent-soft-hover p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-background-secondary" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-background-secondary rounded" />
                  <div className="h-3 w-24 bg-background-secondary rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-background-secondary rounded" />
              <div className="h-3 w-3/4 bg-background-secondary rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <MentorDrawer
              key={mentor.id}
              mentor={mentor}
            />
          ))}
          
        </div>
      )}
    </div>
  );
}
