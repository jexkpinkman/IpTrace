"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className="border-b border-white/[0.06] bg-[#080808]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/" className="shrink-0">
            <span className="font-mono text-sm font-bold text-white tracking-widest">
              JEXK<span className="text-zinc-500">.</span>TRACK
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavBtn href="/ip-lookup" active={pathname === "/ip-lookup"}>Cek IP</NavBtn>
            <NavBtn href="/my-ip" active={pathname === "/my-ip"}>IP Saya</NavBtn>
            <NavBtn href="/tracker" active={pathname.startsWith("/tracker")}>Pelacak</NavBtn>

            {user ? (
              <button
                onClick={handleLogout}
                className="ml-1 px-3 py-1.5 rounded-md text-xs font-mono font-medium text-zinc-600 hover:text-red-400 hover:bg-red-400/5 border border-transparent hover:border-red-400/10 transition-all"
              >
                Keluar
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="ml-1 px-3 py-1.5 rounded-md text-xs font-mono font-medium text-zinc-400 hover:text-white hover:bg-white/5 border border-zinc-800 hover:border-zinc-600 transition-all"
              >
                Masuk
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavBtn({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all border ${
        active
          ? "text-white bg-white/8 border-white/10"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/4 border-transparent hover:border-white/6"
      }`}
    >
      {children}
    </Link>
  );
}
