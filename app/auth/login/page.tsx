"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import { Spinner } from "@/components/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) { setError("Isi semua kolom"); return; }
    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email atau password salah");
      setLoading(false);
    } else {
      router.push("/tracker");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[calc(100vh-52px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest mb-2">jexk.track</p>
          <h1 className="text-xl font-semibold text-white">Masuk</h1>
        </div>

        <div className="border border-white/[0.06] bg-white/[0.02] rounded-xl p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/[0.06] text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-xs text-zinc-600 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="kamu@email.com"
                className="w-full bg-black/40 border border-white/[0.06] focus:border-violet-400/40 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-zinc-600 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/[0.06] focus:border-violet-400/40 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white font-semibold text-sm transition-all"
            >
              {loading ? <><Spinner size="sm" /> Masuk…</> : "Masuk"}
            </button>
          </div>

          <p className="text-center text-xs font-mono text-zinc-700 mt-5">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 transition-colors">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
