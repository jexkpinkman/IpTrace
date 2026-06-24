"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { TrackerLink, TrackerClick } from "@/types/tracker";
import { Spinner } from "@/components/Spinner";
import { useToast } from "@/components/ToastProvider";
import { getFlagEmoji, generateMapsUrl } from "@/lib/utils";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

export default function TrackerDashboard() {
  const router = useRouter();
  const { addToast } = useToast();

  const [links, setLinks] = useState<TrackerLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [creating, setCreating] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const [title, setTitle] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const [selectedLink, setSelectedLink] = useState<TrackerLink | null>(null);
  const [clicks, setClicks] = useState<TrackerClick[]>([]);
  const [loadingClicks, setLoadingClicks] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    })();
  }, []);

  const fetchLinks = useCallback(async () => {
    setLoadingLinks(true);
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("tracker_links")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setLinks(data ?? []);
    } catch {
      addToast("error", "Gagal memuat daftar link");
    } finally {
      setLoadingLinks(false);
    }
  }, [addToast]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  async function handleCreate() {
    setUrlError(null);
    if (!targetUrl.trim()) { setUrlError("Masukkan URL tujuan"); return; }
    try { new URL(targetUrl.trim()); } catch { setUrlError("URL tidak valid — pastikan ada https://"); return; }

    setCreating(true);
    try {
      const res = await fetch("/api/tracker/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_url: targetUrl.trim(), title: title.trim() || undefined }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setTargetUrl("");
      setTitle("");
      await fetchLinks();
      addToast("success", "Link berhasil dibuat");

      await navigator.clipboard.writeText(json.short_url).catch(() => {});
      addToast("info", "Disalin ke clipboard");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Gagal membuat link");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus link ini beserta semua data kliknya?")) return;
    try {
      const res = await fetch(`/api/tracker/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setLinks(prev => prev.filter(l => l.id !== id));
      if (selectedLink?.id === id) setSelectedLink(null);
      addToast("success", "Link dihapus");
    } catch {
      addToast("error", "Gagal menghapus link");
    }
  }

  async function openDetail(link: TrackerLink) {
    setSelectedLink(link);
    setLoadingClicks(true);
    setClicks([]);
    try {
      const res = await fetch(`/api/tracker/${link.id}/clicks`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setClicks(json.clicks ?? []);
    } catch {
      addToast("error", "Gagal memuat data klik");
    } finally {
      setLoadingClicks(false);
    }
  }

  async function copyShortUrl(id: string) {
    const url = `${APP_URL}/t/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      addToast("success", "Link disalin");
    } catch {
      addToast("error", "Gagal menyalin");
    }
  }

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const shortUrl = (id: string) => `${APP_URL}/t/${id}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest mb-1">jexk.track</p>
          <h1 className="text-xl font-semibold text-white">Link Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
          {userEmail && <span className="text-xs font-mono text-zinc-600 hidden sm:block">{userEmail}</span>}
          <button
            onClick={handleLogout}
            className="text-xs font-mono text-zinc-600 hover:text-red-400 transition-colors uppercase tracking-wider"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Create Form */}
      <div className="border border-white/[0.06] bg-white/[0.02] rounded-xl p-5 mb-8">
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest mb-4">Buat Link Baru</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <input
              type="url"
              value={targetUrl}
              onChange={e => { setTargetUrl(e.target.value); setUrlError(null); }}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="https://target-url.com"
              className={`w-full bg-black/40 border ${urlError ? "border-red-500/40" : "border-white/[0.06] focus:border-violet-400/40"} rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors font-mono`}
            />
            {urlError && <p className="text-xs text-red-400 mt-1.5 pl-1 font-mono">{urlError}</p>}
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Label (opsional)"
            className="sm:w-40 bg-black/40 border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none focus:border-violet-400/40 transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white font-semibold text-sm transition-all shrink-0"
          >
            {creating ? <Spinner size="sm" /> : "+"}
            {creating ? "Membuat…" : "Buat"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Links List */}
        <div>
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest mb-3">
            Link Kamu <span className="text-zinc-700">({links.length})</span>
          </p>
          {loadingLinks ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : links.length === 0 ? (
            <div className="border border-white/[0.04] rounded-xl p-10 text-center text-zinc-700 text-sm">
              Belum ada link. Buat satu di atas.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {links.map(link => (
                <div
                  key={link.id}
                  onClick={() => openDetail(link)}
                  className={`group rounded-xl border cursor-pointer transition-all p-4 ${
                    selectedLink?.id === link.id
                      ? "border-violet-400/30 bg-violet-400/[0.04]"
                      : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-300 truncate">{link.title || "—"}</p>
                      <p className="text-xs text-zinc-700 truncate mt-0.5 font-mono">{link.target_url}</p>
                    </div>
                    <span className="text-xs font-mono text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded shrink-0">
                      {link.click_count}×
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-mono text-zinc-700 truncate flex-1">{shortUrl(link.id)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); copyShortUrl(link.id); }}
                        className="p-1.5 rounded text-zinc-600 hover:text-violet-400 transition-colors"
                        title="Salin link"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(link.id); }}
                        className="p-1.5 rounded text-zinc-600 hover:text-red-400 transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Click Detail Panel */}
        <div>
          {!selectedLink ? (
            <div className="border border-white/[0.04] rounded-xl h-48 flex items-center justify-center text-zinc-700 text-xs font-mono">
              pilih link untuk lihat log
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
                  Log — <span className="text-violet-400">{selectedLink.title || selectedLink.id}</span>
                </p>
                <span className="text-xs font-mono text-zinc-700">{clicks.length} data</span>
              </div>

              {loadingClicks ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
              ) : clicks.length === 0 ? (
                <div className="border border-white/[0.04] rounded-xl p-10 text-center text-zinc-700 text-xs font-mono">
                  belum ada klik
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
                  {clicks.map(click => (
                    <ClickRow key={click.id} click={click} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClickRow({ click }: { click: TrackerClick }) {
  const [expanded, setExpanded] = useState(false);
  const flag = click.country_code ? getFlagEmoji(click.country_code) : "🌐";

  return (
    <div
      className="rounded-xl border border-white/[0.05] bg-white/[0.02] overflow-hidden cursor-pointer hover:border-white/[0.08] transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 p-3">
        <span className="text-base shrink-0">{flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-zinc-300">{click.ip ?? "—"}</span>
            <span className="text-xs text-zinc-600">{click.city ?? "?"}, {click.country ?? "?"}</span>
          </div>
          <div className="text-xs text-zinc-700 mt-0.5 font-mono">
            {click.browser} · {click.os} · {new Date(click.clicked_at).toLocaleString("id-ID")}
          </div>
        </div>
        <svg className={`w-3 h-3 text-zinc-700 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.04] p-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {[
            ["IP", click.ip],
            ["Negara", `${flag} ${click.country}`],
            ["Kota", click.city],
            ["Provinsi", click.region],
            ["ISP", click.isp],
            ["ASN", click.asn],
            ["Timezone", click.timezone],
            ["Browser", click.browser],
            ["OS", click.os],
            ["Perangkat", click.device],
            ["Referer", click.referer || "Langsung"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-zinc-700 font-mono">{label}</p>
              <p className="text-xs text-zinc-400 font-mono truncate">{value ?? "—"}</p>
            </div>
          ))}
          {click.latitude && click.longitude && (
            <div className="col-span-2">
              <p className="text-xs text-zinc-700 font-mono">Lokasi IP</p>
              <a
                href={generateMapsUrl(click.latitude, click.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-violet-400 hover:text-violet-300 font-mono transition-colors"
              >
                {click.latitude.toFixed(4)}, {click.longitude.toFixed(4)} → Maps ↗
              </a>
            </div>
          )}
          {click.gps_latitude && click.gps_longitude && (
            <div className="col-span-2">
              <p className="text-xs text-zinc-700 font-mono">
                📍 GPS Akurat
                {click.gps_accuracy && <span className="text-zinc-700 ml-1">(±{Math.round(click.gps_accuracy)}m)</span>}
              </p>
              <a
                href={generateMapsUrl(click.gps_latitude, click.gps_longitude)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
              >
                {click.gps_latitude.toFixed(6)}, {click.gps_longitude.toFixed(6)} → Maps ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
