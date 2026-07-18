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
    try {
      const supabase = createBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message || "Email atau password salah");
        setLoading(false);
        return;
      }
      router.push("/tracker");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Gagal terhubung ke server. Cek koneksi internet kamu.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Masuk</h1>
          <p className="text-zinc-600 text-sm mt-1">Akses dashboard pelacak kamu</p>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/60 rounded-2xl p-6">
          {error && (
            <div className="mb-5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="kamu@email.com"
                className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-40 text-black font-mono font-bold text-sm transition-all"
            >
              {loading ? <><Spinner size="sm" /> Masuk…</> : "Masuk"}
            </button>
          </div>

          <p className="text-center text-xs font-mono text-zinc-700 mt-5">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="text-zinc-400 hover:text-white transition-colors">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
