import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { clerk_id, name, bio, email, phone, gender, dob, field, expertise, experience, institute, inst_email } = await req.json();

    if (!clerk_id || !name) {
      return NextResponse.json({ error: "clerk_id and name are required" }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("mentors")
      .select("id")
      .eq("clerk_id", clerk_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ mentor: existing, isNew: false });
    }

    const { data: mentor, error: insertError } = await supabaseAdmin
      .from("mentors")
      .insert({
        clerk_id,
        name: name || "",
        bio: bio || "",
        email: email || "",
        phone: phone || "",
        gender: gender || "",
        dob: dob || "",
        field: field || "",
        expertise: expertise || "",
        experience: experience || "",
        institute: institute || "",
        inst_email: inst_email || "",
      })
      .select("id, name")
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ mentor, isNew: true });
  } catch (err) {
    console.error("Mentor sync error:", err);
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}
