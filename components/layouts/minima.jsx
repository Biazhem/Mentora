"use client";

import { Button, Tooltip } from "@heroui/react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import MainHeader from "./main-header";
import { navItems } from "@/config/data";
import { Building } from "lucide-react";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { useEffect, useState } from "react";

export function MinimaDashboard({ children }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const selectedOrganizationId = useOrgSelectorStore(
    (s) => s.selectedOrganizationId,
  );
  const [isMember, setIsMember] = useState(false);

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

  const fullName = user?.fullName ?? "User";
  const imageUrl = user?.imageUrl;
  const emailAddress = user?.primaryEmailAddress?.emailAddress ?? "";
  const fallbackInitials =
    `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.trim() ||
    "U";

  return (
    <div className="w-full min-h-svh max-h-full flex bg-accent-soft dark:bg-accent-soft-hover">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-20 lg:fixed lg:h-screen py-8 flex-col items-center justify-between">
        {/* Navigation Items */}
        <nav className="flex flex-col gap-6 w-full">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.url;

            return (
              <Tooltip key={item.url} delay={0}>
                <Tooltip.Trigger>
                  <Link
                    href={item.url}
                    className="group relative w-full flex items-center justify-center py-3 cursor-pointer"
                  >
                    <div
                      className={`absolute left-0 h-full bg-background-inverse transition-all rounded-r-lg ${
                        isActive ? "w-1 opacity-100" : "w-[2px] opacity-0"
                      } group-hover:opacity-100`}
                    />

                    <item.icon
                      className={`transition-all ${
                        isActive ? "text-background-inverse" : "text-muted"
                      }`}
                    />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Content showArrow placement="right">
                  <Tooltip.Arrow />
                  <p>{item.title}</p>
                </Tooltip.Content>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="w-full flex flex-col items-center justify-between gap-2">
          {selectedOrganizationId && (
            <Tooltip delay={0} offset={10}>
              <Link href={`/organization/${selectedOrganizationId}`}>
                <Button variant={(pathname.includes(`/organization/${selectedOrganizationId}`))? "primary": "tertiary"} isIconOnly size="lg">
                  <Building />
                </Button>
              </Link>
              <Tooltip.Content showArrow placement="right">
                <Tooltip.Arrow />
                <p>Organization</p>
              </Tooltip.Content>
            </Tooltip>
          )}

          <Tooltip delay={0} offset={10}>
            <Button
              variant="danger-soft"
              isIconOnly
              size="lg"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="text-background-inverse" />
            </Button>
            <Tooltip.Content showArrow placement="right">
              <Tooltip.Arrow />
              <p>Logout</p>
            </Tooltip.Content>
          </Tooltip>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 ml-0 p-2 lg:p-5 bg-background m-3 rounded-3xl shadow-sm lg:ml-[92px] space-y-3">
        <MainHeader
          imageUrl={imageUrl}
          fallbackInitials={fallbackInitials}
          fullName={fullName}
          isLoaded={isLoaded}
          emailAddress={emailAddress}
        />
        {children}
      </main>
    </div>
  );
}
