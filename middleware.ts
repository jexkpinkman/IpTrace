import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  const cookieMethods: CookieMethodsServer = {
    getAll() { return request.cookies.getAll(); },
    setAll(toSet) {
      toSet.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      toSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      );
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (pathname.startsWith("/tracker") && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if ((pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) && user) {
    return NextResponse.redirect(new URL("/tracker", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/tracker/:path*", "/auth/login", "/auth/register"],
};
