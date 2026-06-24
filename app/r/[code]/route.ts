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

  // Get link
  const { data: link, error } = await supabase
    .from("tracker_links")
    .select("id, target_url")
    .eq("id", code)
    .single();

  if (error || !link) {
    return new NextResponse("Link not found", { status: 404 });
  }

  // Fire-and-forget: log the click
  const ip = getClientIP(request);
  const ua = request.headers.get("user-agent");
  const referer = request.headers.get("referer") || null;
  const { browser, os, device } = parseUA(ua);

  // Async geo lookup — don't await so redirect is instant
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
    } catch {
      // silently fail — don't break redirect
    }
  })();

  return NextResponse.redirect(link.target_url, { status: 302 });
}
