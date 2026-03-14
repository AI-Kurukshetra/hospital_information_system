import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./lib/supabase/env";

export async function middleware(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the session — do not add logic between createServerClient and
  // getUser(); a stale session could prevent the redirect from working.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // Unauthenticated users trying to reach a protected route → login
  if (!user && !isAuthRoute && pathname !== "/auth/callback") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated users hitting auth routes → home
  if (user && isAuthRoute) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
