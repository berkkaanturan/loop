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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Local state for settings
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
    console.log("Başarıyla çıkış yapıldı.");
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
        }
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

  return (
    <div className="flex flex-col gap-6 px-4 pt-safe pb-32 min-h-screen bg-black">
      <header className="flex items-center justify-between pt-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Ayarlar</h1>
      </header>

      {/* Profil Özeti */}
      <Card className="border border-white/5 bg-zinc-900/60 rounded-3xl">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-800">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="h-8 w-8 text-zinc-400" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-white">{name}</h2>
            <p className="text-sm text-zinc-400">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Tercihler */}
      <Card className="border border-white/5 bg-zinc-900/60 rounded-3xl">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            <Settings className="h-4 w-4 text-zinc-400" />
            Tercihler
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 p-6 pt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Aylık Bütçe Limiti (₺)
            </label>
            <Input
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="bg-zinc-800 border-white/5 text-white h-12 rounded-xl px-4"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-zinc-400 flex items-center gap-2">
              <Bell className="h-4 w-4" /> Ödeme Hatırlatıcı (Gün)
            </label>
            <Input
              type="number"
              value={notificationDays}
              onChange={(e) => setNotificationDays(e.target.value)}
              className="bg-zinc-800 border-white/5 text-white h-12 rounded-xl px-4"
              placeholder="Örn: 7"
            />
          </div>

          <button
            onClick={saveSettings}
            disabled={savingConfig}
            className="flex h-12 items-center justify-center rounded-xl bg-white text-black font-semibold transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {savingConfig ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Değişiklikleri Kaydet"
            )}
          </button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 mt-4 px-2">
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
