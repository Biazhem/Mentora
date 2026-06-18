import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { clerk_id, email, name, pic } = await req.json();

    if (!clerk_id || !email) {
      return NextResponse.json({ error: "clerk_id and email are required" }, { status: 400 });
    }

    const { data: existing, error: selectError } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("clerk_id", String(clerk_id));

    if (selectError) {
      console.error("SELECT error:", selectError);
      throw selectError;
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ user: existing[0], isNew: false });
    }

    const userId = crypto.randomUUID();

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        clerk_id: String(clerk_id),
        email: String(email),
        name: String(name || "User"),
        pic: pic || null,
      })
      .select("id, email");

    if (insertError) {
      console.error("INSERT error:", insertError);
      throw insertError;
    }

    return NextResponse.json({ user: newUser?.[0], isNew: true });
  } catch (err) {
    console.error("Sync user error:", err);
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}
