"use client";

import { Input } from "@heroui/react";
import { Avatar } from "@heroui/react";
import { Drawer, Button } from "@heroui/react";
import { Send } from "lucide-react";
import { MessageCircleMore } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useOrgSelectorStore } from "@/stores/org-selector";
import { Description } from "@heroui/react";

export function FabButton() {
  const { user } = useUser();
  const selectedOrganizationId = useOrgSelectorStore((s) => s.selectedOrganizationId);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedOrganizationId || !user) return;

    async function fetchMessages() {
      setLoading(true);
      const { data, error } = await supabase
        .from("org_messages")
        .select("*, users(name, pic)")
        .eq("org_id", selectedOrganizationId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (data) {
        const enriched = data.map((msg) => ({
          ...msg,
          type: msg.sender_id === userData?.id ? "self" : "other",
          avatar: msg.users?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?",
          userName: msg.users?.name || "Unknown",
          userPic: msg.users?.pic || null,
        }));
        setMessages(enriched);
      }
      setLoading(false);
    }

    let userData;
    async function init() {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();
      userData = data;
      await fetchMessages();
    }

    init();
  }, [selectedOrganizationId, user]);

  useEffect(() => {
    if (!selectedOrganizationId || !user) return;

    const channel = supabase
      .channel("org-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "org_messages",
          filter: `org_id=eq.${selectedOrganizationId}`,
        },
        async (payload) => {
          const { data: senderData } = await supabase
            .from("users")
            .select("name, pic")
            .eq("id", payload.new.sender_id)
            .single();

          const currentUserData = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", user.id)
            .single();

          const newMsg = {
            ...payload.new,
            type: payload.new.sender_id === currentUserData?.data?.id ? "self" : "other",
            avatar: senderData?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?",
            userName: senderData?.name || "Unknown",
            userPic: senderData?.pic || null,
          };

          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedOrganizationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedOrganizationId || !user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (!userData) return;

    const { error } = await supabase.from("org_messages").insert({
      org_id: selectedOrganizationId,
      sender_id: userData.id,
      content: newMessage.trim(),
    });

    if (!error) {
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
          <Drawer.Dialog className="flex flex-col gap-2">
            <Drawer.Header>
              <Drawer.Heading>Chats</Drawer.Heading>
              <Description>Org Name</Description>
            </Drawer.Header>
            <Drawer.Body className="border-b-2 border-accent overflow-y-auto max-h-full">
              {!selectedOrganizationId ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted text-sm">Select an organization to start chatting</p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted text-sm">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-muted text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="flex gap-2 flex-col">
                  {messages.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 ${item.type === "self" ? "flex-row-reverse" : "justify-start"}`}
                    >
                      <Avatar size="sm">
                        {item.userPic ? (
                          <Avatar.Image src={item.userPic} alt={item.userName} />
                        ) : null}
                        <Avatar.Fallback>{item.avatar}</Avatar.Fallback>
                      </Avatar>
                      <div className="flex flex-col items-end gap-1">
                        {item.type !== "self" && (
                          <p className="text-xs text-muted">{item.userName}</p>
                        )}
                        <p
                          className={`w-fit rounded-lg px-3 py-2 text-sm ${
                            item.type === "self"
                              ? "bg-primary text-primary-foreground self-end"
                              : "bg-muted/40 text-foreground"
                          }`}
                        >
                          {item.content}
                        </p>
                        <p className="text-xs text-muted self-end">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </Drawer.Body>
            <Drawer.Footer className="flex items-end">
              <Input
                type="text"
                placeholder={selectedOrganizationId ? "Type a message..." : "Select an org first"}
                className="flex-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!selectedOrganizationId}
              />
              <Button isIconOnly onClick={handleSend} disabled={!selectedOrganizationId || !newMessage.trim()}>
                <Send />
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
