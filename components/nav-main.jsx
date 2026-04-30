"use client";

import {
  ChevronRight,
  Briefcase,
  Calendar,
  ListTodo,
  Building2,
  MessageCircleMoreIcon,
  University,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export function NavMain() {
  return (
    <>
      {/* Platform Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>

        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/job" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Jobs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Events</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/organization" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Organizations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/mentors" className="flex items-center gap-2">
                <University className="h-4 w-4" />
                <span>Mentors</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Team Section */}
      <SidebarGroup>
        <SidebarGroupLabel>By Team</SidebarGroupLabel>

        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/tasks" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                <span>Tasks</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Discussion with Collapsible */}
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <MessageCircleMoreIcon className="h-4 w-4" />
                  <span>Discussion</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href="/discussion/meetings">
                        <span>Meetings</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link href="/discussion/chats">
                        <span>Chats</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}