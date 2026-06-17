"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Check, Moon, Sun } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CURRENCIES } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/lib/expenses-context";

export default function OnboardingPage() {
  const router = useRouter();
  const { setCurrency } = useExpenses();
  const [selectedCurrency, setSelectedCurrency] = useState<string>("TRY");
  const [selectedTheme, setSelectedTheme] = useState<"dark" | "light">("dark");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Read current theme from html class if available
    const isLight = document.documentElement.classList.contains("light");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTheme(isLight ? "light" : "dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  const handleThemeSelect = (theme: "dark" | "light") => {
    setSelectedTheme(theme);
    // Preview theme instantly
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    html.classList.toggle("light", theme === "light");
  };

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save to user_metadata
        await supabase.auth.updateUser({
          data: {
            currency: selectedCurrency,
            theme: selectedTheme,
            onboarding_completed: true,
          }
        });

        // Save preferences to local storage so other contexts pick it up
        localStorage.setItem("loop-currency", selectedCurrency);
        localStorage.setItem("loop-theme", selectedTheme);
        
        // Update context
        setCurrency(selectedCurrency);

        router.push("/");
      }
    } catch (error) {
      console.error("Onboarding kayıt hatası:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="flex min-h-[100dvh] flex-col items-center px-6 pt-16 pb-safe overflow-y-auto" style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text-primary)" }}>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px]" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col gap-10 z-10 min-h-[85vh]"
      >
        <div className="text-center flex flex-col gap-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="h-16 w-16 bg-indigo-500/20 rounded-[20px] flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-2xl">👋</span>
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">Hoş Geldiniz!</h1>
          <p className="text-[15px]" style={{ color: "var(--app-text-secondary)" }}>
            Loop deneyiminizi kişiselleştirmek için birkaç küçük ayar yapalım.
          </p>
        </div>

        {/* Currency Selection */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--app-text-secondary)" }}>
            1. Para Birimi
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CURRENCIES.map((cur) => {
              const isSelected = selectedCurrency === cur.code;
              return (
                <button
                  key={cur.code}
                  onClick={() => setSelectedCurrency(cur.code)}
                  className={cn(
                    "flex flex-col items-start gap-3 p-4 rounded-3xl border transition-all active:scale-[0.98]",
                    isSelected ? "ring-2 ring-indigo-500" : "hover:border-indigo-500/50"
                  )}
                  style={{ 
                    backgroundColor: isSelected ? "var(--app-surface)" : "var(--app-card-bg)",
                    borderColor: isSelected ? "transparent" : "var(--app-surface-border)" 
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xl">{cur.flag}</span>
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
                      isSelected ? "bg-indigo-500 text-white" : "border"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-base font-semibold">{cur.code}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--app-text-secondary)" }}>{cur.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--app-text-secondary)" }}>
            2. Görünüm (Tema)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleThemeSelect("dark")}
              className={cn(
                "flex flex-col items-start gap-3 p-4 rounded-3xl border transition-all active:scale-[0.98]",
                selectedTheme === "dark" ? "ring-2 ring-indigo-500" : "hover:border-indigo-500/50"
              )}
              style={{ 
                backgroundColor: selectedTheme === "dark" ? "var(--app-surface)" : "var(--app-card-bg)",
                borderColor: selectedTheme === "dark" ? "transparent" : "var(--app-surface-border)" 
              }}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-100">
                  <Moon className="h-5 w-5" />
                </div>
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
                  selectedTheme === "dark" ? "bg-indigo-500 text-white" : "border"
                )}>
                  {selectedTheme === "dark" && <Check className="h-3 w-3" />}
                </div>
              </div>
              <span className="text-sm font-semibold">Koyu Tema</span>
            </button>

            <button
              onClick={() => handleThemeSelect("light")}
              className={cn(
                "flex flex-col items-start gap-3 p-4 rounded-3xl border transition-all active:scale-[0.98]",
                selectedTheme === "light" ? "ring-2 ring-indigo-500" : "hover:border-indigo-500/50"
              )}
              style={{ 
                backgroundColor: selectedTheme === "light" ? "var(--app-surface)" : "var(--app-card-bg)",
                borderColor: selectedTheme === "light" ? "transparent" : "var(--app-surface-border)" 
              }}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-900 shadow-sm">
                  <Sun className="h-5 w-5" />
                </div>
                <div className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
                  selectedTheme === "light" ? "bg-indigo-500 text-white" : "border"
                )}>
                  {selectedTheme === "light" && <Check className="h-3 w-3" />}
                </div>
              </div>
              <span className="text-sm font-semibold">Açık Tema</span>
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="sticky bottom-4 w-full mt-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="group relative flex h-[56px] w-full items-center justify-center gap-2 overflow-hidden rounded-[20px] shadow-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-70 bg-indigo-500 text-white"
          >
            <AnimatePresence mode="wait">
              {isSaving ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </motion.div>
              ) : (
                <motion.div key="text" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className="font-bold text-[15px]">Kaydet ve Başla</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
