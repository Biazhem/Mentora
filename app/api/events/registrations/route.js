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

    if (!userId) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 });
    }

    const { data: regData, error: regError } = await supabaseAdmin
      .from("event_registrations")
      .select("*")
      .eq("user_id", userId)
      .order("registered_at", { ascending: false });

    if (regError) throw regError;

    const eventIds = (regData || []).map((r) => r.event_id);

    const { data: eventsData } = await supabaseAdmin
      .from("events")
      .select("id, title, start_date, end_date, location, type, org_id")
      .in("id", eventIds);

    const orgIds = [...new Set((eventsData || []).map((e) => e.org_id))];
    const { data: orgsData } = await supabaseAdmin
      .from("organizations")
      .select("id, org_name")
      .in("id", orgIds);

    const eventsMap = {};
    (eventsData || []).forEach((e) => { eventsMap[e.id] = e; });

    const orgsMap = {};
    (orgsData || []).forEach((o) => { orgsMap[o.id] = o; });

    const enriched = (regData || []).map((reg) => ({
      ...reg,
      event: eventsMap[reg.event_id] || null,
      org: eventsMap[reg.event_id] ? orgsMap[eventsMap[reg.event_id].org_id] : null,
    }));

    return NextResponse.json({ registrations: enriched });
  } catch (err) {
    console.error("Registrations error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { event_id, user_id } = await req.json();

    if (!event_id || !user_id) {
      return NextResponse.json({ error: "event_id and user_id required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("event_registrations")
      .insert({ event_id, user_id, status: "registered" })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Already registered" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ registration: data });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("event_registrations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
