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

  if (typeof gps_latitude !== "number" || typeof gps_longitude !== "number") {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  // Find most recent click for this link
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

  // Reverse geocoding pakai Nominatim (gratis, no API key)
  let gps_address: string | null = null;
  let gps_village: string | null = null;   // kelurahan
  let gps_district: string | null = null;  // kecamatan
  let gps_city: string | null = null;      // kota/kabupaten
  let gps_province: string | null = null;  // provinsi

  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${gps_latitude}&lon=${gps_longitude}&format=json&addressdetails=1`,
      {
        headers: { "User-Agent": "jexk-tracker/1.0" },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (geoRes.ok) {
      const geo = await geoRes.json();
      gps_address = geo.display_name ?? null;
      const a = geo.address ?? {};
      gps_village = a.village ?? a.suburb ?? a.neighbourhood ?? a.hamlet ?? null;
      gps_district = a.county ?? a.city_district ?? a.district ?? null;
      gps_city = a.city ?? a.town ?? a.municipality ?? null;
      gps_province = a.state ?? a.province ?? null;
    }
  } catch {
    // silently fail — tetap simpan koordinat
  }

  const { error: updateErr } = await supabase
    .from("tracker_clicks")
    .update({
      gps_latitude,
      gps_longitude,
      gps_accuracy,
      gps_address,
      gps_village,
      gps_district,
      gps_city,
      gps_province,
    })
    .eq("id", click.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
