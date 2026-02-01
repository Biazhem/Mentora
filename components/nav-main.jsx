"use client";

import { ChevronRight, Briefcase, Calendars, ListTodo, Building2 } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {/* Jobs */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href="/jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Jobs</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Events */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href="/events" className="flex items-center gap-2">
              <Calendars className="h-4 w-4" />
              <span>Events</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href="/tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span>Tasks</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Organizations */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href="/organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Organizations</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
