import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth Callback Handler
 *
 * Supabase redirects here after a successful Google OAuth flow with a `code`
 * query parameter. This route exchanges the code for a session and sets the
 * auth cookies, then redirects the user to the dashboard.
 *
 * Configure in Supabase Dashboard:
 *   Authentication → URL Configuration → Redirect URLs
 *   Add: http://localhost:3000/auth/callback  (dev)
 *       https://yourdomain.com/auth/callback  (prod)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  
  // Construct the correct origin even behind proxies (like Vercel)
  const origin = forwardedHost
    ? `https://${forwardedHost}`
    : new URL(request.url).origin;

  // Optional: `next` param allows redirecting to a specific page after login
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Session is now set via cookies; redirect to dashboard (or `next`)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — redirect to login with an error hint
  console.error("Auth callback hatası: code eksik veya geçersiz");
  return NextResponse.redirect(`${origin}/login?hata=auth`);
}
