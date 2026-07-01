import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export const useMentorSelectorStore = create((set, get) => ({
  mentors: [],
  selectedMentorId: null,
  students: [],
  loading: false,

  fetchMentors: async (clerkId) => {
    if (!clerkId) return;

    set({ loading: true });

    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkId)
        .single();

      if (!userData) {
        set({ loading: false });
        return;
      }

      const { data: mentorData } = await supabase
        .from("mentors")
        .select("id")
        .eq("clerk_id", clerkId)
        .single();

      if (!mentorData) {
        set({ loading: false });
        return;
      }

      const { data: approvedRequests } = await supabase
        .from("mentorship_requests")
        .select("student_id, students(id, name, email, university, expertise, skills)")
        .eq("mentor_id", mentorData.id)
        .eq("status", "approved");

      const mentorList = [
        {
          id: mentorData.id,
          name: mentorData.name || "My Mentorship",
          type: "self",
        },
      ];

      const studentList = (approvedRequests || [])
        .map((r) => r.students)
        .filter(Boolean);

      set({
        mentors: mentorList,
        selectedMentorId: mentorData.id,
        students: studentList,
        loading: false,
      });
    } catch (err) {
      console.error("fetchMentors error:", err);
      set({ loading: false });
    }
  },

  setSelectedMentorId: (mentorId) => {
    set({ selectedMentorId: mentorId ? String(mentorId) : null });
  },

  getSelectedMentor: () => {
    const { mentors, selectedMentorId } = get();
    return mentors.find((m) => String(m.id) === selectedMentorId) ?? null;
  },
}));
