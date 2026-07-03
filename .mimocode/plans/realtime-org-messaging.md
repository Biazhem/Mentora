# Real-time Org Messaging Implementation Plan

## Overview

Add real-time org-scoped group chat to the Mentora app. Each organization gets its own chat channel. Members can send/receive messages in real-time using Supabase Realtime.

## Current State

- **Drawer**: `components/custom/drawer.jsx` — uses mock data from `config/data.js`, no state management
- **Supabase client**: `lib/supabase.js` — basic `createClient` with env vars, no Realtime config
- **Org selector**: `stores/org-selector.js` — manages `selectedOrganizationId` and `members`
- **Auth**: Clerk — `user.id` = `clerk_id`, mapped to `users.id` via `users.clerk_id`
- **Integration**: Drawer is `FabButton` in `components/layouts/main-header.jsx`

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Realtime Flow                         │
│                                                          │
│  User sends message                                      │
│       ↓                                                  │
│  INSERT into messages table (org_id, user_id, content)   │
│       ↓                                                  │
│  Supabase Realtime broadcasts to org channel             │
│       ↓                                                  │
│  All org members receive via subscription                │
│       ↓                                                  │
│  UI updates instantly                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1: Database Schema

Add to `database/init.pgsql`:

```sql
-- Messages table for org-scoped chat
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_organization_id_fkey FOREIGN KEY (organization_id)
    REFERENCES public.organizations(id),
  CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES public.users(id)
);

-- Index for fast org-scoped queries
CREATE INDEX idx_messages_org_created ON public.messages (organization_id, created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

**Schema rationale:**
- `organization_id` scopes messages to an org
- `user_id` references `users.id` (not `clerk_id`) for consistency with `organization_members`
- `created_at` defaults to `now()` for ordering
- Composite index on `(organization_id, created_at DESC)` for efficient pagination

---

## Step 2: RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Org members can read messages
CREATE POLICY "org_members_can_read_messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = messages.organization_id
      AND om.user_id = (
        SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = messages.organization_id
      AND o.clerk_id = auth.uid()::text
    )
  );

-- Policy: Org members can insert messages
CREATE POLICY "org_members_can_insert_messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    user_id = (
      SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
    )
    AND (
      EXISTS (
        SELECT 1 FROM public.organization_members om
        WHERE om.organization_id = messages.organization_id
        AND om.user_id = (
          SELECT id FROM public.users WHERE clerk_id = auth.uid()::text
        )
      )
      OR EXISTS (
        SELECT 1 FROM public.organizations o
        WHERE o.id = messages.organization_id
        AND o.clerk_id = auth.uid()::text
      )
    )
  );

-- No DELETE/UPDATE policies — messages are immutable
```

**RLS rationale:**
- Members AND owners can read/write
- Uses `auth.uid()` which returns Clerk's `user.id` (mapped to `clerk_id`)
- Insert policy ensures `user_id` matches the authenticated user
- No update/delete — messages are append-only

---

## Step 3: Supabase Client Configuration

Update `lib/supabase.js`:

```javascript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

No changes needed — the default client supports Realtime out of the box.

---

## Step 4: Messages Store

Create `stores/messages.js`:

```javascript
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 50;

export const useMessagesStore = create((set, get) => ({
  messages: [],
  loading: false,
  hasMore: true,
  channel: null,

  // Fetch messages for an org
  fetchMessages: async (organizationId, options = { initial: true }) => {
    if (!organizationId) return;

    const { initial } = options;
    const { messages, hasMore } = get();

    // Don't fetch if already loaded and no more
    if (!initial && !hasMore) return;

    set({ loading: true });

    try {
      const from = initial ? 0 : messages.length;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at, user_id, users(id, name, pic)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Messages come newest-first, reverse for display
      const fetched = (data || []).reverse();

      set({
        messages: initial ? fetched : [...fetched, ...messages],
        hasMore: data?.length === PAGE_SIZE,
        loading: false,
      });

      return fetched;
    } catch (err) {
      console.error("fetchMessages error:", err);
      set({ loading: false });
      return [];
    }
  },

  // Send a message
  sendMessage: async (organizationId, userId, content) => {
    if (!content.trim() || !organizationId || !userId) return;

    try {
      const { error } = await supabase.from("messages").insert({
        organization_id: organizationId,
        user_id: userId,
        content: content.trim(),
      });

      if (error) throw error;
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  },

  // Subscribe to org channel
  subscribe: (organizationId, currentUserId) => {
    const { channel } = get();

    // Unsubscribe from previous channel
    if (channel) {
      supabase.removeChannel(channel);
    }

    if (!organizationId) return;

    const newChannel = supabase
      .channel(`org:${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `organization_id=eq.${organizationId}`,
        },
        async (payload) => {
          // Fetch the full message with user data
          const { data } = await supabase
            .from("messages")
            .select("id, content, created_at, user_id, users(id, name, pic)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            set((state) => ({
              messages: [...state.messages, data],
            }));
          }
        }
      )
      .subscribe();

    set({ channel: newChannel });
  },

  // Unsubscribe from current channel
  unsubscribe: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  },

  // Clear messages (for org switch)
  clearMessages: () => {
    set({ messages: [], hasMore: true });
  },
}));
```

---

## Step 5: Update Drawer Component

Replace `components/custom/drawer.jsx`:

```jsx
"use client";

import { Input, Avatar, Drawer, Button, ScrollShadow } from "@heroui/react";
import { Send, MessageCircleMore, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { useMessagesStore } from "@/stores/messages";

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function FabButton() {
  const { user } = useUser();
  const selectedOrganizationId = useOrgSelectorStore((s) => s.selectedOrganizationId);
  const members = useOrgSelectorStore((s) => s.members);
  const {
    messages,
    loading,
    hasMore,
    fetchMessages,
    sendMessage,
    subscribe,
    unsubscribe,
    clearMessages,
  } = useMessagesStore();

  const [inputValue, setInputValue] = useState("");
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Resolve Supabase user ID from Clerk clerk_id
  useEffect(() => {
    if (!user) return;

    async function resolveUserId() {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (data) setUserId(data.id);
    }

    resolveUserId();
  }, [user]);

  // Fetch messages and subscribe when org changes
  useEffect(() => {
    if (!selectedOrganizationId) return;

    clearMessages();
    fetchMessages(selectedOrganizationId, { initial: true });
    subscribe(selectedOrganizationId, userId);

    return () => {
      unsubscribe();
    };
  }, [selectedOrganizationId, userId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedOrganizationId || !userId) return;

    await sendMessage(selectedOrganizationId, userId, inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleScrollTop = () => {
    if (hasMore && !loading && selectedOrganizationId) {
      fetchMessages(selectedOrganizationId, { initial: false });
    }
  };

  const getUserForMessage = (msg) => {
    return msg.users || members.find((m) => m.id === msg.user_id) || {};
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Drawer>
      <Button
        isIconOnly
        variant="primary"
        color="primary"
        className="fixed bottom-6 right-6 shadow-2xl h-16 w-16 z-10"
      >
        <MessageCircleMore className="size-5" />
      </Button>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>
                {selectedOrganizationId ? "Org Chat" : "Select an organization"}
              </Drawer.Heading>
            </Drawer.Header>
            <Drawer.Body className="border-b-2 border-accent">
              <div
                ref={scrollContainerRef}
                onScroll={(e) => {
                  if (e.target.scrollTop === 0) handleScrollTop();
                }}
                className="flex flex-col gap-3 overflow-y-auto h-full"
              >
                {loading && messages.length === 0 && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="size-5 animate-spin text-muted" />
                  </div>
                )}

                {!selectedOrganizationId && (
                  <p className="text-center text-muted text-sm py-8">
                    Select an organization to start chatting
                  </p>
                )}

                {selectedOrganizationId && messages.length === 0 && !loading && (
                  <p className="text-center text-muted text-sm py-8">
                    No messages yet. Start the conversation!
                  </p>
                )}

                {messages.map((msg) => {
                  const msgUser = getUserForMessage(msg);
                  const isSelf = msg.user_id === userId;
                  const senderName = msgUser.name || "Unknown";
                  const senderPic = msgUser.pic;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${
                        isSelf ? "flex-row-reverse" : "justify-start"
                      }`}
                    >
                      <Avatar size="sm">
                        {senderPic ? (
                          <Avatar.Image src={senderPic} alt={senderName} />
                        ) : null}
                        <Avatar.Fallback>{getInitials(senderName)}</Avatar.Fallback>
                      </Avatar>
                      <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"} gap-1 max-w-[75%]`}>
                        {!isSelf && (
                          <p className="text-xs text-muted px-1">{senderName}</p>
                        )}
                        <p
                          className={`rounded-lg px-3 py-2 text-sm ${
                            isSelf
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/40 text-foreground"
                          }`}
                        >
                          {msg.content}
                        </p>
                        <p className="text-xs text-muted">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {loading && messages.length > 0 && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="size-4 animate-spin text-muted" />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </Drawer.Body>
            <Drawer.Footer className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={selectedOrganizationId ? "Type a message..." : "Select an org first"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!selectedOrganizationId || !userId}
                className="flex-1"
              />
              <Button
                isIconOnly
                onPress={handleSend}
                disabled={!inputValue.trim() || !selectedOrganizationId || !userId}
              >
                <Send />
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
```

---

## Step 6: File Summary

| File | Action | Purpose |
|------|--------|---------|
| `database/init.pgsql` | Append | Add `messages` table + index |
| `stores/messages.js` | Create | Zustand store for messages state + Realtime |
| `components/custom/drawer.jsx` | Replace | Real-time chat UI |
| `lib/supabase.js` | No change | Already supports Realtime |

---

## Implementation Order

1. Run the SQL migration (messages table + RLS + Realtime enablement)
2. Create `stores/messages.js`
3. Update `components/custom/drawer.jsx`
4. Test: Send messages, verify Realtime delivery, test org switching

---

## Key Design Decisions

1. **Single org channel** — One chat per organization (group chat, not DMs)
2. **Append-only messages** — No edit/delete to keep complexity low
3. **Cursor-based pagination** — Load older messages on scroll-to-top
4. **User ID resolution** — Map Clerk `clerk_id` → `users.id` once, reuse
5. **Channel naming** — `org:{orgId}` for clean subscription management
6. **Immutability** — Messages can't be edited or deleted (simpler RLS, simpler UI)
