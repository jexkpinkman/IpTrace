"use client";

import { useState, useEffect, useCallback } from "react";
import { IPData } from "@/types";
import { IPResultCard } from "@/components/IPResultCard";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/ToastProvider";

export default function MyIPPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<IPData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const { addToast } = useToast();

  const fetchMyIP = useCallback(
    async (isRefresh = false) => {
      setLoading(true);
      setError(null);
      if (isRefresh) setResult(null);

      try {
        const res = await fetch("/api/myip", { cache: "no-store" });
        const json = await res.json();

        if (!json.success) {
          setError(json.error || "Could not detect your IP address");
          if (isRefresh) addToast("error", "Failed to refresh IP data");
        } else {
          setResult(json.data);
          setLastFetched(new Date());
          if (isRefresh) addToast("success", "IP data refreshed");
        }
      } catch {
        const msg = "Network error — please check your connection";
        setError(msg);
        if (isRefresh) addToast("error", msg);
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    fetchMyIP();
  }, [fetchMyIP]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-in flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-400/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">My IP</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Your current public IP address and network information.
          </p>
          {lastFetched && (
            <p className="text-xs text-slate-600 mt-1">
              Last updated: {lastFetched.toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
          onClick={() => fetchMyIP(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-400/30 bg-indigo-400/10 hover:bg-indigo-400/20 text-indigo-400 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 mt-1"
        >
          <svg
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
          <div className="relative">
            <Spinner size="lg" />
            <div className="absolute inset-0 rounded-full border-2 border-indigo-400/10 animate-ping" />
          </div>
          <p className="text-sm text-slate-500 font-mono">Detecting your IP…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-400 text-sm flex items-start gap-3 animate-slide-up">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium mb-0.5">Detection Failed</p>
            <p className="text-rose-400/70 text-xs">{error}</p>
            <button
              onClick={() => fetchMyIP(true)}
              className="mt-2 text-xs text-rose-400 hover:text-rose-300 underline transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <IPResultCard data={result} />
      )}
    </div>
  );
}
