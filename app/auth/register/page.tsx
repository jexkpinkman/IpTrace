"use client";

import { useState } from "react";
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
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    if (!email || !password || !confirm) { setError("Isi semua kolom terlebih dahulu"); return; }
    if (password !== confirm) { setError("Password tidak cocok"); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter"); return; }

    setLoading(true);
    setError(null);

    const supabase = createBrowserSupabase();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${appUrl}/auth/callback` },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">Cek email kamu</h2>
          <p className="text-slate-400 text-sm mb-6">Kami kirim link konfirmasi ke <span className="text-sky-400">{email}</span>. Klik link tersebut untuk mengaktifkan akun.</p>
          <Link href="/auth/login" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
            Kembali ke halaman masuk →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="rounded-2xl border border-white/8 bg-navy-800/60 backdrop-blur-sm p-8">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="font-display text-xl font-bold text-white">Buat akun</h1>
            <p className="text-slate-500 text-sm mt-1">Mulai lacak link kamu</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/8 text-rose-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="kamu@email.com"
                className="w-full bg-navy-900/60 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="w-full bg-navy-900/60 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-400/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Konfirmasi Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRegister()}
                placeholder="••••••••"
                className="w-full bg-navy-900/60 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-400/50 transition-colors"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 disabled:opacity-50 text-white font-display font-semibold text-sm transition-all"
            >
              {loading ? <><Spinner size="sm" /> Membuat akun…</> : "Buat Akun"}
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Sudah punya akun?{" "}
            <Link href="/auth/login" className="text-sky-400 hover:text-sky-300 transition-colors">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
