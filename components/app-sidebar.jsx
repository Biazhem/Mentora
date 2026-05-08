"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Card } from "@heroui/react";
import { Popover } from "@heroui/react";
import { Button } from "@heroui/react";
import { Avatar } from "@heroui/react";
import { ButtonGroup } from "@heroui/react";
import { ChevronsUpDown } from "lucide-react";
import { Circle } from "lucide-react";
import { Chip } from "@heroui/react";
import { Kbd } from "@heroui/react";
import { SquarePlus } from "lucide-react";
import { Label } from "@heroui/react";
import { Description } from "@heroui/react";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Popover>
          <ButtonGroup variant="secondary">
            <Button fullWidth className={"justify-start"}>
              <Circle />
              Acme Inc
            </Button>
            <Button isIconOnly>
              <ChevronsUpDown />
            </Button>
          </ButtonGroup>
          <Popover.Content className="w-57.5" placement="left">
            <Popover.Dialog>
              <Popover.Heading>
                <Popover.Heading>Teams</Popover.Heading>
              </Popover.Heading>
              <div>
                <ButtonGroup
                  fullWidth
                  orientation="vertical"
                  variant="secondary"
                >
                  {data.teams.map((itm, idx) => (
                    <Button>
                      {itm.name}
                      <Kbd className="ms-auto" slot="keyboard" variant="light">
                        <Kbd.Abbr keyValue="command" />
                        <Kbd.Content>{idx + 1}</Kbd.Content>
                      </Kbd>
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
