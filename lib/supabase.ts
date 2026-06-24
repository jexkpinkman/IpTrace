import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { CookieMethodsServer } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createBrowserSupabase() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export async function createServerSupabase() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() { return cookieStore.getAll(); },
    setAll(toSet) {
      try {
        toSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      } catch { /* read-only context */ }
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}

export function createServiceSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
