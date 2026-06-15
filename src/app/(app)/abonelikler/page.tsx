"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense, ExpenseCategory } from "@/lib/types";
import { dbExpenseToExpense, formatCurrency, CATEGORY_META } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { ExpenseDrawer } from "@/components/expense-drawer";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "Tümü", icon: "🌐" },
  { id: "digital", label: "Dijital", icon: "📱" },
  { id: "bank", label: "Banka", icon: "💳" },
  { id: "lifestyle", label: "Yaşam", icon: "💪" },
  { id: "other", label: "Diğer", icon: "📦" },
];

export default function AboneliklerPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "bills">("subscriptions");
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
    // For now we treat all as subscriptions or bills just to show UI toggle, normally you'd filter by type.
    return true; 
  });

  return (
    <div className="flex flex-col gap-6 px-4 pt-safe pb-32 min-h-screen bg-black">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between pt-6">
        {/* Toggle Pill */}
        <div className="flex h-12 w-[240px] items-center rounded-full bg-zinc-900/80 p-1 backdrop-blur-xl border border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={cn(
              "flex-1 rounded-full text-sm font-medium transition-all duration-300 h-full",
              activeTab === "subscriptions" 
                ? "bg-zinc-800 text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Abonelikler
          </button>
          <button
            onClick={() => setActiveTab("bills")}
            className={cn(
              "flex-1 rounded-full text-sm font-medium transition-all duration-300 h-full",
              activeTab === "bills" 
                ? "bg-zinc-800 text-white shadow-sm" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Faturalar
          </button>
        </div>

        {/* Add Button */}
        <Link
          href="/ekle"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/5 text-zinc-400 transition-all hover:text-white hover:bg-zinc-800 active:scale-95"
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
            <span>{filter.icon}</span>
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
            <p className="text-sm">Bu kategoride gider bulunamadı.</p>
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
                className="flex h-[72px] items-center gap-4 rounded-2xl bg-zinc-900/60 p-3 pr-4 text-left transition-all active:scale-[0.98] border border-transparent hover:border-white/5"
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
                      {meta.label}
                    </span>
                  </div>
                </div>

                {/* Right: Amount & Subtext */}
                <div className="flex flex-col items-end justify-center shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-semibold text-white/90">
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      TRY
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-0.5">aylık</span>
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
