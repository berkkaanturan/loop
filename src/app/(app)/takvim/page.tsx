"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { useExpenses } from "@/lib/expenses-context";
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
  getDay,
  setMonth,
  setYear,
} from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

export default function TakvimPage() {
  const { expenses, loading, currencySymbol } = useExpenses();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDow = getDay(monthStart);
  const paddingDays = Array.from({ length: startDow === 0 ? 6 : startDow - 1 });

  const selectedDayExpenses = expenses.filter(
    (e) => e.dueDay === selectedDate.getDate() && isSameMonth(selectedDate, currentDate)
  );

  const handlePickMonth = (monthIndex: number) => {
    const newDate = setYear(setMonth(currentDate, monthIndex), pickerYear);
    setCurrentDate(newDate);
    setShowPicker(false);
  };

  return (
    <div
      className="flex flex-col gap-6 px-4 pt-safe pb-28"
      style={{ backgroundColor: "var(--app-bg)", minHeight: "100dvh" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between pt-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--app-text-primary)" }}>
          Takvim
        </h1>
      </header>

      {/* Calendar Grid */}
      <div
        className="rounded-3xl p-4 border backdrop-blur-xl"
        style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          {/* Clickable Month/Year Heading */}
          <button
            onClick={() => { setShowPicker((v) => !v); setPickerYear(currentDate.getFullYear()); }}
            className="flex items-center gap-1 rounded-xl px-2 py-1 transition-colors active:scale-95"
            style={{ color: "var(--app-text-primary)" }}
          >
            <span className="text-lg font-medium capitalize">
              {format(currentDate, "MMMM yyyy", { locale: tr })}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", showPicker && "rotate-180")}
              style={{ color: "var(--app-text-secondary)" }}
            />
          </button>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: "var(--app-input-bg)", color: "var(--app-text-secondary)" }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: "var(--app-input-bg)", color: "var(--app-text-secondary)" }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Month/Year Picker Dropdown */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="mb-4 rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "var(--app-dropdown-bg)", borderColor: "var(--app-surface-border)" }}
            >
              {/* Year selector */}
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--app-surface-border)" }}>
                <button
                  onClick={() => setPickerYear(y => y - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--app-input-bg)", color: "var(--app-text-secondary)" }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-base font-semibold" style={{ color: "var(--app-text-primary)" }}>{pickerYear}</span>
                <button
                  onClick={() => setPickerYear(y => y + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: "var(--app-input-bg)", color: "var(--app-text-secondary)" }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {/* Month grid */}
              <div className="grid grid-cols-3 gap-1 p-3">
                {MONTHS.map((month, i) => {
                  const isActive = i === currentDate.getMonth() && pickerYear === currentDate.getFullYear();
                  return (
                    <button
                      key={month}
                      onClick={() => handlePickMonth(i)}
                      className="flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-all active:scale-95"
                      style={
                        isActive
                          ? { backgroundColor: "#6366f1", color: "#ffffff" }
                          : { backgroundColor: "var(--app-input-bg)", color: "var(--app-text-primary)" }
                      }
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
            <div key={day} className="text-[10px] font-medium" style={{ color: "var(--app-text-secondary)" }}>
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((_, i) => (
            <div key={`empty-${i}`} className="h-10 w-full" />
          ))}
          {daysInMonth.map((day, idx) => {
            const hasExpense = expenses.some((e) => e.dueDay === day.getDate());
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const todayDay = isToday(day);

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "relative flex h-10 w-full flex-col items-center justify-center rounded-full text-sm transition-all duration-200",
                  !isCurrentMonth ? "pointer-events-none opacity-20" : "",
                  todayDay && !isSelected ? "ring-1 ring-indigo-500/50" : ""
                )}
                style={{
                  backgroundColor: isSelected && isCurrentMonth ? "#6366f1" : "transparent",
                  color: isSelected && isCurrentMonth
                    ? "#ffffff"
                    : "var(--app-text-primary)",
                  fontWeight: isSelected ? 700 : 400,
                }}
              >
                <span>{format(day, "d")}</span>
                {hasExpense && isCurrentMonth && (
                  <span
                    className="absolute bottom-1 h-1 w-1 rounded-full"
                    style={{ backgroundColor: isSelected ? "#ffffff" : "#818cf8" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium px-2" style={{ color: "var(--app-text-secondary)" }}>
          {format(selectedDate, "d MMMM yyyy", { locale: tr })}
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--app-text-secondary)" }} />
          </div>
        ) : selectedDayExpenses.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedDayExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex h-[72px] items-center gap-4 rounded-3xl p-3 pr-5 border backdrop-blur-xl"
                style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}
              >
                <div className="h-12 w-12 shrink-0">
                  <BrandLogo domain={expense.domain} name={expense.name} fallbackIcon={expense.icon} fallbackColor={expense.color} />
                </div>
                <div className="flex flex-1 flex-col min-w-0 justify-center">
                  <span className="text-[15px] font-medium truncate" style={{ color: "var(--app-text-primary)" }}>
                    {expense.name}
                  </span>
                </div>
                <div className="shrink-0 text-sm font-semibold" style={{ color: "var(--app-text-primary)" }}>
                  {currencySymbol}{formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed"
            style={{ backgroundColor: "var(--app-card-bg)", borderColor: "var(--app-surface-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>Bu tarihte ödeme yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
