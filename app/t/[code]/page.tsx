import { headers } from "next/headers";
import { createServiceSupabase } from "@/lib/supabase";
import { parseUA } from "@/lib/ua-parser";
import TrackerClient from "./client";

async function getTargetUrl(code: string, supabase: ReturnType<typeof createServiceSupabase>) {
  const { data: link, error } = await supabase
    .from("tracker_links")
    .select("id, target_url")
    .eq("id", code)
    .single();

  if (error || !link) {
    console.error("[t/code] link not found:", code, error?.message);
    return null;
  }

  return link;
}

async function logClick(
  linkId: string,
  supabase: ReturnType<typeof createServiceSupabase>,
  request: { ip: string; ua: string | null; referer: string | null }
) {
  try {
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
      } catch (err) {
        console.error("[t/code] ipwho.is fetch failed:", err);
      }
    }

    const { data: click, error } = await supabase
      .from("tracker_clicks")
      .insert({
        link_id: linkId,
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

    if (error) {
      console.error("[t/code] insert click failed:", error.message);
      return null;
    }

    return click?.id ?? null;
  } catch (err) {
    console.error("[t/code] logClick threw:", err);
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

  const supabase = createServiceSupabase();

  // 1. Ambil target_url dulu — ini yang PALING PENTING, harus selalu jalan.
  const link = await getTargetUrl(code, supabase);

  // 2. Baru catat klik. Kalau ini gagal, redirect TETAP jalan (tidak saling blokir lagi).
  const clickId = link ? await logClick(link.id, supabase, { ip, ua, referer }) : null;

  return (
    <TrackerClient
      code={code}
      targetUrl={link?.target_url ?? null}
      clickId={clickId}
    />
  );
}
