import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export const useOrgSelectorStore = create((set, get) => ({
  organizations: [],
  selectedOrganizationId: null,
  loading: false,

  fetchOrganizations: async (clerkId) => {
    if (!clerkId) return;

    set({ loading: true });

    const { data, error } = await supabase
      .from("organizations")
      .select("id, org_name, description")
      .eq("clerk_id", clerkId);

    if (data) {
      const defaultId = data.length > 0 ? String(data[0].id) : null;
      set({
        organizations: data,
        selectedOrganizationId: defaultId,
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  setSelectedOrganizationId: (organizationId) =>
    set({
      selectedOrganizationId: organizationId ? String(organizationId) : null,
    }),

  getSelectedOrganization: () => {
    const { organizations: items, selectedOrganizationId } = get();
    return (
      items.find((item) => String(item.id) === selectedOrganizationId) ?? null
    );
  },
}));
