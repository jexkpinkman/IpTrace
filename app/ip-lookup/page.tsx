"use client";

import { useState, useRef } from "react";
import { IPData } from "@/types";
import { validateIP } from "@/lib/utils";
import { IPResultCard } from "@/components/IPResultCard";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/ToastProvider";

export default function IPLookupPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IPData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
    if (validationError) setValidationError(null);
    if (error) setError(null);
  }

  async function handleLookup() {
    const trimmed = input.trim();
    if (!trimmed) { setValidationError("Masukkan alamat IP dulu"); inputRef.current?.focus(); return; }
    if (!validateIP(trimmed)) { setValidationError("Format IP tidak valid"); inputRef.current?.focus(); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/lookup?ip=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "IP tidak ditemukan");
        addToast("error", json.error || "Gagal");
      } else {
        setResult(json.data);
        addToast("success", `Data ditemukan`);
      }
    } catch {
      setError("Gagal terhubung ke server");
      addToast("error", "Error jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Cek IP</h1>
        <p className="text-zinc-600 text-sm">Masukkan IPv4 atau IPv6 untuk lihat lokasi dan info jaringannya.</p>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={e => e.key === "Enter" && handleLookup()}
            placeholder="8.8.8.8 atau 2001:4860:4860::8888"
            className={`w-full bg-zinc-900 border ${validationError ? "border-red-500/40" : "border-zinc-800 focus:border-zinc-600"} rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors font-mono`}
            spellCheck={false}
            autoComplete="off"
          />
          {input && (
            <button
              onClick={() => { setInput(""); setResult(null); setError(null); setValidationError(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleLookup}
          disabled={loading}
          className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-40 text-black font-mono font-bold text-sm transition-all shrink-0"
        >
          {loading ? <Spinner size="sm" /> : "Cari"}
        </button>
      </div>

      {validationError && (
        <p className="text-xs text-red-400 font-mono mb-3 pl-1">{validationError}</p>
      )}

      <div className="flex items-center gap-3 mb-8">
        <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Coba</span>
        {["8.8.8.8", "1.1.1.1", "2001:4860:4860::8888"].map(ex => (
          <button
            key={ex}
            onClick={() => { setInput(ex); setValidationError(null); setError(null); setResult(null); }}
            className="text-xs font-mono text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>

      {error && !loading && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-mono mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Spinner size="lg" />
          <p className="text-xs font-mono text-zinc-600">mencari data IP...</p>
        </div>
      )}

      {result && !loading && (
        <div className="mt-2">
          <IPResultCard data={result} />
        </div>
      )}
    </div>
  );
}
