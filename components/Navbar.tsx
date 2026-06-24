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
      <div className="border-b border-white/[0.04] bg-black/60 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-13">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="font-mono text-sm font-semibold text-white tracking-widest uppercase">
              jexk<span className="text-violet-400">.</span>track
            </span>
          </Link>

          <nav className="flex items-center gap-0.5">
            <NavLink href="/ip-lookup" active={pathname === "/ip-lookup"}>Cek IP</NavLink>
            <NavLink href="/my-ip" active={pathname === "/my-ip"}>IP Saya</NavLink>
            <NavLink href="/tracker" active={pathname.startsWith("/tracker")}>Pelacak</NavLink>

            {user ? (
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1.5 text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors tracking-wider uppercase"
              >
                Keluar
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="ml-2 px-3 py-1.5 text-xs font-mono text-zinc-500 hover:text-white transition-colors tracking-wider uppercase"
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

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors ${
        active ? "text-violet-400" : "text-zinc-500 hover:text-zinc-200"
      }`}
    >
      {children}
    </Link>
  );
}
