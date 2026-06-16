"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Settings,
  User as UserIcon,
  Bell,
  Wallet,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ProfilPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const [budgetLimit, setBudgetLimit] = useState("5000");
  const [notificationDays, setNotificationDays] = useState("7");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        const limit = data.user.user_metadata?.budget_limit;
        const days = data.user.user_metadata?.notification_days;
        if (limit) setBudgetLimit(limit.toString());
        if (days) setNotificationDays(days.toString());
      }
      setLoading(false);
    }
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

  const saveSettings = async () => {
    setSavingConfig(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: {
          budget_limit: Number(budgetLimit),
          notification_days: Number(notificationDays),
        },
      });
      if (error) throw error;
      alert("Ayarlar kaydedildi.");
    } catch (err: any) {
      alert(`Kaydedilirken hata: ${err.message}`);
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
              style={{ backgroundColor: isDark ? "#27272a" : "#ffffff" }}
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
            <Wallet className="h-4 w-4" /> Aylık Bütçe Limiti (₺)
          </label>
          <Input
            type="number"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            className="h-12 rounded-xl border-0 text-sm font-medium"
            style={{
              backgroundColor: "var(--app-input-bg)",
              color: "var(--app-text-primary)",
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm flex items-center gap-2" style={{ color: "var(--app-text-secondary)" }}>
            <Bell className="h-4 w-4" /> Ödeme Hatırlatıcı (Gün)
          </label>
          <Input
            type="number"
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

      {/* Çıkış */}
      <div className="px-2">
        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="flex h-12 items-center gap-2 text-red-500 font-medium transition-all active:scale-95 disabled:opacity-50 w-fit"
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
    </div>
  );
}
