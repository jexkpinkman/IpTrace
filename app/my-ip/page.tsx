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

  const fetchMyIP = useCallback(async (isRefresh = false) => {
    setLoading(true);
    setError(null);
    if (isRefresh) setResult(null);
    try {
      const res = await fetch("/api/myip", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Gagal mendeteksi IP");
        if (isRefresh) addToast("error", "Gagal memperbarui");
      } else {
        setResult(json.data);
        setLastFetched(new Date());
        if (isRefresh) addToast("success", "Diperbarui");
      }
    } catch {
      setError("Gagal terhubung ke server");
      if (isRefresh) addToast("error", "Error jaringan");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchMyIP(); }, [fetchMyIP]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">IP Saya</h1>
          <p className="text-zinc-600 text-sm">
            IP publik dan info jaringan kamu saat ini.
            {lastFetched && <span className="text-zinc-700 ml-2 font-mono text-xs">{lastFetched.toLocaleTimeString("id-ID")}</span>}
          </p>
        </div>
        <button
          onClick={() => fetchMyIP(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-mono font-medium transition-all disabled:opacity-40 shrink-0 mt-1"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Memuat…" : "Refresh"}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-20">
          <Spinner size="lg" />
          <p className="text-xs font-mono text-zinc-600">mendeteksi IP kamu...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-mono mb-6">
          {error}
          <button onClick={() => fetchMyIP(true)} className="block mt-2 text-xs text-zinc-600 hover:text-zinc-400 underline transition-colors">Coba lagi</button>
        </div>
      )}

      {result && !loading && <IPResultCard data={result} />}
    </div>
  );
}
