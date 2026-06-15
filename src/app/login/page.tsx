"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Google SVG icon — inline to avoid external dependency.
 * Official Google "G" logo colours.
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  // Show error toast if redirected back with ?hata=auth
  useEffect(() => {
    if (searchParams.get("hata") === "auth") {
      alert("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }, [searchParams]);

  async function handleGoogleLogin() {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          // Request offline access so Supabase can refresh the token
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google OAuth hatası:", error);
      alert("Google ile bağlantı kurulamadı. Lütfen tekrar deneyin.");
      setLoading(false);
    }
    // On success, Supabase redirects the browser to Google — no further action needed here
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* ── Ambient background glows ─────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Top-left indigo blob */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        {/* Bottom-right violet blob */}
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
        {/* Center subtle glow */}
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/8 blur-3xl" />
      </div>

      {/* ── Content card ─────────────────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">

        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-4">
          {/* Animated logo mark */}
          <div className="relative flex h-20 w-20 items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-20 blur-lg" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/30">
              {/* Loop icon — two concentric arcs */}
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                aria-hidden="true"
              >
                <path
                  d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M20 14c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeOpacity="0.6"
                />
                <circle cx="32" cy="20" r="2.5" fill="white" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              LOOP
            </h1>
            <p className="text-center text-sm text-muted-foreground leading-relaxed max-w-[220px]">
              Aylık giderlerini ve aboneliklerini tek yerden takip et.
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="flex w-full flex-col gap-2.5">
          {[
            { icon: "📊", text: "Aylık toplam gider özeti" },
            { icon: "🔔", text: "Yaklaşan ödeme bildirimleri" },
            { icon: "🔒", text: "Güvenli, yalnızca senin verilerin" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 rounded-xl bg-card px-4 py-3"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTA area */}
        <div className="flex w-full flex-col gap-4">
          <button
            id="google-login-button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white text-sm font-semibold text-zinc-900 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-zinc-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {/* Subtle shimmer effect on hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            />
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            ) : (
              <GoogleIcon className="h-5 w-5 shrink-0" />
            )}
            <span>{loading ? "Yönlendiriliyor…" : "Google ile Giriş Yap"}</span>
          </button>

          <p className="text-center text-xs text-muted-foreground/60 leading-relaxed">
            Giriş yaparak{" "}
            <span className="underline-offset-2 hover:underline cursor-pointer">
              Kullanım Koşulları
            </span>
            &apos;nı ve{" "}
            <span className="underline-offset-2 hover:underline cursor-pointer">
              Gizlilik Politikası
            </span>
            &apos;nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginContent />
    </Suspense>
  );
}
