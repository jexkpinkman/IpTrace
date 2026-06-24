export interface UAInfo {
  browser: string;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
}

export function parseUA(ua: string | null): UAInfo {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "Unknown" };

  // Browser
  let browser = "Unknown";
  if (ua.includes("Edg/"))        browser = "Edge";
  else if (ua.includes("OPR/") || ua.includes("Opera")) browser = "Opera";
  else if (ua.includes("Chrome/") && !ua.includes("Chromium")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("MSIE") || ua.includes("Trident/")) browser = "IE";

  // OS
  let os = "Unknown";
  if (ua.includes("Windows NT 10")) os = "Windows 10/11";
  else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
  else if (ua.includes("Windows"))  os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("iPhone"))   os = "iOS";
  else if (ua.includes("iPad"))     os = "iPadOS";
  else if (ua.includes("Android"))  os = "Android";
  else if (ua.includes("Linux"))    os = "Linux";

  // Device
  let device: UAInfo["device"] = "Desktop";
  if (ua.includes("iPad") || (ua.includes("Android") && !ua.includes("Mobile"))) {
    device = "Tablet";
  } else if (ua.includes("Mobile") || ua.includes("iPhone") || ua.includes("Android")) {
    device = "Mobile";
  }

  return { browser, os, device };
}
