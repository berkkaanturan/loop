"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Wallet,
  Loader2,
  Search,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { ExpenseCategory, NewExpenseForm } from "@/lib/types";
import { PREDEFINED_EXPENSES } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { CategoryIcon } from "@/components/category-icon";
import { useExpenses } from "@/lib/expenses-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const POPULAR_PRESETS = [
  { name: "Netflix", domain: "netflix.com", icon: "🎬", color: "bg-red-500/15 text-red-500", category: "digital" as ExpenseCategory },
  { name: "Spotify", domain: "spotify.com", icon: "🎧", color: "bg-green-500/15 text-green-500", category: "digital" as ExpenseCategory },
  { name: "YouTube", domain: "youtube.com", icon: "▶️", color: "bg-red-600/15 text-red-600", category: "digital" as ExpenseCategory },
  { name: "HBO", domain: "hbo.com", icon: "📺", color: "bg-purple-500/15 text-purple-500", category: "digital" as ExpenseCategory },
];

type Preset = typeof POPULAR_PRESETS[0];

export default function EklePage() {
  const router = useRouter();
  const { refreshExpenses } = useExpenses();

  const [form, setForm] = useState<NewExpenseForm>({
    name: "",
    amount: "",
    category: "digital",
    billing_day: new Date().getDate(),
    expense_type: "subscription",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const dayPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
      if (dayPickerRef.current && !dayPickerRef.current.contains(event.target as Node)) {
        setIsDayPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Gider adı boş olamaz.");
      return;
    }
    const parsedAmount = parseFloat(form.amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Geçerli bir tutar giriniz.");
      return;
    }
    if (!form.billing_day || form.billing_day < 1 || form.billing_day > 31) {
      alert("Ödeme günü 1 ile 31 arasında olmalıdır.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Oturum bulunamadı");

      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        name: form.name.trim(),
        amount: parsedAmount,
        category: form.category,
        billing_day: form.billing_day,
        domain: form.domain || null,
        expense_type: form.expense_type,
      });

      if (error) throw error;

      await refreshExpenses();

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: unknown) {
      console.error("Kayıt hatası:", err);
      const message = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      alert(`Kayıt başarısız: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSuggestions = PREDEFINED_EXPENSES.filter((expense) => {
    if (!form.name.trim()) return false;
    return expense.name.toLocaleLowerCase("tr-TR").includes(form.name.toLocaleLowerCase("tr-TR"));
  }).slice(0, 5);

  const applyPreset = (preset: Preset) => {
    setForm((prev: NewExpenseForm) => ({
      ...prev,
      name: preset.name,
      domain: preset.domain,
      category: preset.category,
      expense_type: "subscription",
    }));
  };

  return (
    <div
      className="flex flex-col gap-6 px-4 pt-safe pb-28"
      style={{ backgroundColor: "var(--app-bg)", minHeight: "100dvh", color: "var(--app-text-primary)" }}
    >
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center gap-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border transition-all active:scale-95"
          style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)", color: "var(--app-text-primary)" }}
          aria-label="Geri Dön"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--app-text-primary)" }}>Yeni Ekle</h1>
      </header>

      {/* ─── Form ───────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Tür Seçimi - Sliding Pill */}
        <div className="flex justify-center w-full">
          <div
            className="relative flex h-12 w-full max-w-[300px] items-center rounded-full p-1 backdrop-blur-xl border shadow-inner"
            style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
          >
            <div className="relative flex h-full w-full">
              <motion.div
                layout
                className="absolute top-0 bottom-0 rounded-full shadow-sm"
                style={{ backgroundColor: "var(--app-input-bg)" }}
                initial={false}
                animate={{ width: "55%", left: form.expense_type === "subscription" ? "0%" : "45%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <motion.button
                layout
                type="button"
                onClick={() => setForm({ ...form, expense_type: "subscription" })}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                animate={{ width: form.expense_type === "subscription" ? "55%" : "45%" }}
                className="relative z-10 flex items-center justify-center rounded-full text-sm font-medium h-full transition-colors"
                style={{ color: form.expense_type === "subscription" ? "var(--app-text-primary)" : "var(--app-text-secondary)" }}
              >
                Abonelik
              </motion.button>
              <motion.button
                layout
                type="button"
                onClick={() => setForm({ ...form, expense_type: "bill" })}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                animate={{ width: form.expense_type === "bill" ? "55%" : "45%" }}
                className="relative z-10 flex items-center justify-center rounded-full text-sm font-medium h-full transition-colors"
                style={{ color: form.expense_type === "bill" ? "var(--app-text-primary)" : "var(--app-text-secondary)" }}
              >
                Fatura
              </motion.button>
            </div>
          </div>
        </div>

        {/* Hızlı Öneriler (Presets) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {POPULAR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="flex h-10 items-center gap-2 rounded-full border px-3 pr-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)", color: "var(--app-text-secondary)" }}
            >
              <div className="h-6 w-6 shrink-0">
                <BrandLogo domain={preset.domain} name={preset.name} />
              </div>
              {preset.name}
            </button>
          ))}
        </div>

        <div
          className="rounded-3xl border overflow-visible backdrop-blur-xl"
          style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
        >
          <div className="flex flex-col gap-6 p-6">
            {/* Gider Adı & Arama */}
            <div className="flex flex-col gap-2 relative" ref={filterRef}>
              <label htmlFor="name" className="text-sm font-medium" style={{ color: "var(--app-text-secondary)" }}>
                Gider Adı
              </label>
              <div className="relative flex items-center">
                {form.domain ? (
                  <div className="absolute left-4 h-6 w-6 shrink-0 z-10">
                    <BrandLogo domain={form.domain} name={form.name} />
                  </div>
                ) : (
                  <Search className="absolute left-4 h-5 w-5 z-10" style={{ color: "var(--app-text-secondary)" }} />
                )}
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value, domain: undefined });
                    setIsFocused(true);
                  }}
                  onFocus={() => setIsFocused(true)}
                  className={cn(
                    "h-14 rounded-2xl border-0 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all",
                    form.domain ? "pl-14" : "pl-12"
                  )}
                  style={{ backgroundColor: "var(--app-input-bg)", color: "var(--app-text-primary)" }}
                  placeholder="Örn. Netflix, Turkcell, Su..."
                  autoComplete="off"
                />
              </div>

              {/* Suggestions Dropdown */}
              {isFocused && filteredSuggestions.length > 0 && (
                <div
                  className="absolute top-[80px] left-0 right-0 z-50 overflow-hidden rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-top-2"
                  style={{ backgroundColor: "var(--app-dropdown-bg)", borderColor: "var(--app-surface-border)" }}
                >
                  <div className="flex flex-col py-2">
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.name}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, name: suggestion.name, domain: suggestion.domain, category: suggestion.category });
                          setIsFocused(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                      >
                        <div className="h-8 w-8 shrink-0">
                          <BrandLogo domain={suggestion.domain} name={suggestion.name} fallbackIcon={suggestion.icon} />
                        </div>
                        <span className="flex-1 text-sm font-medium" style={{ color: "var(--app-text-primary)" }}>{suggestion.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tutar */}
            <div className="flex flex-col gap-2">
              <label htmlFor="amount" className="text-sm font-medium" style={{ color: "var(--app-text-secondary)" }}>
                Aylık Tutar (₺)
              </label>
              <div className="relative flex items-center">
                <Wallet className="absolute left-4 h-5 w-5" style={{ color: "var(--app-text-secondary)" }} />
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, "");
                    setForm({ ...form, amount: val });
                  }}
                  className="h-14 pl-12 rounded-2xl border-0 text-base font-semibold shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all"
                  style={{ backgroundColor: "var(--app-input-bg)", color: "var(--app-text-primary)" }}
                  placeholder="0.00"
                />
                <div className="absolute right-4 font-medium" style={{ color: "var(--app-text-secondary)" }}>TRY</div>
              </div>
            </div>

            {/* Fatura Kesim Tarihi - Custom Number Input + Grid Dropdown */}
            <div className="flex flex-col gap-2 relative" ref={dayPickerRef}>
              <label htmlFor="billing_day" className="text-sm font-medium" style={{ color: "var(--app-text-secondary)" }}>
                Ödeme Günü
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-4 h-5 w-5" style={{ color: "var(--app-text-secondary)" }} />
                <Input
                  id="billing_day"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={31}
                  value={form.billing_day || ""}
                  onFocus={() => setIsDayPickerOpen(true)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setForm({ ...form, billing_day: isNaN(val) ? "" as any : val });
                  }}
                  className="h-14 pl-12 pr-12 rounded-2xl border-0 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all"
                  style={{ backgroundColor: "var(--app-input-bg)", color: "var(--app-text-primary)" }}
                />
                <div className="absolute right-4 text-sm font-medium pointer-events-none" style={{ color: "var(--app-text-secondary)" }}>.Gün</div>
              </div>

              <AnimatePresence>
                {isDayPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[80px] left-0 right-0 z-50 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl"
                    style={{ backgroundColor: "var(--app-dropdown-bg)", borderColor: "var(--app-surface-border)" }}
                  >
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => { setForm({ ...form, billing_day: day }); setIsDayPickerOpen(false); }}
                          className="flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-all"
                          style={
                            form.billing_day === day
                              ? { backgroundColor: "#6366f1", color: "#ffffff" }
                              : { backgroundColor: "var(--app-input-bg)", color: "var(--app-text-primary)" }
                          }
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Kategori Seçimi */}
            <div className="flex flex-col gap-2 pt-2">
              <label className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--app-text-secondary)" }}>
                <Tag className="h-4 w-4" /> Kategori
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "digital", label: "Dijital" },
                  { id: "bank", label: "Banka" },
                  { id: "lifestyle", label: "Yaşam" },
                  { id: "other", label: "Diğer" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.id as ExpenseCategory })}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all active:scale-[0.98]"
                    style={
                      form.category === cat.id
                        ? { borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)", color: "#818cf8" }
                        : { borderColor: "var(--app-surface-border)", backgroundColor: "var(--app-input-bg)", color: "var(--app-text-secondary)" }
                    }
                  >
                    <CategoryIcon category={cat.id} className="h-4 w-4" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "var(--app-text-primary)", color: "var(--app-bg)" }}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>Kaydet</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
