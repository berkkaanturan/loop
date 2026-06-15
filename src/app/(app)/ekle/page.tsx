"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { ExpenseCategory, NewExpenseForm } from "@/lib/types";
import { CATEGORY_META, resolveBrandDetails, PREDEFINED_EXPENSES, type PredefinedExpense } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";

// ─── Billing day picker options ─────────────────────────────────────────────────
const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function EklePage() {
  const router = useRouter();

  const [form, setForm] = useState<NewExpenseForm>({
    name: "",
    amount: "",
    category: "digital",
    billing_day: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  
  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Close autocomplete on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Local Sync Filter
  const term = form.name.trim().toLowerCase();
  const searchResults = term.length >= 2
    ? PREDEFINED_EXPENSES.filter(p => p.name.toLowerCase().includes(term))
    : [];

  function handleSearchResultSelect(brand: PredefinedExpense) {
    setForm((f) => ({
      ...f,
      name: brand.name,
      category: brand.category,
      domain: brand.domain,
    }));
    setShowAutocomplete(false);
  }

  // ── Form submission ──────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
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
    if (form.billing_day < 1 || form.billing_day > 31) {
      alert("Ödeme günü 1 ile 31 arasında olmalıdır.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");

      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        name: form.name.trim(),
        amount: parsedAmount,
        category: form.category,
        billing_day: form.billing_day,
        domain: form.domain || null,
      });

      if (error) throw error;

      setTimeout(() => router.push("/"), 400);
    } catch (err: unknown) {
      console.error("Kayıt hatası:", err);
      const message = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      alert(`Kayıt başarısız: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  // If the form has a domain (from search), use it. Otherwise rely on resolveBrandDetails.
  const { icon: defaultIcon, color, domain: defaultDomain } = resolveBrandDetails(form.name, form.category);
  const activeDomain = form.domain || defaultDomain;

  return (
    <div className="flex flex-col gap-0 pb-20">
      {/* ─── Top bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/5 bg-zinc-950/80 px-4 py-3 backdrop-blur-xl">
        <Link
          href="/"
          id="back-button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white active:scale-90"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-white">Yeni Gider Ekle</h1>
          <p className="text-xs text-zinc-400">Aylık sabit gider veya abonelik</p>
        </div>
      </div>

      <form
        id="add-expense-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 px-4 pt-6"
        noValidate
      >
        {/* ─── Expense name (Autocomplete) ─────────────────────── */}
        <div className="flex flex-col gap-2" ref={autocompleteRef}>
          <label htmlFor="expense-name" className="text-sm font-medium text-zinc-200">
            Gider Adı <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              id="expense-name"
              type="text"
              required
              placeholder="ör. Netflix, Spotify, MacFit..."
              value={form.name}
              onFocus={() => setShowAutocomplete(true)}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value, domain: undefined }));
                setShowAutocomplete(true);
              }}
              className={cn(
                "h-12 w-full rounded-xl border border-white/10 bg-zinc-900 pl-10 pr-4 text-sm text-white",
                "placeholder:text-zinc-600 outline-none transition-all",
                "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              )}
            />
            
            {/* Autocomplete Dropdown */}
            {showAutocomplete && form.name.trim().length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-30 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900 shadow-xl shadow-black/50">
                {searchResults.length > 0 ? (
                  <div className="flex flex-col p-1">
                    {searchResults.map((brand, idx) => (
                      <button
                        key={`search-${brand.id}-${idx}`}
                        type="button"
                        onClick={() => handleSearchResultSelect(brand)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-800 active:bg-zinc-800"
                      >
                        <div className="h-8 w-8 shrink-0">
                          <BrandLogo
                            domain={brand.domain}
                            name={brand.name}
                            fallbackIcon={brand.icon}
                            fallbackColor={CATEGORY_META[brand.category].color}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-200">{brand.name}</span>
                          {brand.domain && <span className="text-[10px] text-zinc-500">{brand.domain}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    "{form.name}" adında özel bir gider oluşturulacak.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Amount ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label htmlFor="expense-amount" className="text-sm font-medium text-zinc-200">
            Tutar (₺) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
              ₺
            </span>
            <input
              id="expense-amount"
              type="text"
              inputMode="decimal"
              required
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.,]/g, "");
                setForm((f) => ({ ...f, amount: val }));
              }}
              className={cn(
                "h-12 w-full rounded-xl border border-white/10 bg-zinc-900 pl-8 pr-4 text-sm text-white",
                "placeholder:text-zinc-600 outline-none transition-all",
                "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              )}
            />
          </div>
        </div>

        {/* ─── Category selector ──────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-200">Kategori</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(CATEGORY_META) as ExpenseCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const active = form.category === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setForm((f) => ({ ...f, category: cat }))}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-xl border px-4 text-sm transition-all duration-150 active:scale-95",
                    active
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-white/5 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                  )}
                >
                  <span>{meta.icon}</span>
                  <span className="font-medium">{meta.label}</span>
                  {active && <CheckCircle2 className="ml-auto h-4 w-4 text-indigo-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Billing day ─────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-200">
            Ödeme Günü <span className="font-normal text-zinc-500">(ayın kaçında?)</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDayPicker((v) => !v)}
              className={cn(
                "flex h-12 w-full items-center justify-between rounded-xl border bg-zinc-900 px-4 text-sm transition-all",
                showDayPicker ? "border-indigo-500 ring-1 ring-indigo-500" : "border-white/10"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <span className="text-zinc-200">
                  Her ayın <span className="font-semibold text-indigo-400">{form.billing_day}.</span> günü
                </span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-zinc-500 transition-transform duration-200", showDayPicker && "rotate-180")} />
            </button>

            {showDayPicker && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-20 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50">
                <div className="grid grid-cols-7 gap-1 p-3">
                  {DAY_OPTIONS.map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => {
                        setForm((f) => ({ ...f, billing_day: day }));
                        setShowDayPicker(false);
                      }}
                      className={cn(
                        "flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-90",
                        form.billing_day === day
                          ? "bg-indigo-500 text-white"
                          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Preview chip ─────────────────────────────────────── */}
        <div className="mt-2 flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-4">
          <div className="h-12 w-12 shrink-0">
            <BrandLogo
              domain={activeDomain}
              name={form.name || "Gider"}
              fallbackIcon={defaultIcon}
              fallbackColor={color}
            />
          </div>
          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-white truncate">
              {form.name || "Gider Adı"}
            </span>
            <span className="text-xs text-zinc-400">
              {CATEGORY_META[form.category].label} · {form.billing_day}. günü
            </span>
          </div>
          <div className="shrink-0 text-sm font-semibold text-white">
            {form.amount ? `₺${form.amount}` : "₺—"}
          </div>
        </div>

        {/* ─── Submit button ────────────────────────────────────── */}
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "flex h-14 w-full items-center justify-center gap-2 rounded-2xl mt-4",
            "bg-indigo-500 text-white",
            "text-base font-semibold shadow-lg shadow-indigo-500/25",
            "transition-all duration-200 active:scale-[0.97]",
            "disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {submitting ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Kaydediliyor…</>
          ) : (
            <>Gideri Kaydet</>
          )}
        </button>
      </form>
    </div>
  );
}
