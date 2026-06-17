"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Plus, Pencil, X, Check, Search, Calendar as CalendarIcon, PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { UpcomingPayment } from "@/lib/types";
import {
  getTotalMonthlyExpense,
  formatCurrency,
  getNotificationPayments,
} from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { useExpenses } from "@/lib/expenses-context";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Tick Button ─────────────────────────────────────────────────────────────
function TickButton({ onConfirm }: { onConfirm: () => void }) {
  const [phase, setPhase] = useState<"idle" | "filling" | "done">("idle");

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("filling");
    setTimeout(() => {
      setPhase("done");
      onConfirm();
    }, 750);
  };

  return (
    <button
      onClick={handleClick}
      disabled={phase !== "idle"}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all overflow-hidden active:scale-90"
      style={{
        borderColor: phase === "idle" ? "var(--app-surface-border)" : "rgba(16,185,129,0.6)",
        backgroundColor: phase === "idle" ? "var(--app-input-bg)" : "transparent",
      }}
      aria-label="Ödendi"
    >
      <AnimatePresence>
        {phase === "filling" && (
          <motion.div
            className="absolute inset-x-0 bottom-0 rounded-full bg-emerald-500 origin-bottom"
            initial={{ height: "0%" }}
            animate={{ height: "100%" }}
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
  );
}

// ─── Notification Item ────────────────────────────────────────────────────────
function NotifItem({
  payment,
  label,
  onPaid,
  past,
  currencySymbol,
}: {
  payment: UpcomingPayment;
  label: string;
  onPaid: (id: string) => void;
  past: boolean;
  currencySymbol: string;
}) {
  return (
    <div
      className="flex h-[72px] items-center gap-4 rounded-3xl p-3 pr-5 text-left transition-all border shadow-sm"
      style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}
    >
      <div className="h-12 w-12 shrink-0">
        <BrandLogo
          domain={payment.domain}
          name={payment.name}
          fallbackIcon={payment.icon}
          fallbackColor={payment.color}
        />
      </div>
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <span className="text-[15px] font-medium truncate leading-snug" style={{ color: "var(--app-text-primary)" }}>
          {payment.name}
        </span>
        <span
          className={cn("text-xs truncate mt-0.5", past ? "text-red-400" : payment.daysUntil === 0 ? "text-yellow-400" : "text-zinc-400")}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center justify-center shrink-0 gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-[15px] font-semibold" style={{ color: "var(--app-text-primary)" }}>
            {currencySymbol}{formatCurrency(payment.amount)}
          </span>
        </div>
        <TickButton onConfirm={() => onPaid(payment.id)} />
      </div>
    </div>
  );
}

// ─── Budget Edit Modal ─────────────────────────────────────────────────────────
function BudgetEditModal({
  currentBudget,
  onSave,
  onClose,
  currencySymbol,
}: {
  currentBudget: number;
  onSave: (value: number) => Promise<void>;
  onClose: () => void;
  currencySymbol: string;
}) {
  const [value, setValue] = useState(currentBudget.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = parseFloat(value.replace(",", "."));
    if (isNaN(parsed) || parsed <= 0) return;
    setSaving(true);
    await onSave(parsed);
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-lg rounded-t-3xl border p-6 pb-safe"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-surface-border)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold" style={{ color: "var(--app-text-primary)" }}>Aylık Bütçe</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--app-input-bg)", color: "var(--app-text-secondary)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative flex items-center mb-4">
          <span className="absolute left-4 text-lg font-semibold" style={{ color: "var(--app-text-secondary)" }}>{currencySymbol}</span>
          <input
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="h-14 w-full rounded-2xl border pl-10 pr-4 text-xl font-bold outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            style={{
              backgroundColor: "var(--app-input-bg)",
              borderColor: "var(--app-surface-border)",
              color: "var(--app-text-primary)",
            }}
            placeholder="5000"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex h-14 w-full items-center justify-center rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "#6366f1", color: "#ffffff" }}
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { expenses, loading, refreshExpenses, currencySymbol } = useExpenses();
  const [userName, setUserName] = useState<string>("İsimsiz Kullanıcı");
  const [budgetLimit, setBudgetLimit] = useState<number>(5000);
  const [notificationDays, setNotificationDays] = useState<number>(7);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [paidIds, setPaidIdsState] = useState<Set<string>>(new Set());

  const paidStorageKey = `loop-paid-${new Date().getFullYear()}-${new Date().getMonth() + 1}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(paidStorageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setPaidIdsState(new Set(JSON.parse(stored)));
    } catch {
      // ignore
    }
  }, [paidStorageKey]);

  const handlePaid = (id: string) => {
    setPaidIdsState((prev) => {
      const newIds = new Set([...prev, id]);
      try {
        localStorage.setItem(paidStorageKey, JSON.stringify(Array.from(newIds)));
      } catch {
        // ignore
      }
      return newIds;
    });
  };

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

  useEffect(() => {
    async function fetchUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.name || user.user_metadata?.full_name;
          if (name) setUserName(name.split(" ")[0]);
          if (user.user_metadata?.budget_limit) setBudgetLimit(Number(user.user_metadata.budget_limit));
          if (user.user_metadata?.notification_days) setNotificationDays(Number(user.user_metadata.notification_days));
        }
      } catch {
        // ignore
      } finally {
        setIsUserLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleSaveBudget = async (value: number) => {
    setBudgetLimit(value);
    try {
      const supabase = createClient();
      await supabase.auth.updateUser({ data: { budget_limit: value } });
    } catch {
      // ignore
    }
  };

  const totalExpense = getTotalMonthlyExpense(expenses);
  const remainingBudget = budgetLimit - totalExpense;
  const isOverBudget = remainingBudget < 0;

  const allNotifications = getNotificationPayments(expenses, notificationDays, notificationDays);
  const visibleNotifications = allNotifications.filter((p) => !paidIds.has(p.id));
  const hasBell = visibleNotifications.length > 0;

  const pastPayments = visibleNotifications.filter((p) => p.isPast);
  const upcomingPayments = visibleNotifications.filter((p) => !p.isPast);

  const categoryData = expenses.reduce((acc, curr) => {
    const label = curr.category === "digital" ? "Dijital" : curr.category === "bank" ? "Banka" : curr.category === "social" ? "Sosyal" : curr.category === "travel" ? "Seyahat" : curr.category === "personal_care" ? "Kişisel Bakım" : "Diğer";
    acc[label] = (acc[label] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(categoryData)
    .map((key) => ({ name: key, value: categoryData[key] }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ["#6366f1", "#14b8a6", "#ec4899", "#8b5cf6", "#f59e0b"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLegend = (props: { payload?: ReadonlyArray<any> }) => {
    const { payload = [] } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-2">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2 text-[11px] font-medium" style={{ color: "var(--app-text-secondary)" }}>
            <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => `${currencySymbol}${formatCurrency(Number(value) || 0)}`;

  const formatNotifDay = (p: UpcomingPayment) => {
    const day = new Date(p.dueDate).getDate();
    if (p.daysUntil === 0) return "Bugün";
    if (p.isPast) return `${Math.abs(p.daysUntil)} gün önce (Ayın ${day}'i)`;
    return `${p.daysUntil} gün sonra (Ayın ${day}'i)`;
  };

  if (loading || isUserLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center flex-col gap-4" style={{ backgroundColor: "var(--app-bg)" }}>
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-6 px-4 pt-safe pb-28"
      style={{ backgroundColor: "var(--app-bg)", minHeight: "100dvh" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm shrink-0">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]">
              <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M20 14c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.6" />
              <circle cx="32" cy="20" r="2.5" fill="white" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--app-text-primary)" }}>
              {userName !== "İsimsiz Kullanıcı" ? `Merhaba, ${userName}` : "Özet"}
            </h1>
            <p className="text-[13px]" style={{ color: "var(--app-text-secondary)" }}>Aylık finansal durumunuz</p>
          </div>
        </div>

        <div className="flex items-center gap-2" ref={bellRef}>
          <Link
            href="/ekle"
            className="flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-colors"
            style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)", color: "var(--app-text-secondary)" }}
          >
            <Plus className="h-4 w-4" />
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen((o) => !o)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-colors active:scale-95"
              style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)", color: "var(--app-text-secondary)" }}
            >
              <Bell className="h-4 w-4" />
              {hasBell && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-transparent" style={{ boxShadow: "0 0 0 2px var(--app-bg)" }} />
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-[320px] rounded-3xl border shadow-2xl p-4 z-50 backdrop-blur-xl"
                  style={{ backgroundColor: "var(--app-dropdown-bg)", borderColor: "var(--app-surface-border)" }}
                >
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--app-text-primary)" }}>
                    Ödeme Hatırlatıcı
                  </h3>

                  {visibleNotifications.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto scrollbar-none">
                      {pastPayments.length > 0 && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1 pt-1">
                          Geçen Ödemeler
                        </p>
                      )}
                      {pastPayments.map((p) => (
                        <NotifItem key={p.id} payment={p} label={formatNotifDay(p)} onPaid={handlePaid} past currencySymbol={currencySymbol} />
                      ))}

                      {upcomingPayments.length > 0 && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1 pt-2">
                          Yaklaşan Ödemeler
                        </p>
                      )}
                      {upcomingPayments.map((p) => (
                        <NotifItem key={p.id} payment={p} label={formatNotifDay(p)} onPaid={handlePaid} past={false} currencySymbol={currencySymbol} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center py-6" style={{ color: "var(--app-text-secondary)" }}>
                      Yaklaşan veya geçen ödeme bildirimi yok.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Monthly Total + Budget */}
      <div
        className="relative overflow-hidden rounded-[32px] p-6 border backdrop-blur-xl"
        style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium uppercase tracking-wide" style={{ color: "var(--app-text-secondary)" }}>
            {currentMonth} Harcamaları
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[40px] font-bold tracking-tight leading-none" style={{ color: "var(--app-text-primary)" }}>
              {currencySymbol}{formatCurrency(totalExpense)}
            </span>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider font-medium" style={{ color: "var(--app-text-secondary)" }}>Kalan Bütçe</span>
              <span className={cn("text-sm font-semibold", isOverBudget ? "text-red-400" : "text-emerald-400")}>
                {currencySymbol}{formatCurrency(Math.abs(remainingBudget))} {isOverBudget && "Aşıldı"}
              </span>
            </div>
            {/* Budget label with pencil edit */}
            <button
              onClick={() => setIsBudgetModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl px-2 py-1 transition-colors active:scale-95"
              style={{ color: "var(--app-text-secondary)" }}
            >
              <span className="text-[11px] uppercase tracking-wider font-medium">
                Bütçe: {currencySymbol}{formatCurrency(budgetLimit)}
              </span>
              <Pencil className="h-3 w-3" />
            </button>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "var(--app-input-bg)" }}>
            <motion.div
              className={cn("h-full rounded-full", isOverBudget ? "bg-red-500" : "bg-emerald-500")}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalExpense / budgetLimit) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div
        className="rounded-[32px] p-6 border flex flex-col gap-2 backdrop-blur-xl"
        style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}
      >
        <h2 className="text-sm font-medium uppercase tracking-wide" style={{ color: "var(--app-text-secondary)" }}>
          Harcama Dağılımı
        </h2>
        {expenses.length > 0 ? (
          <div className="relative h-[220px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={8}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={tooltipFormatter}
                  contentStyle={{ backgroundColor: "var(--app-dropdown-bg)", border: "1px solid var(--app-surface-border)", borderRadius: "16px", color: "var(--app-text-primary)", padding: "8px 12px" }}
                  itemStyle={{ color: "var(--app-text-primary)", fontSize: "13px", fontWeight: 500 }}
                />
                <Legend content={renderCustomLegend} verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-x-0 pointer-events-none flex flex-col items-center justify-center" style={{ top: 0, bottom: 36 }}>
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--app-text-secondary)" }}>Toplam</span>
              <span className="text-lg font-bold leading-tight" style={{ color: "var(--app-text-primary)" }}>{currencySymbol}{formatCurrency(totalExpense)}</span>
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-sm" style={{ color: "var(--app-text-secondary)" }}>
            Veri bulunmuyor
          </div>
        )}
      </div>

      {/* ─── Yaklaşan / Geçen Ödemeler (Son Eklenenler'in yerini aldı) ────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-medium uppercase tracking-wide" style={{ color: "var(--app-text-secondary)" }}>
            Ödemeler
          </h2>
          <Link href="/abonelikler" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">
            Tümünü Gör
          </Link>
        </div>

        {visibleNotifications.length === 0 && expenses.length === 0 ? (
          <Link
            href="/ekle"
            className="group flex flex-col items-center justify-center gap-3 py-10 rounded-3xl border border-dashed transition-all active:scale-[0.98]"
            style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500/20 transition-colors">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--app-text-secondary)" }}>
              Henüz gider eklenmedi. Eklemek için dokunun.
            </span>
          </Link>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Geçen ödemeler */}
            {pastPayments.length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest px-2" style={{ color: "var(--app-text-secondary)" }}>
                  Geçen Ödemeler
                </p>
                {pastPayments.map((p) => (
                  <NotifItem key={p.id} payment={p} label={formatNotifDay(p)} onPaid={handlePaid} past currencySymbol={currencySymbol} />
                ))}
              </>
            )}

            {/* Yaklaşan ödemeler */}
            {upcomingPayments.length > 0 && (
              <>
                <p className={cn("text-[10px] font-bold uppercase tracking-widest px-2", pastPayments.length > 0 && "mt-2")} style={{ color: "var(--app-text-secondary)" }}>
                  Yaklaşan Ödemeler
                </p>
                {upcomingPayments.map((p) => (
                  <NotifItem key={p.id} payment={p} label={formatNotifDay(p)} onPaid={handlePaid} past={false} currencySymbol={currencySymbol} />
                ))}
              </>
            )}

            {/* No upcoming/past but has expenses */}
            {visibleNotifications.length === 0 && expenses.length > 0 && (
              <div
                className="flex flex-col items-center justify-center py-8 rounded-3xl border border-dashed"
                style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}
              >
                <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
                  Yaklaşan veya geçen ödeme yok.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Budget Edit Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <BudgetEditModal
            currentBudget={budgetLimit}
            onSave={handleSaveBudget}
            onClose={() => setIsBudgetModalOpen(false)}
            currencySymbol={currencySymbol}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
