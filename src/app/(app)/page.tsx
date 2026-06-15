"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  Bell,
  ChevronRight,
  Clock,
  Sparkles,
  CreditCard,
  RefreshCcw,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense } from "@/lib/types";
import {
  dbExpenseToExpense,
  getUpcomingPayments,
  getTotalMonthlyExpense,
  formatCurrency,
} from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { ExpenseDrawer } from "@/components/expense-drawer";

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function ExpenseSkeleton() {
  return (
    <div className="flex h-[4.5rem] items-center gap-4 rounded-2xl bg-zinc-900/50 p-4 animate-pulse">
      <div className="h-12 w-12 shrink-0 rounded-xl bg-zinc-800" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3.5 w-32 rounded-full bg-zinc-800" />
        <div className="h-2.5 w-20 rounded-full bg-zinc-800" />
      </div>
      <div className="h-3.5 w-16 rounded-full bg-zinc-800" />
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 p-6 animate-pulse">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-lg bg-white/15" />
          <div className="h-5 w-12 rounded-full bg-white/15" />
        </div>
        <div className="h-9 w-40 rounded-full bg-white/15" />
        <div className="h-2 rounded-full bg-white/15" />
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  // Drawer state
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const budgetLimit = 5000;

  const currentMonth = new Date().toLocaleDateString("tr-TR", { month: "long" });
  const currentYear = new Date().getFullYear();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw new Error(authError.message || "Oturum hatası");
      }
      
      const name =
        user?.user_metadata?.full_name ??
        user?.user_metadata?.name ??
        user?.email?.split("@")[0] ??
        "";
      if (name) setDisplayName(name.split(" ")[0]);

      const { data, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .order("billing_day", { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message || "Veri çekme hatası");
      }

      if (!data) {
        setExpenses([]);
        return;
      }

      const mapped = (data as DbExpense[]).map(dbExpenseToExpense);
      setExpenses(mapped);
    } catch (err: any) {
      console.error("Giderler yüklenirken istisna fırlatıldı:", err);
      const msg = err?.message || err?.error_description || "Bilinmeyen hata";
      setError(`Hata: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleUpdate = async (id: string, updates: any) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").update(updates).eq("id", id);
      if (error) throw error;
      
      console.log("Gider başarıyla güncellendi.");
      fetchExpenses(); // Refresh list
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Güncelleme hatası: ${error.message}`);
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      
      console.log("Gider silindi.");
      setExpenses((prev) => prev.filter(e => e.id !== id));
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Silme hatası: ${error.message}`);
      throw err;
    }
  };

  const openDrawer = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDrawerOpen(true);
  };

  const totalExpense = getTotalMonthlyExpense(expenses);
  const upcomingPayments = getUpcomingPayments(expenses, 7);
  const budgetPercentage = Math.min((totalExpense / budgetLimit) * 100, 100);

  return (
    <div className="flex flex-col gap-6 px-4 pt-safe pb-24">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between pt-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {displayName ? `Merhaba, ${displayName}!` : "Merhaba!"}{" "}
              <span className="inline-block animate-[wave_1.8s_ease-in-out_infinite]">👋</span>
            </h1>
          </div>
          <p className="text-sm text-zinc-400">
            {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)} {currentYear} özeti
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="refresh-button"
            onClick={fetchExpenses}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:text-white active:scale-90 disabled:opacity-40"
            aria-label="Yenile"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            id="notifications-button"
            className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/5 transition-colors active:scale-95"
            aria-label="Bildirimler"
          >
            <Bell className="h-5 w-5 text-zinc-400" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950" />
          </button>
        </div>
      </header>

      {/* ─── Monthly Total Card ──────────────────────────────── */}
      {loading && expenses.length === 0 ? (
        <SummaryCardSkeleton />
      ) : (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 ring-0">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/8 blur-xl" />

          <CardContent className="relative flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white/80">Aylık Toplam Gider</span>
              </div>
              <Badge variant="secondary" className="bg-white/15 text-white border-0 text-xs backdrop-blur-sm">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                {expenses.length} gider
              </Badge>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-white">
                  ₺{formatCurrency(totalExpense)}
                </span>
              </div>
              <p className="text-xs text-white/60">{expenses.length} aktif abonelik ve gider</p>
            </div>

            {/* Budget progress */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Bütçe kullanımı</span>
                <span className="font-medium text-white">
                  ₺{formatCurrency(totalExpense)} / ₺{formatCurrency(budgetLimit)}
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Upcoming Payments ───────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Yaklaşan Ödemeler</h2>
          </div>
        </div>

        {loading && expenses.length === 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[160px] shrink-0 rounded-2xl bg-zinc-900/50 p-4 animate-pulse">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-zinc-800" />
                    <div className="h-5 w-10 rounded-full bg-zinc-800" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-20 rounded-full bg-zinc-800" />
                    <div className="h-5 w-16 rounded-full bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : upcomingPayments.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {upcomingPayments.map((payment) => (
              <Card key={payment.id} className="min-w-[160px] shrink-0 border border-white/5 bg-zinc-900 shadow-sm">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 shrink-0">
                      <BrandLogo
                        domain={payment.domain}
                        name={payment.name}
                        fallbackIcon={payment.icon}
                        fallbackColor={payment.color}
                      />
                    </div>
                    {payment.daysUntil === 0 ? (
                      <Badge className="bg-red-500/15 text-red-400 border-0 text-[10px]">Bugün</Badge>
                    ) : payment.daysUntil === 1 ? (
                      <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[10px]">Yarın</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-0 text-[10px]">
                        {payment.daysUntil} gün
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-white truncate">{payment.name}</span>
                    <span className="text-lg font-bold text-indigo-400">
                      {payment.currency}
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 ring-0 bg-zinc-900/50">
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <Sparkles className="h-8 w-8 text-indigo-400/50" />
              <p className="text-sm text-zinc-400">Yaklaşan 7 gün içinde ödemeniz bulunmuyor.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ─── All Subscriptions & Expenses ───────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Abonelikler ve Giderler</h2>
          <span className="text-xs text-zinc-500">
            {loading ? "…" : `${expenses.length} adet`}
          </span>
        </div>

        {error && (
          <Card className="border border-red-500/20 bg-red-500/10">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button onClick={fetchExpenses} className="text-xs text-indigo-400 underline-offset-4 hover:underline">
                Tekrar dene
              </button>
            </CardContent>
          </Card>
        )}

        {loading && expenses.length === 0 && !error && (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map((i) => (
              <ExpenseSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && expenses.length === 0 && (
          <Card className="border border-white/5 bg-zinc-900">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <span className="text-4xl">💸</span>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-white">Henüz gider eklenmedi</p>
                <p className="text-xs text-zinc-400">İlk aboneliğini veya sabit giderini ekle.</p>
              </div>
              <Link
                href="/ekle"
                className="flex h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Gider Ekle
              </Link>
            </CardContent>
          </Card>
        )}

        {expenses.length > 0 && (
          <div className="flex flex-col gap-2">
            {expenses.map((expense) => (
              <button
                key={expense.id}
                onClick={() => openDrawer(expense)}
                className="group flex h-[4.5rem] items-center gap-4 rounded-2xl border border-white/5 bg-zinc-900 p-4 text-left transition-all duration-200 hover:bg-zinc-800/80 active:scale-[0.98]"
              >
                <div className="h-12 w-12 shrink-0">
                  <BrandLogo
                    domain={expense.domain}
                    name={expense.name}
                    fallbackIcon={expense.icon}
                    fallbackColor={expense.color}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-white truncate">{expense.name}</span>
                  <span className="text-xs text-zinc-400">
                    Her ay · {expense.dueDay}. gün
                  </span>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-sm font-semibold text-white">
                    {expense.currency}
                    {formatCurrency(expense.amount)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ─── Expense Drawer ───────────────────────────────────── */}
      <ExpenseDrawer
        expense={selectedExpense}
        isOpen={isDrawerOpen}
        onClose={setIsDrawerOpen}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
