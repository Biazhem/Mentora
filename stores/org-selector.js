import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export const useOrgSelectorStore = create((set, get) => ({
  organizations: [],
  selectedOrganizationId: null,
  members: [],
  loading: false,

  fetchOrganizations: async (clerkId) => {
    if (!clerkId) return;

    set({ loading: true });

    try {
      const { data: ownedOrgs, error: ownedErr } = await supabase
        .from("organizations")
        .select("id, org_name, description, clerk_id")
        .eq("clerk_id", clerkId);

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkId)
        .single();

      let joinedOrgs = [];
      if (userData) {
        const { data: memberRows } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", userData.id);

        if (memberRows && memberRows.length > 0) {
          const ids = memberRows.map((m) => m.organization_id);
          const { data } = await supabase
            .from("organizations")
            .select("id, org_name, description, clerk_id")
            .in("id", ids);
          joinedOrgs = data || [];
        }
      }

      const ownedIds = new Set((ownedOrgs || []).map((o) => o.id));
      const allOrgs = [
        ...(ownedOrgs || []),
        ...joinedOrgs.filter((o) => !ownedIds.has(o.id)),
      ];

      const defaultId = allOrgs.length > 0 ? String(allOrgs[0].id) : null;

      set({
        organizations: allOrgs,
        selectedOrganizationId: defaultId,
        loading: false,
      });

      if (defaultId) {
        get().fetchMembers(defaultId);
      }
    } catch (err) {
      console.error("fetchOrganizations error:", err);
      set({ loading: false });
    }
  },

  fetchMembers: async (orgId) => {
    if (!orgId) return;

    try {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("clerk_id")
        .eq("id", orgId)
        .single();

      if (!orgData) return;

      const membersList = [];

      const { data: ownerData } = await supabase
        .from("users")
        .select("id, clerk_id, name, email, pic")
        .eq("clerk_id", orgData.clerk_id)
        .single();

      if (ownerData) {
        membersList.push({ ...ownerData, role: "Founder" });
      }

      const { data: memberRows } = await supabase
        .from("organization_members")
        .select("user_id, role, joined_at")
        .eq("organization_id", orgId);

      if (memberRows) {
        for (const m of memberRows) {
          if (ownerData && m.user_id === ownerData.id) continue;

          const { data: memberUser } = await supabase
            .from("users")
            .select("id, clerk_id, name, email, pic")
            .eq("id", m.user_id)
            .single();

          if (memberUser) {
            membersList.push({ ...memberUser, role: m.role, joined_at: m.joined_at });
          }
        }
      }

      set({ members: membersList });
    } catch (err) {
      console.error("fetchMembers error:", err);
    }
  },

  setSelectedOrganizationId: (organizationId) => {
    set({
      selectedOrganizationId: organizationId ? String(organizationId) : null,
    });

    if (organizationId) {
      get().fetchMembers(organizationId);
    }
  },

  getSelectedOrganization: () => {
    const { organizations: items, selectedOrganizationId } = get();
    return (
      items.find((item) => String(item.id) === selectedOrganizationId) ?? null
    );
  },
}));
