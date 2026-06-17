"use client";

import { Button, Tooltip } from "@heroui/react";
import { DollarSign, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import MainHeader from "./main-header";
import { navItems } from "@/config/data";

export function MinimaDashboard({ children }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  // User Profile Data Derivation
  const fullName = user?.fullName ?? "User";
  const imageUrl = user?.imageUrl;
  const emailAddress = user?.primaryEmailAddress?.emailAddress ?? "";
  const fallbackInitials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.trim() || "U";

  return (
    <div className="w-full min-h-screen flex bg-background-secondary dark:bg-background-inverse/2">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-20 lg:fixed lg:h-screen py-8 flex-col items-center justify-between">
        
        {/* Navigation Items */}
        <nav className="flex flex-col gap-6 w-full">
          {navItems.map((item) => {
            const isActive = pathname === item.url;

            return (
              <Tooltip 
                key={item.url} 
                content={item.title} 
                placement="right" 
                delay={0}
              >
                <Link
                  href={item.url}
                  className="group relative w-full flex items-center justify-center py-3 cursor-pointer"
                >
                  {/* Active Indicator Bar */}
                  <div
                    className={`absolute left-0 h-full bg-background-inverse transition-all rounded-r-lg ${
                      isActive ? "w-1 opacity-100" : "w-[2px] opacity-0"
                    } group-hover:opacity-100`}
                  />
                  {/* Navigation Icon */}
                  <item.icon
                    className={`transition-all ${
                      isActive ? "text-background-inverse" : "text-muted"
                    }`}
                  />
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="w-full flex flex-col items-center justify-between gap-2">
          <Tooltip content="Billing" placement="left" delay={0} offset={10}>
            <Button variant="tertiary" isIconOnly size="lg">
              <DollarSign className="text-background-inverse" />
            </Button>
          </Tooltip>

          {/* Clean, single-button logout structure */}
          <Tooltip content="Logout" placement="left" delay={0} offset={10}>
            <Button 
              variant="tertiary" 
              isIconOnly 
              size="lg"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="text-background-inverse" />
            </Button>
          </Tooltip>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-5 bg-background m-3 rounded-3xl shadow-sm lg:ml-[92px] space-y-3">
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