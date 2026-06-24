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

  // Detail modal
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
      addToast("error", "Failed to load links");
    } finally {
      setLoadingLinks(false);
    }
  }, [addToast]);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  async function handleCreate() {
    setUrlError(null);
    if (!targetUrl.trim()) { setUrlError("Enter a destination URL"); return; }
    try { new URL(targetUrl.trim()); } catch { setUrlError("Invalid URL — include https://"); return; }

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
      addToast("success", "Tracking link created!");

      // Auto copy
      await navigator.clipboard.writeText(json.short_url).catch(() => {});
      addToast("info", "Short link copied to clipboard");
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tracking link and all its click data?")) return;
    try {
      const res = await fetch(`/api/tracker/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setLinks(prev => prev.filter(l => l.id !== id));
      if (selectedLink?.id === id) setSelectedLink(null);
      addToast("success", "Link deleted");
    } catch {
      addToast("error", "Failed to delete link");
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
      addToast("error", "Failed to load click data");
    } finally {
      setLoadingClicks(false);
    }
  }

  async function copyShortUrl(id: string) {
    const url = `${APP_URL}/t/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      addToast("success", "Copied to clipboard!");
    } catch {
      addToast("error", "Failed to copy");
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
          <h1 className="font-display text-2xl font-bold text-white mb-1">Link Tracker</h1>
          <p className="text-slate-500 text-sm">Track who clicks your links — IP, location, device</p>
        </div>
        <div className="flex items-center gap-3">
          {userEmail && <span className="text-xs text-slate-500 hidden sm:block">{userEmail}</span>}
          <button onClick={handleLogout} className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Create Form */}
      <div className="rounded-2xl border border-white/8 bg-navy-800/50 backdrop-blur-sm p-5 mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">New Tracking Link</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <input
              type="url"
              value={targetUrl}
              onChange={e => { setTargetUrl(e.target.value); setUrlError(null); }}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="https://destination-url.com"
              className={`w-full bg-navy-900/60 border ${urlError ? "border-rose-500/50" : "border-white/8 focus:border-sky-400/50"} rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors font-mono`}
            />
            {urlError && <p className="text-xs text-rose-400 mt-1.5 pl-1">{urlError}</p>}
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Label (optional)"
            className="sm:w-44 bg-navy-900/60 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-sky-400/50 transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-navy-900 font-display font-semibold text-sm transition-all shrink-0"
          >
            {creating ? <><Spinner size="sm" />Creating…</> : <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create
            </>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Links List */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Your Links ({links.length})</p>
          {loadingLinks ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : links.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-navy-800/30 p-10 text-center text-slate-600 text-sm">
              No tracking links yet. Create one above.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {links.map(link => (
                <div
                  key={link.id}
                  onClick={() => openDetail(link)}
                  className={`group rounded-xl border cursor-pointer transition-all p-4 ${selectedLink?.id === link.id ? "border-sky-400/40 bg-sky-400/5" : "border-white/6 bg-navy-800/40 hover:border-white/12 hover:bg-navy-800/60"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200 truncate">{link.title || "Untitled"}</p>
                      <p className="text-xs text-slate-600 truncate mt-0.5 font-mono">{link.target_url}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-mono text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded-lg">
                        {link.click_count} clicks
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs font-mono text-slate-500 truncate flex-1">{shortUrl(link.id)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); copyShortUrl(link.id); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 transition-all"
                        title="Copy short URL"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(link.id); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                        title="Delete link"
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
            <div className="rounded-2xl border border-white/5 bg-navy-800/20 h-64 flex items-center justify-center text-slate-700 text-sm">
              Select a link to view click logs
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Click Logs — <span className="text-sky-400">{selectedLink.title || selectedLink.id}</span>
                </p>
                <span className="text-xs text-slate-600">{clicks.length} records</span>
              </div>

              {loadingClicks ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
              ) : clicks.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-navy-800/20 p-10 text-center text-slate-600 text-sm">
                  No clicks yet. Share your tracking link!
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

  const deviceIcon = {
    Mobile: "📱",
    Tablet: "📟",
    Desktop: "💻",
    Unknown: "❓",
  }[click.device ?? "Unknown"] ?? "❓";

  return (
    <div
      className="rounded-xl border border-white/6 bg-navy-800/40 overflow-hidden cursor-pointer hover:border-white/10 transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 p-3">
        <span className="text-base shrink-0">{flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-slate-300">{click.ip ?? "—"}</span>
            <span className="text-xs text-slate-600">{click.city ?? "?"}, {click.country ?? "?"}</span>
          </div>
          <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
            <span>{deviceIcon} {click.device}</span>
            <span>·</span>
            <span>{click.browser} / {click.os}</span>
            <span>·</span>
            <span>{new Date(click.clicked_at).toLocaleString()}</span>
          </div>
        </div>
        <svg className={`w-3.5 h-3.5 text-slate-600 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-white/5 p-3 grid grid-cols-2 gap-x-4 gap-y-1.5 animate-fade-in">
          {[
            ["IP", click.ip],
            ["Country", `${flag} ${click.country}`],
            ["City", click.city],
            ["Region", click.region],
            ["ISP", click.isp],
            ["ASN", click.asn],
            ["Timezone", click.timezone],
            ["Browser", click.browser],
            ["OS", click.os],
            ["Device", click.device],
            ["Referer", click.referer || "Direct"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-slate-600">{label}</p>
              <p className="text-xs text-slate-300 font-mono truncate">{value ?? "—"}</p>
            </div>
          ))}
          {click.latitude && click.longitude && (
            <div className="col-span-2">
              <p className="text-xs text-slate-600">Location</p>
              <a
                href={generateMapsUrl(click.latitude, click.longitude)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-sky-400 hover:text-sky-300 font-mono transition-colors"
              >
                {click.latitude.toFixed(4)}, {click.longitude.toFixed(4)} → Maps ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
