"use client";

import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { Alert, Avatar, Button, Card } from "@heroui/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LinkSimpleHorizontalIcon } from "@phosphor-icons/react";

export default function InvitePage() {
  const params = useParams();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    async function fetchInviteData() {
      try {
        setLoading(true);

        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("id, org_name, description")
          .eq("id", params.slug)
          .single();

        if (orgError || !orgData) {
          setOrganization(null);
          return;
        }

        setOrganization(orgData);

        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (userData) {
          const { data: memberData } = await supabase
            .from("organization_members")
            .select("user_id")
            .eq("organization_id", orgData.id)
            .eq("user_id", userData.id)
            .maybeSingle();

          if (memberData) {
            setAlreadyMember(true);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchInviteData();
    }
  }, [params.slug, user, isLoaded, router]);

  const handleJoin = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setJoining(true);
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (!userData) {
        setMessage("User not found. Please complete onboarding first.");
        return;
      }

      const { error } = await supabase.from("organization_members").insert({
        organization_id: organization.id,
        user_id: userData.id,
        role: "member",
      });

      if (error) {
        if (error.code === "23505") {
          setAlreadyMember(true);
          setMessage("You are already a member of this organization.");
        } else {
          throw error;
        }
      } else {
        setMessage("Successfully joined the organization!");
        setAlreadyMember(true);
      }
    } catch (err) {
      console.error("Join error:", err);
      setMessage("Failed to join. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-svh">Loading...</div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-svh">
        Organization not found.
      </div>
    );
  }

  const userFallback = user?.emailAddresses?.[0]?.emailAddress?.slice(0, 2)?.toUpperCase() ?? "U";

  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-4 bg-accent-soft">
      <Card className="items-stretch flex-col gap-3 p-3 sm:p-4 sm:max-w-[420px]">
        <div className="flex sm:gap-3 items-center justify-between sm:justify-start mt-1">
          <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-accent-soft-hover flex items-center justify-center">
            <span className="text-2xl font-bold text-muted">
              {user?.firstName?.[0] ?? "U"}
            </span>
          </div>
          <LinkSimpleHorizontalIcon size={20} className="text-muted" />
          <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-accent-soft-hover flex items-center justify-center">
            <span className="text-2xl font-bold text-muted">
              {organization.org_name?.[0]?.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <Card.Header className="gap-1">
            <Card.Title className="pr-8">
              Welcome to {organization.org_name}!
            </Card.Title>
            <Card.Description>
              {organization.description?.slice(0, 80) || "Organization invite"}
            </Card.Description>
            {message && (
              <Alert color={alreadyMember ? "success" : "warning"} className="mt-2">
                {message}
              </Alert>
            )}
          </Card.Header>
          <Card.Footer className="mt-auto flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {organization.org_name}
              </span>
              <span className="text-xs text-muted">Organization invite</span>
            </div>
            {alreadyMember ? (
              <Link href={`/organization/${organization.id}`}>
                <Button className="w-full sm:w-auto">Go to Organization</Button>
              </Link>
            ) : (
              <Button
                className="w-full sm:w-auto"
                onPress={handleJoin}
                isLoading={joining}
              >
                {joining ? "Joining..." : "Join Organization"}
              </Button>
            )}
          </Card.Footer>
        </div>
      </Card>
    </div>
  );
}
