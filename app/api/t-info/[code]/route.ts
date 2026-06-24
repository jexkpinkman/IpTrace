import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = createServiceSupabase();

  const { data: link, error } = await supabase
    .from("tracker_links")
    .select("id, target_url")
    .eq("id", code)
    .single();

  if (error || !link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ target_url: link.target_url });
}
