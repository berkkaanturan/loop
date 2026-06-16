"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Bell } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense, UpcomingPayment } from "@/lib/types";
import { dbExpenseToExpense, getTotalMonthlyExpense, formatCurrency, getUpcomingPayments } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>("");
  const [budgetLimit, setBudgetLimit] = useState<number>(5000);
  const [notificationDays, setNotificationDays] = useState<number>(7);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const bellRef = useRef<HTMLDivElement>(null);
  const currentMonth = new Date().toLocaleDateString("tr-TR", { month: "long" });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const name = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "";
      if (name) setDisplayName(name.split(" ")[0]);
      
      if (user?.user_metadata?.budget_limit) {
        setBudgetLimit(Number(user.user_metadata.budget_limit));
      }
      if (user?.user_metadata?.notification_days) {
        setNotificationDays(Number(user.user_metadata.notification_days));
      }

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
  const remainingBudget = budgetLimit - totalExpense;
  const isOverBudget = remainingBudget < 0;

  const upcomingPayments = getUpcomingPayments(expenses, notificationDays);

  // Group data for PieChart
  const categoryData = expenses.reduce((acc, curr) => {
    const label = curr.category === 'digital' ? 'Dijital' :
                  curr.category === 'bank' ? 'Banka' :
                  curr.category === 'lifestyle' ? 'Yaşam' : 'Diğer';
    acc[label] = (acc[label] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryData).map(key => ({
    name: key,
    value: categoryData[key],
  })).sort((a, b) => b.value - a.value);

  const COLORS = ["#6366f1", "#14b8a6", "#ec4899", "#8b5cf6", "#f59e0b"];

  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-2">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
            <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

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
        <div className="flex items-center gap-2" ref={bellRef}>
          <Link
            href="/ekle"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/60 text-zinc-400 border border-white/5 transition-colors hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/60 text-zinc-400 border border-white/5 transition-colors hover:text-white active:scale-95"
            >
              <Bell className="h-4 w-4" />
              {upcomingPayments.length > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-900" />
              )}
            </button>
            
            {/* Notifications Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-[300px] rounded-3xl bg-zinc-800 border border-white/10 shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <h3 className="text-sm font-semibold text-white mb-3">Yaklaşan Ödemeler</h3>
                  {upcomingPayments.length > 0 ? (
                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-none">
                      {upcomingPayments.map(payment => (
                        <div key={payment.id} className="flex items-center gap-3 bg-zinc-900/50 p-2.5 rounded-2xl">
                          <div className="h-10 w-10 shrink-0">
                            <BrandLogo domain={payment.domain} name={payment.name} fallbackIcon={payment.icon} fallbackColor={payment.color} />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium text-white truncate">{payment.name}</span>
                            <span className="text-[11px] text-zinc-400">{payment.daysUntil === 0 ? "Bugün!" : `${payment.daysUntil} gün sonra (Ayın ${parseInt(payment.dueDate.split("-")[2])}'i)`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 text-center py-4">
                      {notificationDays} gün içinde yaklaşan ödemeniz yok.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ─── Monthly Total ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[32px] bg-zinc-900/40 p-6 border border-white/5 backdrop-blur-xl">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-zinc-400 uppercase tracking-wide">
            {currentMonth} Harcamaları
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[40px] font-bold text-white tracking-tight leading-none">
              ₺{formatCurrency(totalExpense)}
            </span>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Kalan Bütçe</span>
              <span className={cn("text-sm font-semibold", isOverBudget ? "text-red-400" : "text-emerald-400")}>
                ₺{formatCurrency(Math.abs(remainingBudget))} {isOverBudget && "Aşıldı"}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
              Limit: ₺{formatCurrency(budgetLimit)}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              className={cn("h-full rounded-full", isOverBudget ? "bg-red-500" : "bg-emerald-500")}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalExpense / budgetLimit) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* ─── Category Distribution Chart ─────────────────────── */}
      <div className="rounded-[32px] bg-zinc-900/40 p-6 border border-white/5 flex flex-col gap-2 backdrop-blur-xl">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Harcama Dağılımı</h2>
        {expenses.length > 0 ? (
          <div className="h-[220px] w-full mt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={8}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `₺${formatCurrency(Number(value) || 0)}`}
                  contentStyle={{ backgroundColor: '#27272a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', padding: '8px 12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}
                />
                <Legend content={renderCustomLegend} verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
            {/* Inner text for donut */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pb-4">
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Toplam</span>
              <span className="text-white text-lg font-bold">₺{formatCurrency(totalExpense)}</span>
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-zinc-500 text-sm">
            Veri bulunmuyor
          </div>
        )}
      </div>

      {/* ─── Quick List (Recent) ─────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Son Eklenenler</h2>
          <Link href="/abonelikler" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
            Tümünü Gör
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {expenses.slice(0, 3).map((expense) => (
            <div key={expense.id} className="flex h-[72px] items-center gap-4 rounded-3xl bg-zinc-900/40 p-3 pr-5 border border-white/5 backdrop-blur-xl">
              <div className="h-12 w-12 shrink-0">
                <BrandLogo domain={expense.domain} name={expense.name} fallbackIcon={expense.icon} fallbackColor={expense.color} />
              </div>
              <div className="flex flex-1 flex-col min-w-0 justify-center">
                <span className="text-[15px] font-medium text-white/95 truncate leading-snug">{expense.name}</span>
                <span className="text-xs text-zinc-500 mt-0.5">Her ayın {expense.dueDay}. günü</span>
              </div>
              <div className="shrink-0 text-[15px] font-semibold text-white/90">
                ₺{formatCurrency(expense.amount)}
              </div>
            </div>
          ))}
          {expenses.length === 0 && !loading && (
            <div className="text-center py-8 text-sm text-zinc-500 rounded-3xl bg-zinc-900/40 border border-white/5">
              Henüz gider eklenmedi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
