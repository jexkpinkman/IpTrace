import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const supabase = createServiceSupabase();

  let body: {
    gps_latitude?: number;
    gps_longitude?: number;
    gps_accuracy?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { gps_latitude, gps_longitude, gps_accuracy } = body;

  if (
    typeof gps_latitude !== "number" ||
    typeof gps_longitude !== "number"
  ) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  // Find the most recent click for this link (the one just recorded by t/[code]/route.ts)
  const { data: click, error: fetchErr } = await supabase
    .from("tracker_clicks")
    .select("id")
    .eq("link_id", code)
    .order("clicked_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchErr || !click) {
    return NextResponse.json({ error: "Click not found" }, { status: 404 });
  }

  const { error: updateErr } = await supabase
    .from("tracker_clicks")
    .update({
      gps_latitude,
      gps_longitude,
      gps_accuracy,
    })
    .eq("id", click.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
