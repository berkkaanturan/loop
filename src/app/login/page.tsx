"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, LayoutDashboard, BellRing, PieChart, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Google SVG icon — inline to avoid external dependency.
 * Official Google "G" logo.
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const SWIPER_FEATURES = [
  {
    icon: LayoutDashboard,
    title: "Tek Ekranda Kontrol",
    description: "Tüm abonelik ve faturalarınızı tek bir noktadan kolayca yönetin.",
  },
  {
    icon: BellRing,
    title: "Akıllı Hatırlatıcı",
    description: "Ödeme günlerini kaçırmayın, gecikme faizlerinden kurtulun.",
  },
  {
    icon: PieChart,
    title: "Bütçe ve Analiz",
    description: "Harcamalarınızı kategorilere göre inceleyin, bütçenizi koruyun.",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli ve Özel",
    description: "Verileriniz size özel şifrelenir, sadece siz erişebilirsiniz.",
  },
];

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);

  // Show error toast if redirected back with ?hata=auth
  useEffect(() => {
    if (searchParams.get("hata") === "auth") {
      alert("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }, [searchParams]);

  // Auto-advance swiper
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SWIPER_FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -50) {
      setActiveIndex((prev) => (prev + 1) % SWIPER_FEATURES.length);
    } else if (info.offset.x > 50) {
      setActiveIndex((prev) => (prev - 1 + SWIPER_FEATURES.length) % SWIPER_FEATURES.length);
    }
  };

  async function handleGoogleLogin() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });

    if (error) {
      console.error("Google OAuth hatası:", error);
      alert("Google ile bağlantı kurulamadı. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-6 pb-safe pt-8"
      style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text-primary)" }}
    >
      {/* ── Ambient background glows ─────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      {/* ── Top section: Logo ────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm mt-24">
        <div className="relative flex h-[120px] w-[120px] items-center justify-center">
          <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-20 blur-xl" />
          <div className="relative flex h-full w-full items-center justify-center rounded-[40px] bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-2xl">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[88px] w-[88px]">
              <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M20 14c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
              <circle cx="32" cy="20" r="2.5" fill="white" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-[32px] font-bold tracking-tight">LOOP</h1>
        </div>
      </div>

      {/* ── Middle section: Swiper ───────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center justify-center min-h-[220px]">
        <div className="relative w-full h-[160px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 flex flex-col items-center text-center justify-center px-4 cursor-grab active:cursor-grabbing"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-[24px] mb-5 backdrop-blur-xl border shadow-sm"
                style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
              >
                {(() => {
                  const Icon = SWIPER_FEATURES[activeIndex].icon;
                  return <Icon className="h-7 w-7" style={{ color: "var(--app-text-primary)" }} strokeWidth={1.5} />;
                })()}
              </div>
              <h2 className="text-xl font-bold mb-2">
                {SWIPER_FEATURES[activeIndex].title}
              </h2>
              <p className="text-[15px] leading-relaxed max-w-[280px]" style={{ color: "var(--app-text-secondary)" }}>
                {SWIPER_FEATURES[activeIndex].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center gap-2 mt-6">
          {SWIPER_FEATURES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex ? "w-6 bg-indigo-500" : "w-1.5"
              )}
              style={i !== activeIndex ? { backgroundColor: "var(--app-surface-border)" } : {}}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom section: CTA ──────────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-5 mb-10">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="group relative flex h-[56px] w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] shadow-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-70"
          style={{ backgroundColor: "var(--app-text-primary)", color: "var(--app-bg)" }}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <GoogleIcon className="h-[18px] w-[18px] shrink-0" />
            </div>
          )}
          <span className="font-semibold text-[15px]">
            {loading ? "Yönlendiriliyor…" : "Google ile Devam Et"}
          </span>
        </button>

        <p className="text-center text-[11px] leading-relaxed px-4" style={{ color: "var(--app-text-secondary)" }}>
          Giriş yaparak{" "}
          <span className="font-medium underline underline-offset-2">Kullanım Koşulları</span>
          &apos;nı ve{" "}
          <span className="font-medium underline underline-offset-2">Gizlilik Politikası</span>
          &apos;nı kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}
