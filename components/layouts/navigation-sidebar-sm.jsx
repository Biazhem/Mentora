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
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useOrgSelectorStore } from "@/stores/org-selector";

const navItems = [
  { icon: LayoutDashboard, title: "Dashboard", url: "/dashboard" },
  { icon: Briefcase, title: "Jobs", url: "/job" },
  { icon: Building2, title: "Organizations", url: "/organization" },
  { icon: CheckCheck, title: "Tasks", url: "/tasks" },
  { icon: GraduationCap, title: "Mentors", url: "/mentors" },
  { icon: Presentation, title: "Meetings", url: "/discussion/meetings" },
];

export function NavigationSidebarSmall() {
  const organizations = useOrgSelectorStore((state) => state.organizations);
  const selectedOrganizationId = useOrgSelectorStore((state) => state.selectedOrganizationId);
  const setSelectedOrganizationId = useOrgSelectorStore((state) => state.setSelectedOrganizationId);

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
                        <ListBox.Item key={itm.id} id={String(itm.id)} textValue={itm.name}>
                          <Avatar size="sm">
                            <Avatar.Image alt={itm.name} src={itm.logo} className="object-cover" />
                            <Avatar.Fallback>{itm.name[0].toUpperCase()}</Avatar.Fallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <Label>{itm.name}</Label>
                            <Description>{itm.description.slice(0, 18)}...</Description>
                          </div>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link key={item.url} href={item.url}>
                      <Button
                        slot="close"
                        variant="ghost"
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
                <Button slot="close" variant="danger" className="w-full justify-start">
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
