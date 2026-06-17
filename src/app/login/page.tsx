"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, LayoutDashboard, BellRing, PieChart, ShieldCheck, MonitorSmartphone, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

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

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 384 512" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

const SWIPER_FEATURES = [
  {
    mockup: (
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        <div className="flex h-[64px] items-center gap-3 rounded-3xl p-2.5 pr-4 text-left border shadow-sm" style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}>
          <div className="h-10 w-10 shrink-0">
            <BrandLogo domain="netflix.com" name="Netflix" fallbackIcon="MonitorSmartphone" />
          </div>
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <span className="text-[14px] font-medium truncate leading-snug" style={{ color: "var(--app-text-primary)" }}>Netflix</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MonitorSmartphone className="h-[10px] w-[10px]" style={{ color: "var(--app-text-secondary)" }} />
              <span className="text-[11px] truncate" style={{ color: "var(--app-text-secondary)" }}>Dijital • Ayın 15&apos;i</span>
            </div>
          </div>
          <div className="flex items-center justify-center shrink-0">
            <span className="text-[14px] font-semibold" style={{ color: "var(--app-text-primary)" }}>₺200</span>
          </div>
        </div>
        <div className="flex h-[64px] items-center gap-3 rounded-3xl p-2.5 pr-4 text-left border shadow-sm opacity-60" style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}>
          <div className="h-10 w-10 shrink-0">
            <BrandLogo domain="spotify.com" name="Spotify" />
          </div>
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <span className="text-[14px] font-medium truncate leading-snug" style={{ color: "var(--app-text-primary)" }}>Spotify</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MonitorSmartphone className="h-[10px] w-[10px]" style={{ color: "var(--app-text-secondary)" }} />
              <span className="text-[11px] truncate" style={{ color: "var(--app-text-secondary)" }}>Dijital • Ayın 20&apos;si</span>
            </div>
          </div>
          <div className="flex items-center justify-center shrink-0">
            <span className="text-[14px] font-semibold" style={{ color: "var(--app-text-primary)" }}>₺60</span>
          </div>
        </div>
      </div>
    ),
    title: "Tek Ekranda Kontrol",
    description: "Tüm abonelik ve faturalarınızı tek bir noktadan kolayca yönetin.",
  },
  {
    mockup: (
      <div className="flex flex-col gap-2 w-full max-w-[280px]">
        <div className="flex h-[64px] items-center gap-3 rounded-3xl p-2.5 pr-4 text-left border shadow-sm" style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}>
          <div className="h-10 w-10 shrink-0">
            <BrandLogo domain="spotify.com" name="Spotify" />
          </div>
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <span className="text-[14px] font-medium truncate leading-snug" style={{ color: "var(--app-text-primary)" }}>Spotify</span>
            <span className="text-[11px] font-semibold text-orange-500 mt-0.5">2 gün sonra</span>
          </div>
          <div className="flex items-center justify-center shrink-0">
            <span className="text-[14px] font-semibold" style={{ color: "var(--app-text-primary)" }}>₺60</span>
          </div>
        </div>
        <div className="flex h-[64px] items-center gap-3 rounded-3xl p-2.5 pr-4 text-left border shadow-sm opacity-60" style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}>
          <div className="h-10 w-10 shrink-0">
            <BrandLogo domain="netflix.com" name="Netflix" />
          </div>
          <div className="flex flex-1 flex-col justify-center min-w-0">
            <span className="text-[14px] font-medium truncate leading-snug" style={{ color: "var(--app-text-secondary)" }}>Netflix</span>
            <span className="text-[11px] font-semibold text-emerald-500 mt-0.5">Ödendi</span>
          </div>
          <div className="flex items-center justify-center shrink-0">
            <Check className="h-4 w-4 text-emerald-500" />
          </div>
        </div>
      </div>
    ),
    title: "Akıllı Hatırlatıcı",
    description: "Ödeme günlerini kaçırmayın, gecikme faizlerinden kurtulun.",
  },
  {
    mockup: (
      <div className="flex flex-col gap-3 w-full max-w-[280px]">
        <div className="flex flex-col p-4 w-full rounded-3xl border shadow-sm gap-3" style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}>
           <div className="w-full flex justify-between items-end">
             <div className="flex flex-col items-start gap-1">
               <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--app-text-secondary)" }}>Kalan Bütçe</span>
               <span className="text-[18px] font-bold" style={{ color: "var(--app-text-primary)" }}>₺2.400 <span className="text-[12px] font-medium opacity-50">/ ₺5.000</span></span>
             </div>
             <PieChart className="h-7 w-7 text-indigo-500 opacity-80" />
           </div>
           <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-input-bg)" }}>
             <div className="h-full bg-indigo-500 rounded-full" style={{ width: "52%" }} />
           </div>
        </div>
      </div>
    ),
    title: "Bütçe ve Analiz",
    description: "Harcamalarınızı kategorilere göre inceleyin, bütçenizi koruyun.",
  },
  {
    mockup: (
      <div className="flex flex-col gap-2 w-full max-w-[220px] items-center justify-center">
         <div className="flex items-center justify-center h-[64px] w-[64px] rounded-[22px] border shadow-sm relative overflow-hidden mb-2" style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}>
           <ShieldCheck className="h-8 w-8 text-emerald-500 relative z-10" />
           <div className="absolute inset-0 bg-emerald-500/10" />
         </div>
         <div className="px-3 py-1.5 rounded-full border text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
           Uçtan Uca Şifreli
         </div>
      </div>
    ),
    title: "Güvenli ve Özel",
    description: "Verileriniz size özel şifrelenir, sadece siz erişebilirsiniz.",
  },
];

function LoginContent() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (searchParams.get("hata") === "auth") {
      alert("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  }, [searchParams]);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SWIPER_FEATURES.length);
    }, 4000);
  }, []);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startInterval]);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
    startInterval(); // reset timer on manual change
  }, [startInterval]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    if (info.offset.x < -50) {
      goToIndex((activeIndex + 1) % SWIPER_FEATURES.length);
    } else if (info.offset.x > 50) {
      goToIndex((activeIndex - 1 + SWIPER_FEATURES.length) % SWIPER_FEATURES.length);
    }
  };

  async function handleGoogleLogin() {
    setLoadingGoogle(true);
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
      setLoadingGoogle(false);
    }
  }

  async function handleAppleLogin() {
    alert("Yakında eklenecek!");
  }

  const isLoading = loadingGoogle || loadingApple;

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-6 pb-safe pt-8"
      style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text-primary)" }}
    >
      {/* Ambient background glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      {/* Logo */}
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

      {/* Swiper */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center justify-center min-h-[260px] mt-4">
        <div className="relative w-full h-[200px] flex items-center justify-center">
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
              <div className="flex h-[110px] items-center justify-center mb-4 w-full">
                {SWIPER_FEATURES[activeIndex].mockup}
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
              onClick={() => goToIndex(i)}
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

      {/* CTA Buttons */}
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-3 mb-10">
        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="group relative flex h-[56px] w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] shadow-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-70"
          style={{ backgroundColor: "var(--app-text-primary)", color: "var(--app-bg)" }}
        >
          {loadingGoogle ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <GoogleIcon className="h-[18px] w-[18px] shrink-0" />
            </div>
          )}
          <span className="font-semibold text-[15px]">
            {loadingGoogle ? "Yönlendiriliyor…" : "Google ile Devam Et"}
          </span>
        </button>

        {/* Apple */}
        <button
          onClick={handleAppleLogin}
          disabled={isLoading}
          className="group relative flex h-[56px] w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] border transition-all duration-200 active:scale-[0.97] disabled:opacity-70"
          style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)", color: "var(--app-text-primary)" }}
        >
          {loadingApple ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <AppleIcon className="h-6 w-6 shrink-0" />
          )}
          <span className="font-semibold text-[15px]">
            {loadingApple ? "Yönlendiriliyor…" : "Apple ile Devam Et"}
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
