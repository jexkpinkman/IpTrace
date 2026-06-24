import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase";
import { parseUA } from "@/lib/ua-parser";

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function GET(
  request: NextRequest,
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

  // Log klik di background (fire and forget)
  const ip = getClientIP(request);
  const ua = request.headers.get("user-agent");
  const referer = request.headers.get("referer") || null;
  const { browser, os, device } = parseUA(ua);

  (async () => {
    try {
      let geoData = {
        country: null as string | null,
        country_code: null as string | null,
        city: null as string | null,
        region: null as string | null,
        isp: null as string | null,
        asn: null as string | null,
        timezone: null as string | null,
        latitude: null as number | null,
        longitude: null as number | null,
      };

      if (ip !== "unknown") {
        const res = await fetch(`https://ipwho.is/${ip}`, {
          headers: { "User-Agent": "iptrace/1.0" },
          signal: AbortSignal.timeout(4000),
        });
        if (res.ok) {
          const geo = await res.json();
          if (geo.success) {
            geoData = {
              country: geo.country ?? null,
              country_code: geo.country_code ?? null,
              city: geo.city ?? null,
              region: geo.region ?? null,
              isp: geo.connection?.isp ?? geo.connection?.org ?? null,
              asn: geo.connection?.asn ? `AS${geo.connection.asn}` : null,
              timezone: geo.timezone?.id ?? null,
              latitude: geo.latitude ?? null,
              longitude: geo.longitude ?? null,
            };
          }
        }
      }

      await supabase.from("tracker_clicks").insert({
        link_id: link.id,
        ip,
        ...geoData,
        user_agent: ua,
        browser,
        os,
        device,
        referer,
      });

      // Update click count
      await supabase.rpc("increment_click_count", { link_id: link.id }).maybeSingle();

    } catch {
      // silently fail
    }
  })();

  return NextResponse.json({ target_url: link.target_url });
}
