"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense } from "@/lib/types";
import { dbExpenseToExpense, formatCurrency } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function TakvimPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase.from("expenses").select("*");
        if (data) setExpenses((data as DbExpense[]).map(dbExpenseToExpense));
      } catch (err) {
        console.error("Giderler yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding for start of month
  const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1; // Mon = 0
  const paddingDays = Array.from({ length: startDay }).map((_, i) => i);

  const selectedDayExpenses = expenses.filter(
    (e) => e.dueDay === selectedDate.getDate()
  );

  return (
    <div className="flex flex-col gap-6 px-4 pt-safe pb-32 min-h-screen bg-black">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between pt-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Takvim</h1>
      </header>

      {/* ─── Calendar Grid ───────────────────────────────────── */}
      <div className="rounded-3xl bg-zinc-900/60 p-4 border border-white/5">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-lg font-medium text-white capitalize">
            {format(currentDate, "MMMM yyyy", { locale: tr })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
            <div key={day} className="text-[10px] font-medium text-zinc-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((i) => (
            <div key={`empty-${i}`} className="h-10 w-full" />
          ))}
          {daysInMonth.map((day, idx) => {
            const hasExpense = expenses.some((e) => e.dueDay === day.getDate());
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const today = isToday(day);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative flex h-10 w-full flex-col items-center justify-center rounded-full text-sm transition-all duration-200",
                  !isCurrentMonth ? "text-zinc-700 pointer-events-none" : "text-white hover:bg-zinc-800",
                  isSelected && isCurrentMonth ? "bg-indigo-500 text-white font-bold" : "",
                  today && !isSelected ? "ring-1 ring-indigo-500/50" : ""
                )}
              >
                <span>{format(day, "d")}</span>
                {hasExpense && isCurrentMonth && (
                  <span
                    className={cn(
                      "absolute bottom-1 h-1 w-1 rounded-full",
                      isSelected ? "bg-white" : "bg-indigo-400"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Selected Day Details ────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-400 px-2">
          {format(selectedDate, "d MMMM yyyy", { locale: tr })}
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
          </div>
        ) : selectedDayExpenses.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedDayExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex h-[72px] items-center gap-4 rounded-2xl bg-zinc-900/60 p-3 pr-4 border border-white/5"
              >
                <div className="h-12 w-12 shrink-0">
                  <BrandLogo
                    domain={expense.domain}
                    name={expense.name}
                    fallbackIcon={expense.icon}
                    fallbackColor={expense.color}
                  />
                </div>
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-[15px] font-medium text-white/95 truncate">
                    {expense.name}
                  </span>
                </div>
                <div className="shrink-0 text-sm font-semibold text-white/90">
                  ₺{formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 rounded-3xl bg-zinc-900/30 border border-white/5 border-dashed">
            <p className="text-sm text-zinc-500">Bu tarihte ödeme yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
