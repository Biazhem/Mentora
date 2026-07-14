import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const NOTIFICATION_URLS = {
  job: (entityId) => `/job`,
  event: (entityId) => `/events`,
  message: (entityId) => `/discussion`,
  meeting: (entityId) => `/discussion/meetings/${entityId}`,
  membership: (entityId, orgId) => `/organization/${orgId}`,
};

async function notifyOrgMembers({ orgId, type, title, message, entityId, excludeUserId }) {
  const { data: members } = await supabaseAdmin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId)
    .neq("user_id", excludeUserId || "");

  if (!members || members.length === 0) return;

  const rows = members.map((m) => ({
    user_id: m.user_id,
    org_id: orgId,
    type,
    title,
    message: message || "",
    entity_id: entityId || null,
  }));

  const { error } = await supabaseAdmin.from("notifications").insert(rows);
  if (error) console.error("Notify error:", error);
  return rows;
}

async function sendEmail(to, subject, html) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
    return res.ok;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

export async function POST(req) {
  try {
    const { action, orgId, type, title, message, entityId, excludeUserId, email, emailSubject, emailHtml } = await req.json();

    if (action === "notify") {
      const rows = await notifyOrgMembers({ orgId, type, title, message, entityId, excludeUserId });

      if (email && emailSubject && emailHtml) {
        const admins = await supabaseAdmin
          .from("organization_members")
          .select("user_id, users!fk_user(email)")
          .eq("organization_id", orgId)
          .eq("role", "admin");

        if (admins.data) {
          for (const admin of admins.data) {
            const adminEmail = admin.users?.email;
            if (adminEmail) {
              await sendEmail(adminEmail, emailSubject, emailHtml);
            }
          }
        }
      }

      return NextResponse.json({ success: true, count: rows?.length || 0 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Notification API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
