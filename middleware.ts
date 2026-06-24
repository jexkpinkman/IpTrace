import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /tracker routes
  if (pathname.startsWith("/tracker") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect logged-in users away from auth pages
  if ((pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) && user) {
    return NextResponse.redirect(new URL("/tracker", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/tracker/:path*", "/auth/login", "/auth/register"],
};
