"use client";

import {
  Avatar,
  Description,
  Label,
  ListBox,
  Button,
  Drawer,
  Select,
} from "@heroui/react";
import {
  Briefcase,
  Building2,
  CheckCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Presentation,
  Ticket
} from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { navItems } from "@/config/data";


export function NavigationSidebarSmall() {
  const { user } = useUser();
  const fetchOrganizations = useOrgSelectorStore((state) => state.fetchOrganizations);
  const organizations = useOrgSelectorStore((state) => state.organizations);
  const selectedOrganizationId = useOrgSelectorStore((state) => state.selectedOrganizationId);
  const setSelectedOrganizationId = useOrgSelectorStore((state) => state.setSelectedOrganizationId);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (user) fetchOrganizations(user.id);
  }, [user, fetchOrganizations]);

  useEffect(() => {
    async function checkMembership() {
      if (!user || !selectedOrganizationId) {
        setIsMember(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) {
        setIsMember(false);
        return;
      }

      const { data } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", selectedOrganizationId)
        .eq("user_id", userData.id)
        .maybeSingle();

      setIsMember(!!data);
    }

    checkMembership();
  }, [user, selectedOrganizationId]);

  const filteredNavItems = navItems.filter((item) => {
    if (item.url === "/tasks" && !isMember) return false;
    return true;
  });

  return (
    <Drawer>
      <Drawer.Trigger>
        <Button
          isIconOnly
          size="sm"
          variant="tertiary"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-4" />
        </Button>
      </Drawer.Trigger>

      <Drawer.Backdrop>
        <Drawer.Content placement="left">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Navigation</Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body>
              <div className="mb-4">
                <Select
                  className="w-full"
                  placeholder="Select organization"
                  value={selectedOrganizationId}
                  onChange={(value) => setSelectedOrganizationId(value)}
                >
                  <Select.Trigger>
                    <Select.Value className="flex items-center gap-2" />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {organizations.map((itm) => (
                        <ListBox.Item key={itm.id} id={String(itm.id)} textValue={itm.org_name}>
                          <Avatar size="sm">
                            {itm.org_logo_url ? (
                              <Avatar.Image src={itm.org_logo_url} alt={itm.org_name} />
                            ) : null}
                            <Avatar.Fallback>{itm.org_name?.[0]?.toUpperCase() || "O"}</Avatar.Fallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <Label>{itm.org_name}</Label>
                            <Description>{itm.description?.slice(0, 18) || ""}...</Description>
                          </div>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <nav className="flex flex-col gap-2">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link key={item.url} href={item.url}>
                      <Button
                        slot="close"
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Icon className="size-4" />
                        {item.title}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </Drawer.Body>
            <Drawer.Footer>
              <SignOutButton redirectUrl="/">
                <Button slot="close" variant="danger-soft" className="w-full justify-start">
                  <LogOut className="size-4" />
                  Logout
                </Button>
              </SignOutButton>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
