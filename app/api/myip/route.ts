import { NextRequest, NextResponse } from "next/server";
import { IPData, LookupResult } from "@/types";

function getClientIP(request: NextRequest): string | null {
  const cfIP = request.headers.get("cf-connecting-ip");
  if (cfIP) return cfIP;

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    return ips[0] || null;
  }

  const xRealIP = request.headers.get("x-real-ip");
  if (xRealIP) return xRealIP;

  return null;
}

export async function GET(request: NextRequest): Promise<NextResponse<LookupResult>> {
  const clientIP = getClientIP(request);

  const ipToLookup = clientIP || "";

  try {
    const url = ipToLookup
      ? `https://ipwho.is/${encodeURIComponent(ipToLookup)}`
      : "https://ipwho.is/";

    const res = await fetch(url, {
      headers: { "User-Agent": "ip-lookup-app/1.0" },
    });

    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }

    const raw = await res.json();

    if (!raw.success && raw.ip) {
      // still try to parse partial data
    } else if (!raw.success) {
      return NextResponse.json(
        { success: false, error: raw.message || "Could not detect your IP" },
        { status: 404 }
      );
    }

    const data: IPData = {
      ip: raw.ip,
      country: raw.country || "Unknown",
      countryCode: raw.country_code || "",
      city: raw.city || "Unknown",
      region: raw.region || "Unknown",
      isp: raw.connection?.isp || raw.connection?.org || "Unknown",
      asn: raw.connection?.asn ? `AS${raw.connection.asn}` : "Unknown",
      timezone: raw.timezone?.id || "Unknown",
      latitude: raw.latitude ?? 0,
      longitude: raw.longitude ?? 0,
    };

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to detect your IP";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
