"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense } from "@/lib/types";
import { dbExpenseToExpense, formatCurrency, CATEGORY_META } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { CategoryIcon } from "@/components/category-icon";
import { ExpenseDrawer } from "@/components/expense-drawer";
import { useExpenses } from "@/lib/expenses-context";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const FILTERS = [
  { id: "all", label: "Hepsi" },
  { id: "digital", label: "Dijital" },
  { id: "bank", label: "Banka" },
  { id: "lifestyle", label: "Yaşam" },
  { id: "other", label: "Diğer" },
];

export default function AboneliklerPage() {
  const { expenses, loading, refreshExpenses } = useExpenses();
  const [activeTab, setActiveTab] = useState<"subscription" | "bill">("subscription");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleUpdate = async (id: string, updates: any) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").update(updates).eq("id", id);
      if (error) throw error;
      refreshExpenses();
    } catch (err: unknown) {
      alert(`Güncelleme hatası: ${(err as Error).message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      refreshExpenses();
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
    <div
      className="flex flex-col gap-6 px-4 pt-safe pb-28"
      style={{ backgroundColor: "var(--app-bg)", minHeight: "100dvh" }}
    >
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between pt-6">
        {/* Toggle Pill */}
        <div
          className="relative flex h-12 w-[240px] items-center rounded-full p-1 backdrop-blur-xl border shadow-inner"
          style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
        >
          <div className="relative flex h-full w-full">
            <motion.div
              layout
              className="absolute top-0 bottom-0 rounded-full shadow-sm"
              style={{ backgroundColor: "var(--app-input-bg)" }}
              initial={false}
              animate={{ width: "55%", left: activeTab === "subscription" ? "0%" : "45%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <motion.button
              layout
              onClick={() => setActiveTab("subscription")}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              animate={{ width: activeTab === "subscription" ? "55%" : "45%" }}
              className="relative z-10 flex items-center justify-center rounded-full text-sm font-medium h-full transition-colors"
              style={{ color: activeTab === "subscription" ? "var(--app-text-primary)" : "var(--app-text-secondary)" }}
            >
              Abonelikler
            </motion.button>
            <motion.button
              layout
              onClick={() => setActiveTab("bill")}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              animate={{ width: activeTab === "bill" ? "55%" : "45%" }}
              className="relative z-10 flex items-center justify-center rounded-full text-sm font-medium h-full transition-colors"
              style={{ color: activeTab === "bill" ? "var(--app-text-primary)" : "var(--app-text-secondary)" }}
            >
              Faturalar
            </motion.button>
          </div>
        </div>

        <Link
          href="/ekle"
          className="flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-xl border transition-all active:scale-95 shadow-sm"
          style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)", color: "var(--app-text-secondary)" }}
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
            className="flex h-9 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-all border"
            style={
              activeFilter === filter.id
                ? { backgroundColor: "var(--app-text-primary)", color: "var(--app-bg)", borderColor: "var(--app-text-primary)" }
                : { backgroundColor: "var(--app-surface)", color: "var(--app-text-secondary)", borderColor: "var(--app-surface-border)" }
            }
          >
            {filter.id !== "all" && <CategoryIcon category={filter.id} className="h-3.5 w-3.5" />}
            {filter.label}
          </button>
        ))}
      </div>

      {/* ─── Expense List ────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--app-text-secondary)" }} />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center" style={{ color: "var(--app-text-secondary)" }}>
            <p className="text-sm">Bu kategoride kayıt bulunamadı.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const meta = CATEGORY_META[expense.category];
            return (
              <button
                key={expense.id}
                onClick={() => { setSelectedExpense(expense); setIsDrawerOpen(true); }}
                className="flex h-[72px] items-center gap-4 rounded-3xl p-3 pr-5 text-left transition-all active:scale-[0.98] border shadow-sm"
                style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}
              >
                <div className="h-12 w-12 shrink-0">
                  <BrandLogo domain={expense.domain} name={expense.name} fallbackIcon={expense.icon} fallbackColor={expense.color} />
                </div>
                <div className="flex flex-1 flex-col justify-center min-w-0">
                  <span className="text-[15px] font-medium truncate leading-snug" style={{ color: "var(--app-text-primary)" }}>
                    {expense.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CategoryIcon category={expense.category} className="h-3 w-3" />
                    <span className="text-xs truncate" style={{ color: "var(--app-text-secondary)" }}>
                      {meta.label} • Ayın {expense.dueDay}. günü
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[15px] font-semibold" style={{ color: "var(--app-text-primary)" }}>
                      ₺{formatCurrency(expense.amount)}
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
