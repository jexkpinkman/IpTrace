import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { generateShortId } from "@/lib/shortid";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });

  const body = await request.json();
  const { target_url, title } = body;

  if (!target_url || typeof target_url !== "string") {
    return NextResponse.json({ error: "URL tujuan wajib diisi" }, { status: 400 });
  }

  try { new URL(target_url); }
  catch { return NextResponse.json({ error: "Format URL tidak valid" }, { status: 400 }); }

  let id = generateShortId();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from("tracker_links").select("id").eq("id", id).single();
    if (!existing) break;
    id = generateShortId();
    attempts++;
  }

  const { data, error } = await supabase
    .from("tracker_links")
    .insert({ id, user_id: user.id, target_url, title: title || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.json({
    success: true,
    link: data,
    short_url: `${appUrl}/r/${id}`
  });
}
