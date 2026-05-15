"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Description, Dropdown, Label } from "@heroui/react";
import { Briefcase, Calendar, Users, Building2, Rocket } from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const exploreItems = [
  {
    title: "Job Portal",
    href: "/jobs",
    description: "Discover internships and full-time roles from top companies.",
    icon: Briefcase,
  },
  {
    title: "Events",
    href: "/events",
    description: "Join workshops, webinars, and networking meetups.",
    icon: Calendar,
  },
  {
    title: "Mentorship",
    href: "/mentor",
    description: "Connect with alumni and industry experts for guidance.",
    icon: Users,
  },
  {
    title: "Organizations",
    href: "/organizations",
    description: "Explore partner companies and their culture.",
    icon: Building2,
  },
];

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 px-3 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="rounded-lg bg-primary p-1.5">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Mentora</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Dropdown>
              <Button aria-label="Explore" size="sm" variant="ghost">
                Explore
              </Button>
              <Dropdown.Popover className="w-[420px] max-w-[90vw]">
                <Dropdown.Menu
                  aria-label="Explore links"
                  onAction={(key) => {
                    router.push(String(key));
                  }}
                >
                  {exploreItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Dropdown.Item id={item.href} key={item.href} textValue={item.title}>
                        <Icon className="mt-0.5 size-4 shrink-0 text-muted" />
                        <div className="flex flex-col gap-0.5">
                          <Label>{item.title}</Label>
                          <Description className="line-clamp-2 text-sm">{item.description}</Description>
                        </div>
                      </Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>

            <Button onPress={() => router.push("/tasks")} size="sm" variant="ghost">
              Tasks
            </Button>
            <Button onPress={() => router.push("/about")} size="sm" variant="ghost">
              About
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton forceRedirectUrl="/callback" mode="modal">
                <Button size="sm" variant="ghost">
                  Log in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Get Started</Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-4">
              <Button onPress={() => router.push("/dashboard")} size="sm" variant="ghost">
                Dashboard
              </Button>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
