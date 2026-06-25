import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase";
import { parseUA } from "@/lib/ua-parser";

function getClientIP(request: NextRequest): string {
  const headers = [
    "x-real-ip",
    "x-forwarded-for",
    "cf-connecting-ip",
    "x-client-ip",
    "x-cluster-client-ip",
    "true-client-ip",
    "forwarded",
  ];

  for (const h of headers) {
    const val = request.headers.get(h);
    if (val) {
      // x-forwarded-for bisa berisi multiple IP, ambil yang pertama
      const ip = val.split(",")[0].trim();
      if (ip && ip !== "unknown") return ip;
    }
  }

  // Fallback: Next.js 13+ expose via request.ip
  // @ts-ignore
  if (request.ip) return request.ip;

  return "unknown";
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

  const ip = getClientIP(request);
  const ua = request.headers.get("user-agent");
  const referer = request.headers.get("referer") || null;
  const { browser, os, device } = parseUA(ua);

  // Log klik fire and forget
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
          headers: { "User-Agent": "jexktracker/1.0" },
          signal: AbortSignal.timeout(5000),
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

      await supabase
        .rpc("increment_click_count", { link_id: link.id })
        .maybeSingle();

    } catch {
      // silently fail
    }
  })();

  return NextResponse.json({ target_url: link.target_url });
}
