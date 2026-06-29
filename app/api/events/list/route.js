import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    const { data: eventsData, error: eventsError } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (eventsError) throw eventsError;

    const orgIds = [...new Set((eventsData || []).map((e) => e.org_id))];

    const { data: orgsData } = await supabaseAdmin
      .from("organizations")
      .select("id, org_name")
      .in("id", orgIds);

    const orgMap = {};
    (orgsData || []).forEach((org) => {
      orgMap[org.id] = org.org_name;
    });

    const enriched = (eventsData || []).map((event) => ({
      ...event,
      org_name: orgMap[event.org_id] || "Unknown",
    }));

    let registrations = [];
    if (userId) {
      const { data: regData } = await supabaseAdmin
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", userId)
        .eq("status", "registered");

      registrations = regData || [];
    }

    return NextResponse.json({
      events: enriched,
      registered_event_ids: registrations.map((r) => r.event_id),
    });
  } catch (err) {
    console.error("Events list error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
