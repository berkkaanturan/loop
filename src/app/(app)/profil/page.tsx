"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  Mail,
  Calendar,
  Shield,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
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
    router.refresh(); // force middleware to re-evaluate
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    "Kullanıcı";

  const avatarUrl: string | undefined =
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 pt-safe pt-8 pb-6 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-3xl bg-card" />
          <div className="h-5 w-36 rounded-full bg-card" />
          <div className="h-3.5 w-48 rounded-full bg-card" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-safe pb-6">
      {/* ─── Header ───────────────────────────────────────────── */}
      <header className="pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hesap bilgilerin ve ayarların
        </p>
      </header>

      {/* ─── Avatar + Name ────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 py-2">
        {/* Avatar */}
        <div className="relative">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-24 w-24 rounded-3xl object-cover ring-2 ring-border"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-3xl font-bold text-white ring-2 ring-border">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Online indicator */}
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background ring-2 ring-background">
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-xl font-bold tracking-tight">{displayName}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* ─── Info cards ───────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 px-1 mb-1">
          Hesap Bilgileri
        </p>

        <Card className="border-0 bg-card ring-0">
          <CardContent className="flex flex-col divide-y divide-border p-0">
            {/* Name row */}
            <div className="flex h-14 items-center gap-4 px-4">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  Ad Soyad
                </span>
                <span className="text-sm font-medium truncate">{displayName}</span>
              </div>
            </div>

            {/* Email row */}
            <div className="flex h-14 items-center gap-4 px-4">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  E-posta
                </span>
                <span className="text-sm font-medium truncate">{user?.email}</span>
              </div>
            </div>

            {/* Joined row */}
            {createdAt && (
              <div className="flex h-14 items-center gap-4 px-4">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                    Üyelik Tarihi
                  </span>
                  <span className="text-sm font-medium">{createdAt}</span>
                </div>
              </div>
            )}

            {/* Auth provider row */}
            <div className="flex h-14 items-center gap-4 px-4">
              <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  Giriş Yöntemi
                </span>
                <span className="text-sm font-medium">Google OAuth</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Action rows ──────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 px-1 mb-1">
          Ayarlar
        </p>

        {/* Placeholder settings rows */}
        {[
          { icon: "🔔", label: "Bildirim Tercihleri", sub: "Yakında" },
          { icon: "💰", label: "Bütçe Limiti", sub: "₺5.000 / ay" },
        ].map((item) => (
          <button
            key={item.label}
            disabled
            className="flex h-14 items-center gap-4 rounded-2xl bg-card px-4 text-left opacity-50"
          >
            <span className="text-lg">{item.icon}</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.sub}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
          </button>
        ))}
      </div>

      {/* ─── Logout button ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          id="logout-button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/8 text-sm font-semibold text-destructive transition-all duration-200 hover:bg-destructive/15 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          {loggingOut ? "Çıkış yapılıyor…" : "Çıkış Yap"}
        </button>

        <p className="text-center text-xs text-muted-foreground/50">
          Çıkış yaptığında tüm veriler güvende kalır.
        </p>
      </div>
    </div>
  );
}
