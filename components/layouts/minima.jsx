"use client";

import {
  Button,
  Tooltip,
} from "@heroui/react";
import {
  Building2,
  CheckCheck,
  LayoutDashboard,
  LogOut,
  Settings,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Briefcase } from "lucide-react";
import { Presentation } from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import MainHeader from "./main-header";

export function MinimaDashboard({ children }) {
  const { user, isLoaded } = useUser();
  const [item, setItem] = useState(1);

  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const fullName = user?.fullName ?? "User";
  const imageUrl = user?.imageUrl;
  const emailAddress = user?.primaryEmailAddress?.emailAddress ?? "";
  const fallbackInitials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim() || "U";
  const icons = [
    { icon: LayoutDashboard, title: "Dashboard", url: "/dashboard" },
    { icon: Briefcase , title: "Jobs", url: "/job" },
    { icon: Building2, title: "Organizations", url: "/organization" },
    { icon: CheckCheck, title: "Tasks", url: "/tasks" },
    { icon: GraduationCap , title: "Mentors", url: "/mentors" },
    { icon: Presentation , title: "Meetings", url: "/discussion/meetings" },
  ];

  return (
    <div className="w-full min-h-screen flex bg-background-secondary dark:bg-background-inverse/2">
      <aside className="hidden lg:flex lg:w-20 lg:fixed lg:h-screen py-8 flex-col items-center justify-between">
        

        <nav className="flex flex-col gap-6 w-full">
          {icons.map((Icon, i) => (
            <Tooltip delay={0} key={i}>
              <Tooltip.Trigger>
                <Link href={Icon.url}>
                  <button
                    onClick={() => setItem(i + 1)}
                    className="group relative w-full flex items-center justify-center py-3 cursor-pointer"
                  >
                    <div
                      className={`absolute left-0 h-full ${
                        item == i + 1 ? "w-1" : "w-[2px]"
                      } bg-background-inverse ${
                        item == i + 1 ? "opacity-100" : "opacity-0"
                      } group-hover:opacity-100 transition-all rounded-r-lg`}
                    />
                    <Icon.icon
                      className={
                        (item == i + 1 ? "text-background-inverse" : "text-muted") +
                        " transition-all"
                      }
                    />
                  </button>
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content placement="right">{Icon.title}</Tooltip.Content>
            </Tooltip>
          ))}
        </nav>

        <div className="w-full flex flex-col items-center justify-between gap-2">

          <Tooltip delay={0}>
            <Button variant="tertiary" isIconOnly size="lg">
              <DollarSign className="text-background-inverse" />
            </Button>
            <Tooltip.Content placement="left" offset={10}>
              <p>Billing</p>
            </Tooltip.Content>
          </Tooltip>

          <Tooltip delay={0}>
            <SignOutButton redirectUrl="/">
              <Button variant="tertiary" isIconOnly size="lg">
                <LogOut className="text-background-inverse" />
              </Button>
            </SignOutButton>
            <Tooltip.Content placement="left" offset={10}>
              <p>Logout</p>
            </Tooltip.Content>
          </Tooltip>
        </div>
      </aside>

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
