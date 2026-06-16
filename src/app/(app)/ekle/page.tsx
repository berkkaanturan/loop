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
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { NewExpenseForm, ExpenseCategory } from "@/lib/types";
import { PREDEFINED_EXPENSES } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const POPULAR_PRESETS = [
  { name: "Netflix", domain: "netflix.com", icon: "🎬", color: "bg-red-500/15 text-red-500", category: "digital" as ExpenseCategory },
  { name: "Spotify", domain: "spotify.com", icon: "🎧", color: "bg-green-500/15 text-green-500", category: "digital" as ExpenseCategory },
  { name: "YouTube", domain: "youtube.com", icon: "▶️", color: "bg-red-600/15 text-red-600", category: "digital" as ExpenseCategory },
  { name: "HBO", domain: "hbo.com", icon: "📺", color: "bg-purple-500/15 text-purple-500", category: "digital" as ExpenseCategory },
];

export default function EklePage() {
  const router = useRouter();

  const [form, setForm] = useState<NewExpenseForm>({
    name: "",
    amount: "",
    category: "digital",
    billing_day: new Date().getDate(),
    expense_type: "subscription",
  });
  const [submitting, setSubmitting] = useState(false);
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
      setTimeout(() => router.push("/abonelikler"), 400);
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

  const applyPreset = (preset: any) => {
    setForm(prev => ({
      ...prev,
      name: preset.name,
      domain: preset.domain,
      category: preset.category,
      expense_type: "subscription",
    }));
  };

  return (
    <div className="flex flex-col gap-6 px-4 pt-safe pb-24 min-h-screen bg-black text-white">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center gap-4 pt-6">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-white/5 transition-all hover:bg-zinc-800 active:scale-95"
          aria-label="Geri Dön"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Yeni Ekle</h1>
      </header>

      {/* ─── Form ───────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Tür Seçimi - Sliding Pill */}
        <div className="flex justify-center w-full">
          <div className="relative flex h-12 w-full max-w-[300px] items-center rounded-full bg-zinc-900/60 p-1 backdrop-blur-xl border border-white/5 shadow-inner">
            <div className="relative flex h-full w-full">
              {/* Sliding Background */}
              <motion.div
                layout
                className="absolute top-0 bottom-0 rounded-full bg-zinc-800 shadow-sm"
                initial={false}
                animate={{
                  width: "55%", 
                  left: form.expense_type === "subscription" ? "0%" : "45%"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              
              <motion.button
                layout
                type="button"
                onClick={() => setForm({ ...form, expense_type: "subscription" })}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors h-full",
                  form.expense_type === "subscription" ? "text-white w-[55%]" : "text-zinc-500 hover:text-zinc-300 w-[45%]"
                )}
              >
                Abonelik
              </motion.button>
              <motion.button
                layout
                type="button"
                onClick={() => setForm({ ...form, expense_type: "bill" })}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors h-full",
                  form.expense_type === "bill" ? "text-white w-[55%]" : "text-zinc-500 hover:text-zinc-300 w-[45%]"
                )}
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
              className="flex h-10 items-center gap-2 rounded-full bg-zinc-900 border border-white/5 px-3 pr-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 whitespace-nowrap shrink-0"
            >
              <div className="h-6 w-6 shrink-0">
                <BrandLogo domain={preset.domain} name={preset.name} />
              </div>
              {preset.name}
            </button>
          ))}
        </div>

        <Card className="border border-white/5 bg-zinc-900/60 rounded-3xl overflow-visible">
          <CardContent className="flex flex-col gap-6 p-6">
            {/* Gider Adı & Arama */}
            <div className="flex flex-col gap-2 relative" ref={filterRef}>
              <label htmlFor="name" className="text-sm font-medium text-zinc-400">
                Gider Adı
              </label>
              <div className="relative flex items-center">
                {form.domain ? (
                  <div className="absolute left-4 h-6 w-6 shrink-0 z-10">
                    <BrandLogo domain={form.domain} name={form.name} />
                  </div>
                ) : (
                  <Search className="absolute left-4 h-5 w-5 text-zinc-500 z-10" />
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
                    "h-14 rounded-2xl bg-zinc-800 border-white/5 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all text-white",
                    form.domain ? "pl-14" : "pl-12"
                  )}
                  placeholder="Örn. Netflix, Turkcell, Su..."
                  autoComplete="off"
                />
              </div>

              {/* Suggestions Dropdown */}
              {isFocused && filteredSuggestions.length > 0 && (
                <div className="absolute top-[80px] left-0 right-0 z-50 overflow-hidden rounded-2xl bg-zinc-800 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col py-2">
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.name}
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            name: suggestion.name,
                            domain: suggestion.domain,
                            category: suggestion.category,
                          });
                          setIsFocused(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                      >
                        <div className="h-8 w-8 shrink-0">
                          <BrandLogo
                            domain={suggestion.domain}
                            name={suggestion.name}
                            fallbackIcon={suggestion.icon}
                          />
                        </div>
                        <span className="flex-1 text-sm font-medium text-white">{suggestion.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tutar */}
            <div className="flex flex-col gap-2">
              <label htmlFor="amount" className="text-sm font-medium text-zinc-400">
                Aylık Tutar (₺)
              </label>
              <div className="relative flex items-center">
                <Wallet className="absolute left-4 h-5 w-5 text-zinc-500" />
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, "");
                    setForm({ ...form, amount: val });
                  }}
                  className="h-14 pl-12 rounded-2xl bg-zinc-800 border-white/5 text-base font-semibold shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all text-white"
                  placeholder="0.00"
                />
                <div className="absolute right-4 text-zinc-400 font-medium">TRY</div>
              </div>
            </div>

            {/* Fatura Kesim Tarihi - Custom Number Input + Grid Dropdown */}
            <div className="flex flex-col gap-2 relative" ref={dayPickerRef}>
              <label htmlFor="billing_day" className="text-sm font-medium text-zinc-400">
                Ödeme Günü
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-4 h-5 w-5 text-zinc-500" />
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
                  className="h-14 pl-12 pr-12 rounded-2xl bg-zinc-800 border-white/5 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all text-white"
                />
                <div className="absolute right-4 text-sm text-zinc-500 font-medium pointer-events-none">.Gün</div>
              </div>

              <AnimatePresence>
                {isDayPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[80px] left-0 right-0 z-50 p-4 rounded-2xl bg-zinc-800 shadow-2xl border border-white/10"
                  >
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, billing_day: day });
                            setIsDayPickerOpen(false);
                          }}
                          className={cn(
                            "flex h-10 items-center justify-center rounded-xl text-sm font-medium transition-all",
                            form.billing_day === day
                              ? "bg-indigo-500 text-white"
                              : "bg-zinc-900/50 text-zinc-300 hover:bg-zinc-700"
                          )}
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
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Tag className="h-4 w-4" /> Kategori
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "digital", label: "Dijital", icon: "📱" },
                  { id: "bank", label: "Banka", icon: "💳" },
                  { id: "lifestyle", label: "Yaşam", icon: "💪" },
                  { id: "other", label: "Diğer", icon: "📦" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.id as ExpenseCategory })}
                    className={cn(
                      "flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all active:scale-[0.98]",
                      form.category === cat.id
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                        : "border-white/5 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                    )}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-black font-semibold shadow-lg shadow-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
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
