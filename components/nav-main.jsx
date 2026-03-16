"use client";

import { ChevronRight, Briefcase, Calendar, ListTodo, Building2 } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { MessageCircleMoreIcon } from "lucide-react";

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {/* Jobs */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Jobs</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Events */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
{/* hi */}

        {/* Organizations */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/organizations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>Organizations</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      <SidebarGroupLabel>By Team</SidebarGroupLabel>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span>Tasks</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/discussion" className="flex items-center gap-2">
              <MessageCircleMoreIcon className="h-4 w-4" />
              <span>Discussion</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
