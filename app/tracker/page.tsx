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
      addToast("error", "Gagal memuat link");
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
      setTargetUrl(""); setTitle("");
      await fetchLinks();
      addToast("success", "Link dibuat");
      await navigator.clipboard.writeText(json.short_url).catch(() => {});
      addToast("info", "Link disalin ke clipboard");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Gagal membuat link");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus link ini?")) return;
    try {
      const res = await fetch(`/api/tracker/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setLinks(prev => prev.filter(l => l.id !== id));
      if (selectedLink?.id === id) setSelectedLink(null);
      addToast("success", "Link dihapus");
    } catch {
      addToast("error", "Gagal menghapus");
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
      addToast("error", "Gagal memuat klik");
    } finally {
      setLoadingClicks(false);
    }
  }

  async function copyShortUrl(id: string) {
    try {
      await navigator.clipboard.writeText(`${APP_URL}/t/${id}`);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Link Tracker</h1>
        </div>
        <div className="flex items-center gap-4">
          {userEmail && <span className="text-xs font-mono text-zinc-700 hidden sm:block">{userEmail}</span>}
          <button onClick={handleLogout} className="text-xs font-mono text-zinc-600 hover:text-red-400 transition-colors">
            Keluar
          </button>
        </div>
      </div>

      {/* Create */}
      <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-5 mb-6">
        <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Buat Link Baru</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <input
              type="url"
              value={targetUrl}
              onChange={e => { setTargetUrl(e.target.value); setUrlError(null); }}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="https://target-url.com"
              className={`w-full bg-black/50 border ${urlError ? "border-red-500/30" : "border-zinc-800 focus:border-zinc-600"} rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors font-mono`}
            />
            {urlError && <p className="text-xs text-red-400 font-mono mt-1.5 pl-1">{urlError}</p>}
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Label"
            className="sm:w-36 bg-black/50 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-40 text-black font-mono font-bold text-sm transition-all shrink-0"
          >
            {creating ? <Spinner size="sm" /> : "+"}
            {creating ? "Membuat…" : "Buat"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Links */}
        <div>
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-3">
            Link Kamu <span className="text-zinc-800">({links.length})</span>
          </p>
          {loadingLinks ? (
            <div className="flex justify-center py-14"><Spinner size="lg" /></div>
          ) : links.length === 0 ? (
            <div className="border border-zinc-800/50 rounded-xl p-10 text-center text-zinc-700 text-xs font-mono">
              belum ada link
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {links.map(link => (
                <div
                  key={link.id}
                  onClick={() => openDetail(link)}
                  className={`group rounded-xl border cursor-pointer transition-all p-4 ${
                    selectedLink?.id === link.id
                      ? "border-zinc-600 bg-zinc-800/60"
                      : "border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200 truncate">{link.title || <span className="text-zinc-600">—</span>}</p>
                      <p className="text-xs text-zinc-700 truncate mt-0.5 font-mono">{link.target_url}</p>
                    </div>
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded shrink-0">
                      {link.click_count}×
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-mono text-zinc-700 truncate flex-1">{shortUrl(link.id)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); copyShortUrl(link.id); }}
                        className="p-1.5 rounded text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(link.id); }}
                        className="p-1.5 rounded text-zinc-600 hover:text-red-400 transition-colors"
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

        {/* Click Log */}
        <div>
          {!selectedLink ? (
            <div className="border border-zinc-800/40 rounded-xl h-40 flex items-center justify-center text-zinc-700 text-xs font-mono">
              pilih link untuk lihat log
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                  Log — <span className="text-zinc-400">{selectedLink.title || selectedLink.id}</span>
                </p>
                <span className="text-xs font-mono text-zinc-700">{clicks.length} klik</span>
              </div>
              {loadingClicks ? (
                <div className="flex justify-center py-14"><Spinner size="lg" /></div>
              ) : clicks.length === 0 ? (
                <div className="border border-zinc-800/40 rounded-xl p-10 text-center text-zinc-700 text-xs font-mono">
                  belum ada klik
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
                  {clicks.map(click => <ClickRow key={click.id} click={click} />)}
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
      className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 hover:border-zinc-700 overflow-hidden cursor-pointer transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 p-3">
        <span className="text-base shrink-0">{flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-mono text-zinc-300">{click.ip ?? "—"}</span>
            <span className="text-xs text-zinc-600">{click.city ?? "?"}, {click.country ?? "?"}</span>
          </div>
          <p className="text-xs text-zinc-700 font-mono mt-0.5">
            {click.browser} · {click.os} · {new Date(click.clicked_at).toLocaleString("id-ID")}
          </p>
        </div>
        <svg className={`w-3 h-3 text-zinc-700 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-zinc-800/60 p-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
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
              <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">{label}</p>
              <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">{value ?? "—"}</p>
            </div>
          ))}
          {click.latitude && click.longitude && (
            <div className="col-span-2">
              <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">Lokasi IP</p>
              <a href={generateMapsUrl(click.latitude, click.longitude)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-zinc-400 hover:text-zinc-200 font-mono transition-colors">
                {click.latitude.toFixed(4)}, {click.longitude.toFixed(4)} → Maps ↗
              </a>
            </div>
          )}
          {click.gps_latitude && click.gps_longitude && (
            <div className="col-span-2 border-t border-zinc-800/60 pt-2.5 mt-1">
              <p className="font-mono text-[10px] text-emerald-600 uppercase tracking-widest mb-1.5">
                📍 GPS Akurat {click.gps_accuracy && <span className="text-zinc-700">(±{Math.round(click.gps_accuracy)}m)</span>}
              </p>
              <a href={generateMapsUrl(click.gps_latitude, click.gps_longitude)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-400 font-mono transition-colors mb-2">
                {click.gps_latitude.toFixed(6)}, {click.gps_longitude.toFixed(6)} <span className="text-zinc-600">→ Maps ↗</span>
              </a>
              {(click.gps_village || click.gps_district || click.gps_city || click.gps_province) && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
                  {click.gps_village && <div><p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">Kelurahan</p><p className="text-xs text-zinc-300 mt-0.5">{click.gps_village}</p></div>}
                  {click.gps_district && <div><p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">Kecamatan</p><p className="text-xs text-zinc-300 mt-0.5">{click.gps_district}</p></div>}
                  {click.gps_city && <div><p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">Kota</p><p className="text-xs text-zinc-300 mt-0.5">{click.gps_city}</p></div>}
                  {click.gps_province && <div><p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">Provinsi</p><p className="text-xs text-zinc-300 mt-0.5">{click.gps_province}</p></div>}
                </div>
              )}
              {click.gps_address && <p className="text-[10px] text-zinc-700 font-mono mt-2 leading-relaxed">{click.gps_address}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
