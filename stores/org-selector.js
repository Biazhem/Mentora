import { create } from "zustand";
import { data } from "@/config/data";

const organizations = data.organizations.slice(0, 3);
const defaultOrganizationId = organizations.length > 0 ? String(organizations[0].id) : null;

export const useOrgSelectorStore = create((set, get) => ({
  organizations,
  selectedOrganizationId: defaultOrganizationId,
  setSelectedOrganizationId: (organizationId) =>
    set({
      selectedOrganizationId: organizationId ? String(organizationId) : null,
    }),
  getSelectedOrganization: () => {
    const { organizations: items, selectedOrganizationId } = get();

    return items.find((item) => String(item.id) === selectedOrganizationId) ?? null;
  },
}));
