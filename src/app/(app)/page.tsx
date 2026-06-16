"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Bell, Check } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense, UpcomingPayment } from "@/lib/types";
import {
  dbExpenseToExpense,
  getTotalMonthlyExpense,
  formatCurrency,
  getNotificationPayments,
  CATEGORY_META,
} from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Money Particle ───────────────────────────────────────────────────────────
function MoneyParticle({ index, onDone }: { index: number; onDone: () => void }) {
  const symbols = ["₺", "💰", "✨", "⭐"];
  const sym = symbols[index % symbols.length];
  const xOffset = (Math.random() - 0.5) * 120;
  const rotation = (Math.random() - 0.5) * 360;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2 pointer-events-none select-none text-lg z-[200]"
      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        x: xOffset,
        y: 80 + Math.random() * 60,
        opacity: 0,
        scale: 0.4,
        rotate: rotation,
      }}
      transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.04 }}
      onAnimationComplete={onDone}
    >
      {sym}
    </motion.div>
  );
}

// ─── Tick Button ──────────────────────────────────────────────────────────────
function TickButton({ onConfirm }: { onConfirm: () => void }) {
  const [phase, setPhase] = useState<"idle" | "filling" | "explode" | "done">("idle");
  const [particles, setParticles] = useState<number[]>([]);
  const [doneCount, setDoneCount] = useState(0);

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("filling");

    // Play coin sound
    try {
      const ctx = new AudioContext();
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.3;
      gainNode.connect(ctx.destination);

      // Simple coin-chime: a few ascending tones
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gainNode);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.12);
      });
    } catch (_) {}

    // After fill animation completes → explode particles
    setTimeout(() => {
      setPhase("explode");
      setParticles(Array.from({ length: 10 }, (_, i) => i));
    }, 700);

    // Hide after particles
    setTimeout(() => {
      setPhase("done");
      onConfirm();
    }, 1800);
  };

  const PARTICLE_TOTAL = 10;
  const handleParticleDone = () => {
    setDoneCount((c) => c + 1);
  };

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: 36, height: 36 }}>
      <button
        onClick={handleClick}
        disabled={phase !== "idle"}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full border transition-all overflow-hidden",
          phase === "idle"
            ? "border-white/10 bg-zinc-900/60 hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-90"
            : "border-emerald-500/60 bg-emerald-500/10"
        )}
        aria-label="Ödendi"
      >
        {/* Wave fill animation */}
        <AnimatePresence>
          {(phase === "filling" || phase === "explode") && (
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-500 origin-bottom"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>

        <Check
          className={cn(
            "relative z-10 h-4 w-4 transition-colors duration-300",
            phase === "idle" ? "text-zinc-500" : "text-white"
          )}
        />
      </button>

      {/* Money particles */}
      {phase === "explode" &&
        particles.map((i) => (
          <MoneyParticle key={i} index={i} onDone={handleParticleDone} />
        ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>("");
  const [budgetLimit, setBudgetLimit] = useState<number>(5000);
  const [notificationDays, setNotificationDays] = useState<number>(7);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  const bellRef = useRef<HTMLDivElement>(null);
  const currentMonth = new Date().toLocaleDateString("tr-TR", { month: "long" });
  const currentYear = new Date().getFullYear();

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const name =
        user?.user_metadata?.full_name ??
        user?.user_metadata?.name ??
        user?.email?.split("@")[0] ??
        "";
      if (name) setDisplayName(name.split(" ")[0]);

      if (user?.user_metadata?.budget_limit)
        setBudgetLimit(Number(user.user_metadata.budget_limit));
      if (user?.user_metadata?.notification_days)
        setNotificationDays(Number(user.user_metadata.notification_days));

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

  // All notification payments (upcoming + past)
  const allNotifications = getNotificationPayments(expenses, notificationDays, notificationDays);
  const visibleNotifications = allNotifications.filter((p) => !paidIds.has(p.id));
  const hasBell = visibleNotifications.length > 0;

  const handlePaid = (id: string) => {
    setPaidIds((prev) => new Set([...prev, id]));
  };

  // Donut chart data
  const categoryData = expenses.reduce((acc, curr) => {
    const label =
      curr.category === "digital"
        ? "Dijital"
        : curr.category === "bank"
        ? "Banka"
        : curr.category === "lifestyle"
        ? "Yaşam"
        : "Diğer";
    acc[label] = (acc[label] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryData)
    .map((key) => ({ name: key, value: categoryData[key] }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ["#6366f1", "#14b8a6", "#ec4899", "#8b5cf6", "#f59e0b"];

  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-2">
        {payload.map((entry: any, index: number) => (
          <li
            key={`item-${index}`}
            className="flex items-center gap-2 text-[11px] font-medium text-zinc-400"
          >
            <span
              className="block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  const formatNotifDay = (p: UpcomingPayment) => {
    const day = new Date(p.dueDate).getDate();
    if (p.daysUntil === 0) return "Bugün";
    if (p.isPast) return `${Math.abs(p.daysUntil)} gün önce (Ayın ${day}'i)`;
    return `${p.daysUntil} gün sonra (Ayın ${day}'i)`;
  };

  return (
    <div className="flex flex-col gap-6 px-4 pt-safe pb-32 min-h-screen bg-black">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between pt-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {displayName ? `Merhaba, ${displayName}` : "Özet"}
          </h1>
          <p className="text-sm text-zinc-500">Aylık finansal durumunuz</p>
        </div>

        <div className="flex items-center gap-2" ref={bellRef}>
          <Link
            href="/ekle"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/60 text-zinc-400 border border-white/5 transition-colors hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Link>

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen((o) => !o)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/60 text-zinc-400 border border-white/5 transition-colors hover:text-white active:scale-95"
            >
              <Bell className="h-4 w-4" />
              {hasBell && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-black" />
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-[320px] rounded-3xl bg-zinc-900 border border-white/8 shadow-2xl p-4 z-50"
                >
                  <h3 className="text-sm font-semibold text-white mb-3">Bildirimler</h3>

                  {visibleNotifications.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto scrollbar-none">
                      {/* Section: Geçen Ödemeler */}
                      {visibleNotifications.some((p) => p.isPast) && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-1 pt-1">
                          Geçen Ödemeler
                        </p>
                      )}
                      {visibleNotifications
                        .filter((p) => p.isPast)
                        .map((p) => (
                          <NotifItem
                            key={p.id}
                            payment={p}
                            label={formatNotifDay(p)}
                            onPaid={handlePaid}
                            past
                          />
                        ))}

                      {/* Section: Yaklaşan Ödemeler */}
                      {visibleNotifications.some((p) => !p.isPast) && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-1 pt-2">
                          Yaklaşan Ödemeler
                        </p>
                      )}
                      {visibleNotifications
                        .filter((p) => !p.isPast)
                        .map((p) => (
                          <NotifItem
                            key={p.id}
                            payment={p}
                            label={formatNotifDay(p)}
                            onPaid={handlePaid}
                            past={false}
                          />
                        ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 text-center py-6">
                      Yaklaşan veya geçen ödeme bildirimi yok.
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
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
                Kalan Bütçe
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isOverBudget ? "text-red-400" : "text-emerald-400"
                )}
              >
                ₺{formatCurrency(Math.abs(remainingBudget))}{" "}
                {isOverBudget && "Aşıldı"}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
              Limit: ₺{formatCurrency(budgetLimit)}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                isOverBudget ? "bg-red-500" : "bg-emerald-500"
              )}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((totalExpense / budgetLimit) * 100, 100)}%`,
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* ─── Donut Chart ─────────────────────────────────────── */}
      <div className="rounded-[32px] bg-zinc-900/40 p-6 border border-white/5 flex flex-col gap-2 backdrop-blur-xl">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
          Harcama Dağılımı
        </h2>
        {expenses.length > 0 ? (
          <div className="relative h-[220px] w-full mt-2">
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
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) =>
                    `₺${formatCurrency(Number(value) || 0)}`
                  }
                  contentStyle={{
                    backgroundColor: "#27272a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    color: "#fff",
                    padding: "8px 12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                  }}
                  itemStyle={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}
                />
                <Legend
                  content={renderCustomLegend}
                  verticalAlign="bottom"
                  height={36}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered inner label — offset upward by half the legend height */}
            <div
              className="absolute inset-x-0 pointer-events-none flex flex-col items-center justify-center"
              style={{ top: 0, bottom: 36 }}
            >
              <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                Toplam
              </span>
              <span className="text-white text-lg font-bold leading-tight">
                ₺{formatCurrency(totalExpense)}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-zinc-500 text-sm">
            Veri bulunmuyor
          </div>
        )}
      </div>

      {/* ─── Son Eklenenler ───────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
            Son Eklenenler
          </h2>
          <Link
            href="/abonelikler"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
          >
            Tümünü Gör
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {expenses.slice(0, 3).map((expense) => {
            const meta = CATEGORY_META[expense.category];
            return (
              <div
                key={expense.id}
                className="flex h-[72px] items-center gap-4 rounded-3xl bg-zinc-900/40 p-3 pr-5 border border-white/5 backdrop-blur-xl"
              >
                <div className="h-12 w-12 shrink-0">
                  <BrandLogo
                    domain={expense.domain}
                    name={expense.name}
                    fallbackIcon={expense.icon}
                    fallbackColor={expense.color}
                  />
                </div>
                <div className="flex flex-1 flex-col min-w-0 justify-center">
                  <span className="text-[15px] font-medium text-white/95 truncate leading-snug">
                    {expense.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px]">{meta.icon}</span>
                    <span className="text-xs text-zinc-500 truncate">
                      {meta.label} • Ayın {expense.dueDay}. günü
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[15px] font-semibold text-white/90">
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      TRY
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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

// ─── Notification Item ────────────────────────────────────────────────────────
function NotifItem({
  payment,
  label,
  onPaid,
  past,
}: {
  payment: UpcomingPayment;
  label: string;
  onPaid: (id: string) => void;
  past: boolean;
}) {
  return (
    <div className="relative flex items-center gap-3 bg-zinc-800/50 p-2.5 rounded-2xl overflow-visible">
      <div className="h-10 w-10 shrink-0">
        <BrandLogo
          domain={payment.domain}
          name={payment.name}
          fallbackIcon={payment.icon}
          fallbackColor={payment.color}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium text-white truncate">
          {payment.name}
        </span>
        <span
          className={cn(
            "text-[11px] font-medium",
            past
              ? "text-red-400"
              : payment.daysUntil === 0
              ? "text-yellow-400"
              : "text-zinc-400"
          )}
        >
          {label}
        </span>
      </div>
      <span className="text-sm font-semibold text-white/80 shrink-0 mr-2">
        ₺{formatCurrency(payment.amount)}
      </span>
      <TickButton onConfirm={() => onPaid(payment.id)} />
    </div>
  );
}
