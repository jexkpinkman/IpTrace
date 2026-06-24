import { NextRequest, NextResponse } from "next/server";
import { IPData, LookupResult } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<LookupResult>> {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip");

  if (!ip) {
    return NextResponse.json({ success: false, error: "IP address is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: { "User-Agent": "ip-lookup-app/1.0" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }

    const raw = await res.json();

    if (!raw.success) {
      return NextResponse.json(
        { success: false, error: raw.message || "IP address not found or invalid" },
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
    const message = err instanceof Error ? err.message : "Failed to fetch IP data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
