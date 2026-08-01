"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button, InputGroup, ListBox, Select } from "@heroui/react";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";
import { MentorDrawer } from "@/components/custom/drawer-mentor";
import { useRouter } from "next/navigation";
import { useCacheStore } from "@/stores/cache";

export default function MentorsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expertiseFilter, setExpertiseFilter] = useState("all");
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMentor, setIsMentor] = useState(false);

  const cache = useCacheStore();

  // move the fetch logic to component scope so we can call it from refresh
  const fetchMentors = async () => {
    const { data: mentorData, error } = await supabase.from("mentors").select("*");

    if (error || !mentorData) {
      setLoading(false);
      return [];
    }

    const userIds = mentorData.map((m) => m.clerk_id);
    const { data: userData } = await supabase
      .from("users")
      .select("clerk_id, name, pic")
      .in("clerk_id", userIds);

    const userMap = {};
    (userData || []).forEach((u) => {
      userMap[u.clerk_id] = u;
    });

    const enriched = mentorData.map((m) => ({
      ...m,
      picture: userMap[m.clerk_id]?.pic || null,
      displayName: userMap[m.clerk_id]?.name || m.name,
    }));

    // persist to cache
    cache.setData("mentors", enriched);

    setMentors(enriched);
    setLoading(false);
    return enriched;
  };

  useEffect(() => {
    const cached = cache.getData("mentors");
    if (cached) {
      setMentors(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function checkMentor() {
      if (!user) return;
      const { data } = await supabase
        .from("mentors")
        .select("id")
        .eq("clerk_id", user.id)
        .maybeSingle();
      setIsMentor(!!data);
    }
    checkMentor();
  }, [user]);

  const expertiseOptions = [
    "all",
    ...Array.from(
      new Set(
        mentors
          .flatMap((m) =>
            m.expertise ? m.expertise.split(",").map((s) => s.trim()) : [],
          )
          .filter(Boolean),
      ),
    ).sort(),
  ];

  const filteredMentors = mentors.filter((mentor) => {
    const expertiseList = mentor.expertise
      ? mentor.expertise.split(",").map((s) => s.trim())
      : [];

    const matchesSearch =
      (mentor.displayName || mentor.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (mentor.bio || "").toLowerCase().includes(search.toLowerCase()) ||
      (mentor.field || "").toLowerCase().includes(search.toLowerCase()) ||
      (mentor.institute || "").toLowerCase().includes(search.toLowerCase());

    const matchesExpertise =
      expertiseFilter === "all" ||
      expertiseList.some((e) => e === expertiseFilter);

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
        <div className="flex items-center gap-2 flex-col md:flex-row *:w-full">
          <InputGroup>
            <InputGroup.Prefix>
              <Search className="size-4" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="Search mentors by name, bio, field, or institute"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-fit"
            />
          </InputGroup>
          <div className="flex items-center gap-2">
            <Button onPress={() => router.push('/mentors/workspace')}>Workspace</Button>
            <Button onPress={async () => { setLoading(true); cache.removeData('mentors'); await fetchMentors(); }} variant="secondary">Refresh</Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isMentor && (
            <Button onPress={() => router.push('/mentors/requests')}>Requests</Button>
          )}
          <Select
            selectedKey={expertiseFilter}
            onSelectionChange={(key) => setExpertiseFilter(key || "all")}
            className="min-w-[180px]"
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {expertiseOptions.map((opt) => (
                  <ListBox.Item key={opt} id={opt} textValue={opt === "all" ? "All Expertise" : opt}>
                    {opt === "all" ? "All Expertise" : opt}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-accent-soft-hover p-4 space-y-3"
            >
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
      ) : filteredMentors.length === 0 ? (
        <p className="text-center text-muted py-12">No mentors found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentors.map((mentor) => (
            <MentorDrawer key={mentor.id} mentor={mentor} />
          ))}
        </div>
      )}
    </div>
  );
}
