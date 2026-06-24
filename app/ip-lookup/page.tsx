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
    if (!trimmed) { setValidationError("Masukkan alamat IP terlebih dahulu"); inputRef.current?.focus(); return; }
    if (!validateIP(trimmed)) { setValidationError("Format IPv4 atau IPv6 tidak valid"); inputRef.current?.focus(); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/lookup?ip=${encodeURIComponent(trimmed)}`);
      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Gagal mencari informasi IP ini");
        addToast("error", json.error || "Pencarian gagal");
      } else {
        setResult(json.data);
        addToast("success", `Data ditemukan untuk ${json.data.ip}`);
      }
    } catch {
      const msg = "Error jaringan — periksa koneksi internet kamu";
      setError(msg);
      addToast("error", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Cek IP</h1>
        </div>
        <p className="text-slate-500 text-sm">Masukkan alamat IPv4 atau IPv6 untuk mendapatkan data geolokasi dan jaringan.</p>
      </div>

      <div className="animate-slide-up">
        <div className="relative">
          <div className={`flex items-center gap-3 rounded-2xl border ${validationError ? "border-rose-500/50 bg-rose-500/5" : "border-white/10 bg-navy-800/60 focus-within:border-sky-400/50 focus-within:bg-navy-800/80"} backdrop-blur-sm transition-all p-1.5`}>
            <div className="pl-3 text-slate-500 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={e => e.key === "Enter" && handleLookup()}
              placeholder="cth. 8.8.8.8 atau 2001:4860:4860::8888"
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 text-sm font-mono outline-none py-2.5 min-w-0"
              spellCheck={false}
              autoComplete="off"
            />
            {input && (
              <button onClick={() => { setInput(""); setResult(null); setError(null); setValidationError(null); }} className="text-slate-600 hover:text-slate-400 transition-colors px-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={handleLookup}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 active:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 font-display font-semibold text-sm transition-all shrink-0"
            >
              {loading ? <><Spinner size="sm" /><span>Mencari…</span></> : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><span>Cari</span></>}
            </button>
          </div>
          {validationError && (
            <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 pl-2">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {validationError}
            </p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-slate-600">Coba:</span>
          {["8.8.8.8", "1.1.1.1", "2001:4860:4860::8888"].map(example => (
            <button key={example} onClick={() => { setInput(example); setValidationError(null); setError(null); setResult(null); }} className="text-xs font-mono text-slate-500 hover:text-sky-400 transition-colors">{example}</button>
          ))}
        </div>
      </div>

      {error && !loading && (
        <div className="mt-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-400 text-sm flex items-start gap-3 animate-slide-up">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="font-medium mb-0.5">Pencarian Gagal</p>
            <p className="text-rose-400/70 text-xs">{error}</p>
          </div>
        </div>
      )}

      {result && !loading && <div className="mt-8"><IPResultCard data={result} /></div>}
      {loading && (
        <div className="mt-8 flex flex-col items-center justify-center gap-4 py-16 animate-fade-in">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500 font-mono">Mencari informasi IP…</p>
        </div>
      )}
    </div>
  );
}
