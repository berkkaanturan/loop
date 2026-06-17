"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  User as UserIcon,
  Bell,
  Loader2,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CURRENCIES } from "@/lib/data";
import { useExpenses } from "@/lib/expenses-context";
export default function ProfilPage() {
  const router = useRouter();
  const { setCurrency: setGlobalCurrency } = useExpenses();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const [notificationDays, setNotificationDays] = useState("7");
  const [currency, setCurrency] = useState("TRY");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const days = data.user.user_metadata?.notification_days;
        const cur = data.user.user_metadata?.currency;
        if (days) setNotificationDays(days.toString());
        if (cur) setCurrency(cur);
      }
      setLoading(false);
    }
    // Load currency from localStorage as well (instant, no flash)
    const storedCurrency = localStorage.getItem("loop-currency");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedCurrency) setCurrency(storedCurrency);
    loadUser();
  }, []);

  const handleSignOut = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Çıkış yapılırken bir hata oluştu.");
      setLoggingOut(false);
      return;
    }
    router.push("/login");
    router.refresh();
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency);
    setGlobalCurrency(newCurrency);
    localStorage.setItem("loop-currency", newCurrency);
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        data: { currency: newCurrency },
      });
    } catch (err) {
      console.error("Para birimi güncellenemedi", err);
    }
  };

  const saveSettings = async () => {
    setSavingConfig(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          notification_days: Number(notificationDays),
        },
      });
      if (error) throw error;
      alert("Tercihler kaydedildi.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      alert(`Kaydedilirken hata: ${message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  const name =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "Kullanıcı";
  const avatarUrl = user?.user_metadata?.avatar_url;

  const isDark = theme === "dark";

  return (
    <div
      className="flex flex-col gap-6 px-4 pt-safe pb-28"
      style={{ backgroundColor: "var(--app-bg)", minHeight: "100dvh" }}
    >
      <header className="flex items-center justify-between pt-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--app-text-primary)" }}>
          Ayarlar
        </h1>
      </header>

      {/* Profil Özeti */}
      <div
        className="flex items-center gap-4 p-5 rounded-3xl border backdrop-blur-xl"
        style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
      >
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
          style={{ backgroundColor: "var(--app-input-bg)" }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <UserIcon className="h-8 w-8" style={{ color: "var(--app-text-secondary)" }} />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold" style={{ color: "var(--app-text-primary)" }}>{name}</h2>
          <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>{user?.email}</p>
        </div>
      </div>

      {/* Tema Seçimi */}
      <div
        className="flex flex-col gap-4 p-5 rounded-3xl border backdrop-blur-xl"
        style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
      >
        <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--app-text-primary)" }}>
          <Settings className="h-4 w-4" style={{ color: "var(--app-text-secondary)" }} />
          Görünüm
        </p>

        <div
          className="relative flex h-12 w-full items-center rounded-full p-1"
          style={{ backgroundColor: "var(--app-input-bg)" }}
        >
          <div className="relative flex h-full w-full">
            <motion.div
              layout
              className="absolute top-0 bottom-0 rounded-full shadow-sm"
              style={{ backgroundColor: isDark ? "var(--app-surface)" : "#ffffff" }}
              initial={false}
              animate={{ width: "50%", left: isDark ? "0%" : "50%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <motion.button
              layout
              type="button"
              onClick={() => setTheme("dark")}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "relative z-10 flex items-center justify-center gap-2 rounded-full text-sm font-medium w-1/2 h-full transition-colors",
                isDark ? "text-white" : "text-zinc-500"
              )}
            >
              <Moon className="h-4 w-4" /> Koyu
            </motion.button>
            <motion.button
              layout
              type="button"
              onClick={() => setTheme("light")}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "relative z-10 flex items-center justify-center gap-2 rounded-full text-sm font-medium w-1/2 h-full transition-colors",
                !isDark ? "text-zinc-800" : "text-zinc-500"
              )}
            >
              <Sun className="h-4 w-4" /> Açık
            </motion.button>
          </div>
        </div>
      </div>

      {/* Para Birimi */}
      <div
        className="flex flex-col gap-4 p-5 rounded-3xl border backdrop-blur-xl"
        style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
      >
        <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--app-text-primary)" }}>
          <span className="text-base leading-none">{CURRENCIES.find(c => c.code === currency)?.symbol ?? "₺"}</span>
          Para Birimi
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CURRENCIES.map((cur) => {
            const active = currency === cur.code;
            return (
              <button
                key={cur.code}
                type="button"
                onClick={() => handleCurrencyChange(cur.code)}
                className="flex h-14 items-center gap-3 rounded-2xl border px-4 transition-all active:scale-[0.98]"
                style={
                  active
                    ? { borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)" }
                    : { borderColor: "var(--app-surface-border)", backgroundColor: "var(--app-input-bg)" }
                }
              >
                <span className="text-2xl leading-none">{cur.flag}</span>
                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <span className="text-sm font-semibold" style={{ color: active ? "#818cf8" : "var(--app-text-primary)" }}>
                    {cur.symbol} {cur.code}
                  </span>
                  <span className="text-[10px] truncate w-full" style={{ color: "var(--app-text-secondary)" }}>
                    {cur.label}
                  </span>
                </div>
                {active && <Check className="ml-auto h-4 w-4 text-indigo-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tercihler */}
      <div
        className="flex flex-col gap-5 p-5 rounded-3xl border backdrop-blur-xl"
        style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
      >
        <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--app-text-primary)" }}>
          <Settings className="h-4 w-4" style={{ color: "var(--app-text-secondary)" }} />
          Tercihler
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-sm flex items-center gap-2" style={{ color: "var(--app-text-secondary)" }}>
            <Bell className="h-4 w-4" /> Ödeme Hatırlatıcı (Gün)
          </label>
          <Input
            type="number"
            inputMode="numeric"
            value={notificationDays}
            onChange={(e) => setNotificationDays(e.target.value)}
            className="h-12 rounded-xl border-0 text-sm font-medium"
            style={{
              backgroundColor: "var(--app-input-bg)",
              color: "var(--app-text-primary)",
            }}
            placeholder="Örn: 7"
          />
        </div>

        <button
          onClick={saveSettings}
          disabled={savingConfig}
          className="flex h-12 items-center justify-center rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
          style={{ backgroundColor: "var(--app-text-primary)", color: "var(--app-bg)" }}
        >
          {savingConfig ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Değişiklikleri Kaydet"
          )}
        </button>
      </div>

      {/* Çıkış — tam genişlik, kırmızı bordered, simetrik */}
      <button
        onClick={handleSignOut}
        disabled={loggingOut}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border font-semibold text-red-500 transition-all active:scale-[0.98] disabled:opacity-50"
        style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.06)" }}
      >
        {loggingOut ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <LogOut className="h-5 w-5" />
            <span>Çıkış Yap</span>
          </>
        )}
      </button>
    </div>
  );
}
