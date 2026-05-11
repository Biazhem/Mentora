"use client";

import {
  Avatar,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Dropdown,
  Popover,
  Tooltip,
} from "@heroui/react";
import {
  DribbbleLogoIcon,
  FigmaLogoIcon,
  ThreadsLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  ArrowDown,
  Building2,
  CheckCheck,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  User,
  Bell,
  Settings,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeSwitch } from "@/components/theme/theme-switcher"
import { GraduationCap } from "lucide-react";
import { Briefcase } from "lucide-react";
import { Presentation } from "lucide-react";
import { FabButton } from "../custom/drawer";
import { useUser } from "@clerk/nextjs";

export function MinimaDashboard({ children }) {
  
  const { user: { firstName, lastName, imageUrl, hasImage } } = useUser();
  const [item, setItem] = useState(1);
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
            <Button variant="tertiary" isIconOnly size="lg">
              <LogOut className="text-background-inverse" />
            </Button>
            <Tooltip.Content placement="left" offset={10}>
              <p>Logut</p>
            </Tooltip.Content>
          </Tooltip>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-5 bg-background m-3 rounded-3xl shadow-sm lg:ml-[92px] space-y-3">
        <div className="w-full flex justify-between items-center h-10">
          <Breadcrumbs>
            <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#">Institutes</Breadcrumbs.Item>
            <Breadcrumbs.Item>TaskX</Breadcrumbs.Item>
          </Breadcrumbs>
          <div className="flex items-center justify-between gap-2">
            <ButtonGroup>
              <Button isIconOnly size="lg" variant="tertiary">
                <Settings />
              </Button>
            </ButtonGroup>
            <ThemeSwitch />
            <Popover>
              <Button isIconOnly>
                <Avatar color="accent">
                  <Avatar.Image src={imageUrl} alt={firstName} />
                  <Avatar.Fallback className="bg-accent text-background">
                    {firstName[0]+lastName[0]}
                  </Avatar.Fallback>
                </Avatar>
              </Button>
              <Popover.Content className="w-[320px] mt-3" placement="left">
                <Popover.Dialog>
                  <Popover.Arrow />
                  <Popover.Heading>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start flex-col">
                        <div className="rounded-lg h-12 overflow-hidden">
                          <img
                            className="object-cover object-top w-full"
                            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
                            alt="Mountain"
                          />
                        </div>
                        <Avatar
                          size="lg"
                          className="-mt-6 ml-4 ring-2 ring-white"
                        >
                          <Avatar.Image
                            alt="Sarah Johnson"
                            src="https://img.heroui.chat/image/avatar?w=400&h=400&u=1"
                          />
                          <Avatar.Fallback>SJ</Avatar.Fallback>
                        </Avatar>
                        <div className="mt-2">
                          <p className="text-base">Alex John</p>
                          <p className="text-muted text-sm">alex.co@ins.edu</p>
                        </div>
                      </div>
                    </div>
                  </Popover.Heading>
                  <p className="mt-3 text-sm text-muted">
                    Product designer and creative director. Building beautiful
                    experiences that matter.
                  </p>
                  <div className="mt-2 flex justify-end">
                    <ButtonGroup variant="secondary">
                      <Button isIconOnly>
                        <DribbbleLogoIcon />
                      </Button>
                      <Button isIconOnly>
                        <ThreadsLogoIcon />
                      </Button>
                    </ButtonGroup>
                  </div>
                </Popover.Dialog>
              </Popover.Content>
            </Popover>
          </div>
          <FabButton />
        </div>
        {children}
      </main>
    </div>
  );
}
