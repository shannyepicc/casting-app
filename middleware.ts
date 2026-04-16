import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Protect authenticated routes
  const protectedPaths = ["/profile", "/onboarding", "/home", "/opportunities", "/talent", "/shortlist", "/dashboard"];
  if (!user && protectedPaths.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages → /home
  if (user && (path === "/auth/login" || path === "/auth/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Redirect old /dashboard and /discovery to new routes for logged-in users
  if (user && path === "/dashboard") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/onboarding/:path*",
    "/auth/login",
    "/auth/signup",
    "/home",
    "/opportunities",
    "/talent",
    "/shortlist",
    "/dashboard",
  ],
};
