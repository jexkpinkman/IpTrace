"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase";
import { Spinner } from "@/components/Spinner";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    if (!email || !password || !confirm) { setError("Isi semua kolom"); return; }
    if (password !== confirm) { setError("Password tidak cocok"); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter"); return; }
    setLoading(true);
    setError(null);
    const supabase = createBrowserSupabase();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${appUrl}/auth/callback` },
    });
    setLoading(false);
    if (error) { setError(error.message); } else if (data.session) { router.push("/tracker"); router.refresh(); } else { setSuccess(true); }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-5">
            <svg className="w-6 h-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Cek email kamu</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Link konfirmasi dikirim ke <span className="text-zinc-300 font-mono">{email}</span>
          </p>
          <Link href="/auth/login" className="text-sm font-mono text-zinc-600 hover:text-zinc-300 transition-colors">
            ← Kembali ke login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Daftar</h1>
          <p className="text-zinc-600 text-sm mt-1">Buat akun untuk mulai melacak</p>
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
                placeholder="Min. 6 karakter"
                className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Konfirmasi Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRegister()}
                placeholder="••••••••"
                className="w-full bg-black/60 border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white hover:bg-zinc-100 disabled:opacity-40 text-black font-mono font-bold text-sm transition-all"
            >
              {loading ? <><Spinner size="sm" /> Membuat akun…</> : "Buat Akun"}
            </button>
          </div>

          <p className="text-center text-xs font-mono text-zinc-700 mt-5">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-zinc-400 hover:text-white transition-colors">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
