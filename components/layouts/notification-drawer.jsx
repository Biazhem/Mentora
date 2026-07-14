"use client";

import { Drawer } from "@heroui/react";
import { Description } from "@heroui/react";
import { Button, Label, Badge } from "@heroui/react";
import {
  Bell,
  Briefcase,
  Calendar,
  MessageCircle,
  Video,
  Users,
  CheckSquare,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";

const TYPE_ICONS = {
  job: Briefcase,
  event: Calendar,
  message: MessageCircle,
  meeting: Video,
  membership: Users,
  task: CheckSquare,
  mentorship: GraduationCap,
};

function getNotificationUrl(type, entity_id, org_id) {
  switch (type) {
    case "job":
      return "/job";
    case "event":
      return "/events";
    case "message":
      return "/discussion";
    case "meeting":
      return entity_id
        ? `/discussion/meetings/${entity_id}`
        : "/discussion/meetings";
    case "membership":
      return org_id ? `/organization/${org_id}` : "/dashboard";
    case "task":
      return "/tasks";
    case "mentorship":
      return "/mentors";
    default:
      return "/dashboard";
  }
}

export default function NotificationButton() {
  const { user } = useUser();
  const selectedOrganizationId = useOrgSelectorStore(
    (s) => s.selectedOrganizationId,
  );
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .maybeSingle();
    if (!userData) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    let userDataId = null;

    const init = async () => {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .maybeSingle();
      if (data) userDataId = data.id;
    };

    init();

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.new.user_id === userDataId) {
            setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!user) return;
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .maybeSingle();
    if (!userData) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userData.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <Drawer>
      <Button isIconOnly={unreadCount > 0 ? false : true} size="lg" variant="tertiary">
        <Bell />
        {unreadCount > 0 ? unreadCount : ""}
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Drawer.Heading>Notifications</Drawer.Heading>
                {unreadCount > 0 && (
                  <span className="text-xs bg-danger text-white rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button size="sm" variant="ghost" onClick={markAllRead}>
                  Mark all read
                </Button>
              )}
            </Drawer.Header>
            <Drawer.Body className="overflow-y-auto flex-1 min-h-0">
              {notifications.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif, idx) => {
                    const Icon = TYPE_ICONS[notif.type] || Bell;
                    const url = getNotificationUrl(
                      notif.type,
                      notif.entity_id,
                      notif.org_id,
                    );
                    return (
                      <Link
                        key={notif.id}
                        href={url}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div
                          className={`flex items-start gap-3 p-3 border-b border-default transition-colors hover:bg-accent-soft ${
                            !notif.is_read ? "bg-accent-soft/50" : ""
                          }`}
                        >
                          <div
                            className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                              notif.type === "job"
                                ? "bg-success/10 text-success"
                                : notif.type === "event"
                                  ? "bg-warning/10 text-warning"
                                  : notif.type === "message"
                                    ? "bg-primary/10 text-primary"
                                    : notif.type === "meeting"
                                      ? "bg-danger/10 text-danger"
                                      : notif.type === "task"
                                        ? "bg-accent/10 text-accent"
                                        : "bg-accent/10 text-accent"
                            }`}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${!notif.is_read ? "font-semibold" : ""}`}
                            >
                              {notif.title}
                            </p>
                            <p className="text-xs text-muted line-clamp-2 mt-0.5">
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-muted mt-1">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notif.is_read && (
                            <div className="size-2 rounded-full bg-primary shrink-0 mt-2" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Drawer.Body>
            <Drawer.Footer>
              <Button slot="close" variant="secondary" fullWidth>
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
