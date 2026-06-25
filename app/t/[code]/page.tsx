import { headers } from "next/headers";
import { createServiceSupabase } from "@/lib/supabase";
import { parseUA } from "@/lib/ua-parser";
import TrackerClient from "./client";

async function logClick(code: string, request: {
  ip: string;
  ua: string | null;
  referer: string | null;
}) {
  try {
    const supabase = createServiceSupabase();

    const { data: link } = await supabase
      .from("tracker_links")
      .select("id, target_url")
      .eq("id", code)
      .single();

    if (!link) return null;

    const { browser, os, device } = parseUA(request.ua);

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

    if (request.ip !== "unknown") {
      try {
        const res = await fetch(`https://ipwho.is/${request.ip}`, {
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
      } catch { /* silently fail */ }
    }

    const { data: click } = await supabase
      .from("tracker_clicks")
      .insert({
        link_id: link.id,
        ip: request.ip,
        ...geoData,
        user_agent: request.ua,
        browser,
        os,
        device,
        referer: request.referer,
      })
      .select("id")
      .single();

    return { targetUrl: link.target_url, clickId: click?.id ?? null };
  } catch {
    return null;
  }
}

export default async function TrackerPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const headersList = await headers();

  const ip =
    headersList.get("x-real-ip") ||
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("cf-connecting-ip") ||
    "unknown";

  const ua = headersList.get("user-agent");
  const referer = headersList.get("referer") || null;

  const result = await logClick(code, { ip, ua, referer });

  return (
    <TrackerClient
      code={code}
      targetUrl={result?.targetUrl ?? null}
      clickId={result?.clickId ?? null}
    />
  );
}
