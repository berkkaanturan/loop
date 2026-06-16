"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense } from "@/lib/types";
import { dbExpenseToExpense, formatCurrency, CATEGORY_META } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { ExpenseDrawer } from "@/components/expense-drawer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const FILTERS = [
  { id: "all", label: "Hepsi", icon: null },
  { id: "digital", label: "Dijital", icon: "📱" },
  { id: "bank", label: "Banka", icon: "💳" },
  { id: "lifestyle", label: "Yaşam", icon: "💪" },
  { id: "other", label: "Diğer", icon: "📦" },
];

export default function AboneliklerPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscription" | "bill">("subscription");
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Drawer state
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("billing_day", { ascending: true });

      if (error) throw error;
      
      if (data) {
        setExpenses((data as DbExpense[]).map(dbExpenseToExpense));
      }
    } catch (err) {
      console.error("Giderler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleUpdate = async (id: string, updates: any) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").update(updates).eq("id", id);
      if (error) throw error;
      fetchExpenses();
    } catch (err: unknown) {
      alert(`Güncelleme hatası: ${(err as Error).message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      setExpenses((prev) => prev.filter(e => e.id !== id));
    } catch (err: unknown) {
      alert(`Silme hatası: ${(err as Error).message}`);
    }
  };

  const filteredExpenses = expenses.filter(e => {
    if (activeFilter !== "all" && e.category !== activeFilter) return false;
    if (e.expense_type !== activeTab) return false;
    return true; 
  });

  return (
    <div className="flex flex-col gap-6 px-4 pt-safe pb-32 min-h-screen bg-black">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between pt-6">
        {/* Toggle Pill (Glass UI) */}
        <div className="relative flex h-12 w-[240px] items-center rounded-full bg-zinc-900/60 p-1 backdrop-blur-xl border border-white/5 shadow-inner">
          <div className="relative flex h-full w-full">
            {/* Sliding Background */}
            <motion.div
              layout
              className="absolute top-0 bottom-0 rounded-full bg-zinc-800 shadow-sm"
              initial={false}
              animate={{
                width: "55%", // Active tab is wider
                left: activeTab === "subscription" ? "0%" : "45%"
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            
            <motion.button
              layout
              onClick={() => setActiveTab("subscription")}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "relative z-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors h-full",
                activeTab === "subscription" ? "text-white w-[55%]" : "text-zinc-500 hover:text-zinc-300 w-[45%]"
              )}
            >
              Abonelikler
            </motion.button>
            <motion.button
              layout
              onClick={() => setActiveTab("bill")}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "relative z-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors h-full",
                activeTab === "bill" ? "text-white w-[55%]" : "text-zinc-500 hover:text-zinc-300 w-[45%]"
              )}
            >
              Faturalar
            </motion.button>
          </div>
        </div>

        {/* Add Button */}
        <Link
          href="/ekle"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/60 backdrop-blur-xl border border-white/5 text-zinc-400 transition-all hover:text-white hover:bg-zinc-800 active:scale-95 shadow-sm"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      {/* ─── Category Filter Chips ───────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={cn(
              "flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-all border",
              activeFilter === filter.id
                ? "bg-white text-black border-white"
                : "bg-zinc-900/60 text-zinc-400 border-white/5 hover:bg-zinc-800"
            )}
          >
            {filter.icon && <span>{filter.icon}</span>}
            {filter.label}
          </button>
        ))}
      </div>

      {/* ─── Expense List ────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-500">
            <p className="text-sm">Bu kategoride kayıt bulunamadı.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const meta = CATEGORY_META[expense.category];
            return (
              <button
                key={expense.id}
                onClick={() => {
                  setSelectedExpense(expense);
                  setIsDrawerOpen(true);
                }}
                className="flex h-[72px] items-center gap-4 rounded-3xl bg-zinc-900/40 p-3 pr-5 text-left transition-all active:scale-[0.98] border border-white/5 hover:border-white/10 shadow-sm"
              >
                {/* Logo */}
                <div className="h-12 w-12 shrink-0">
                  <BrandLogo
                    domain={expense.domain}
                    name={expense.name}
                    fallbackIcon={expense.icon}
                    fallbackColor={expense.color}
                  />
                </div>
                
                {/* Middle: Name & Category */}
                <div className="flex flex-1 flex-col justify-center min-w-0">
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

                {/* Right: Amount centered vertically */}
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
              </button>
            );
          })
        )}
      </div>

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
