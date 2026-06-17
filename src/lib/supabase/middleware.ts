import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Routes that do NOT require authentication.
 * The middleware will allow these through without a session check.
 */
const PUBLIC_ROUTES = ["/login", "/auth/callback", "/onboarding"];

/**
 * Middleware-aware Supabase client.
 * Refreshes the auth session on every request and forwards updated
 * cookies to both the server response and the upstream supabase call.
 */
export async function updateSession(request: NextRequest) {
  // Start with a plain "pass-through" response we can mutate
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Set on the *request* so the session is visible in this request cycle
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // Rebuild the response with the updated cookies
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
    cookieOptions: {
      maxAge: 31536000,
    },
  });

  // IMPORTANT: getUser() must be called to refresh the token.
  // Never use getSession() in middleware — it does not re-validate the JWT.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // ── Redirect unauthenticated users to /login ──────────────────────────────
  if (!user && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // ── Handle Onboarding Flow for Authenticated Users ────────────────────────
  if (user) {
    const onboardingCompleted = user.user_metadata?.onboarding_completed === true;

    // 1. Logged in, onboarding NOT completed, trying to access a restricted page (not onboarding/callback)
    if (!onboardingCompleted && pathname !== "/onboarding" && pathname !== "/auth/callback") {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = "/onboarding";
      return NextResponse.redirect(onboardingUrl);
    }

    // 2. Logged in, onboarding completed, trying to access /onboarding
    if (onboardingCompleted && pathname === "/onboarding") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
    
    // 3. Logged in, trying to access /login
    if (pathname === "/login") {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }
  }

  return supabaseResponse;
}
