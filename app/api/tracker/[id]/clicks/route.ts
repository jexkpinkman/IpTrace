import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: link } = await supabase
    .from("tracker_links").select("id").eq("id", id).eq("user_id", user.id).single();
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: clicks, error } = await supabase
    .from("tracker_clicks")
    .select("*")
    .eq("link_id", id)
    .order("clicked_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, clicks });
}
