"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Bell, TrendingUp, CreditCard } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense } from "@/lib/types";
import { dbExpenseToExpense, getTotalMonthlyExpense, formatCurrency } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>("");

  const currentMonth = new Date().toLocaleDateString("tr-TR", { month: "long" });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "";
      if (name) setDisplayName(name.split(" ")[0]);

      const { data } = await supabase.from("expenses").select("*");
      if (data) setExpenses((data as DbExpense[]).map(dbExpenseToExpense));
    } catch (err) {
      console.error("Giderler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalExpense = getTotalMonthlyExpense(expenses);

  // Group data for PieChart
  const categoryData = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryData).map(key => ({
    name: key,
    value: categoryData[key],
  }));

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];

  return (
    <div className="flex flex-col gap-6 px-4 pt-safe pb-32 min-h-screen bg-black">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between pt-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {displayName ? `Merhaba, ${displayName}` : "Özet"}
          </h1>
          <p className="text-sm text-zinc-500">
            Aylık finansal durumunuz
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/ekle"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition-colors hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Link>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 transition-colors hover:text-white">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ─── Monthly Total ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900/60 p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <CreditCard className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-zinc-400">{currentMonth} Toplamı</span>
        </div>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-4xl font-bold text-white tracking-tight">
            ₺{formatCurrency(totalExpense)}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 w-fit px-2.5 py-1 rounded-full">
          <TrendingUp className="h-3 w-3" />
          Kontrol altında
        </div>
      </div>

      {/* ─── Category Distribution Chart ─────────────────────── */}
      <div className="rounded-3xl bg-zinc-900/60 p-6 border border-white/5 flex flex-col gap-4">
        <h2 className="text-base font-semibold text-white">Harcama Dağılımı</h2>
        {expenses.length > 0 ? (
          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `₺${formatCurrency(Number(value) || 0)}`}
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-zinc-500 text-sm">
            Veri bulunmuyor
          </div>
        )}
      </div>

      {/* ─── Quick List (Recent) ─────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Son Eklenenler</h2>
          <Link href="/abonelikler" className="text-xs font-medium text-indigo-400">
            Tümünü Gör
          </Link>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {expenses.slice(0, 3).map((expense) => (
            <div key={expense.id} className="flex h-[64px] items-center gap-4 rounded-2xl bg-zinc-900/40 p-3 pr-4 border border-white/5">
              <div className="h-10 w-10 shrink-0">
                <BrandLogo domain={expense.domain} name={expense.name} fallbackIcon={expense.icon} fallbackColor={expense.color} />
              </div>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-sm font-medium text-white/95 truncate">{expense.name}</span>
                <span className="text-xs text-zinc-500">Her ayın {expense.dueDay}. günü</span>
              </div>
              <div className="shrink-0 text-sm font-semibold text-white/90">
                ₺{formatCurrency(expense.amount)}
              </div>
            </div>
          ))}
          {expenses.length === 0 && !loading && (
            <div className="text-center py-6 text-sm text-zinc-500">Gider bulunmuyor.</div>
          )}
        </div>
      </div>
    </div>
  );
}
