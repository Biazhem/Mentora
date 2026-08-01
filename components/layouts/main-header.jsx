"use client";

import {
  Avatar,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Popover,
  ListBox,
  Label,
  Description,
  Select,
} from "@heroui/react";
import { FabButton } from "../custom/drawer";
import { ThemeSwitch } from "../theme/theme-switcher";
import NotificationButton from "./notification-drawer";
import { Settings, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { NavigationSidebarSmall } from "./navigation-sidebar-sm";
import { supabase } from "@/lib/supabase";
import { Bell } from "lucide-react";

export default function MainHeader({
  fullName,
  fallbackInitials,
  imageUrl,
  isLoaded,
  emailAddress,
}) {
  const { user } = useUser();
  const fetchOrganizations = useOrgSelectorStore(
    (state) => state.fetchOrganizations,
  );
  const organizations = useOrgSelectorStore((state) => state.organizations);
  const loading = useOrgSelectorStore((state) => state.loading);
  const selectedOrganizationId = useOrgSelectorStore(
    (state) => state.selectedOrganizationId,
  );
  const setSelectedOrganizationId = useOrgSelectorStore(
    (state) => state.setSelectedOrganizationId,
  );
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [dbAvatar, setDbAvatar] = useState(null);

  useEffect(() => {
    if (user) fetchOrganizations(user.id);
  }, [user, fetchOrganizations]);

  useEffect(() => {
    async function fetchDbAvatar() {
      if (!user) return;
      const { data: studentData } = await supabase
        .from("students")
        .select("avatar_url")
        .eq("clerk_id", user.id)
        .maybeSingle();
      if (studentData?.avatar_url) {
        setDbAvatar(studentData.avatar_url);
        return;
      }
      const { data: founderData } = await supabase
        .from("organizations")
        .select("founder_photo_url")
        .eq("clerk_id", user.id)
        .maybeSingle();
      if (founderData?.founder_photo_url) {
        setDbAvatar(founderData.founder_photo_url);
      }
    }
    fetchDbAvatar();
  }, [user]);

  useEffect(() => {
    async function checkActiveMeeting() {
      if (!selectedOrganizationId) {
        setActiveMeeting(null);
        return;
      }

      const { data } = await supabase
        .from("meetings")
        .select("id, title")
        .eq("org_id", selectedOrganizationId)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setActiveMeeting(data || null);
    }

    checkActiveMeeting();
  }, [selectedOrganizationId]);
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    // Detect UUID-like segments (with or without dashes) and replace with literal "id"
    const isUuid = /^(?:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|[0-9a-fA-F]{32})$/.test(segment.replace(/\s+/g, ""));

    const label = isUuid
      ? "---"
      : segment
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");

    return { href, label };
  });

  return (
    <div className="w-full flex justify-between items-center h-10">
      <div className="flex items-center gap-2">
        <NavigationSidebarSmall />
        <Breadcrumbs className="hidden sm:flex">
          <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            if (isLast) {
              return (
                <Breadcrumbs.Item key={item.href}>
                  {item.label}
                </Breadcrumbs.Item>
              );
            }

            return (
              <Breadcrumbs.Item key={item.href} href={item.href}>
                {item.label}
              </Breadcrumbs.Item>
            );
          })}
        </Breadcrumbs>
      </div>
      <div className="flex items-center gap-2">
        {organizations.length > 0 ? (
          <Select
            className="hidden min-w-56 lg:flex"
            placeholder="Select organization"
            value={selectedOrganizationId}
            onChange={(value) => setSelectedOrganizationId(value)}
          >
            <Select.Trigger>
              <Select.Value className={"flex items-center gap-2 "} />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {organizations.map((itm) => (
                  <ListBox.Item
                    key={itm.id}
                    id={String(itm.id)}
                    textValue={itm.org_name}
                  >
                    <Avatar size="sm">
                      {itm.org_logo_url ? (
                        <Avatar.Image
                          src={itm.org_logo_url}
                          alt={itm.org_name}
                        />
                      ) : null}
                      <Avatar.Fallback>
                        {itm.org_name?.[0]?.toUpperCase() || "O"}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Label>{itm.org_name}</Label>
                      <Description>
                        {itm.description?.slice(0, 24) || ""}...
                      </Description>
                    </div>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        ) : !loading ? (
          <></>
        ) : null}
        {activeMeeting && (
          <Link href={`/discussion/meetings/${activeMeeting.id}`}>
            <Button color="success" size="lg">
              <Video className="size-4" />
              Join Meeting
            </Button>
          </Link>
        )}
        <NotificationButton />
        <ThemeSwitch />
        <Popover>
          <Button isIconOnly>
            <Avatar color="accent">
              <Avatar.Image src={dbAvatar || imageUrl} alt={fullName} />
              <Avatar.Fallback className="bg-accent text-background">
                {fallbackInitials}
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
                        className="object-cover object-top w-full backdrop:blur-3xl"
                        src={dbAvatar || imageUrl}
                        alt={fullName}
                        width={320}
                        height={48}
                      />
                    </div>
                    <Avatar size="lg" className="-mt-6 ml-4 ring-2 ring-white">
                      <Avatar.Image alt={fullName} src={dbAvatar || imageUrl} />
                      <Avatar.Fallback>{fallbackInitials}</Avatar.Fallback>
                    </Avatar>
                    <div className="mt-2">
                      <p className="text-base">
                        {isLoaded ? fullName : "Loading..."}
                      </p>
                      <p className="text-muted text-sm">
                        {isLoaded ? emailAddress : ""}
                      </p>
                      <Link href={"/profile"}>
                        <Button>Profile</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Popover.Heading>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </div>
      {organizations.length > 0 && <FabButton />}
    </div>
  );
}
