"use client";

import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Trash2, Save, ChevronDown, CheckCircle2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { CATEGORY_META, resolveBrandDetails } from "@/lib/data";
import { BrandLogo } from "@/components/brand-logo";
import { CategoryIcon } from "@/components/category-icon";

const DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

interface ExpenseDrawerProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onUpdate: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ExpenseDrawer({ expense, isOpen, onClose, onUpdate, onDelete }: ExpenseDrawerProps) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "digital" as ExpenseCategory,
    billing_day: 1,
  });
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (expense && isOpen) {
      // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      setForm({
        name: expense.name,
        amount: expense.amount.toString(),
        category: expense.category,
        billing_day: expense.dueDay,
      });
      setShowDayPicker(false);
      setShowDeleteConfirm(false);
    }
  }, [expense, isOpen]);

  if (!expense) return null;

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.amount) return;

    setSubmitting(true);
    try {
      await onUpdate(expense!.id, {
        name: form.name.trim(),
        amount: parseFloat(form.amount.replace(",", ".")),
        category: form.category,
        billing_day: form.billing_day,
      });
      onClose(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(expense!.id);
      setShowDeleteConfirm(false);
      onClose(false);
    } finally {
      setDeleting(false);
    }
  }

  const { icon: defaultIcon, color, domain: defaultDomain } = resolveBrandDetails(form.name, form.category);
  const isOriginalName = expense && expense.name === form.name;
  const activeDomain = (isOriginalName && expense?.domain) ? expense.domain : defaultDomain;

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent
          className="border-t"
          style={{ backgroundColor: "var(--app-bg)", borderColor: "var(--app-surface-border)" }}
        >
          <div className="overflow-y-auto max-h-[90dvh]">
            <DrawerHeader className="text-left px-6 pt-6 pb-2">
              <DrawerTitle className="text-xl font-bold" style={{ color: "var(--app-text-primary)" }}>
                Gideri Düzenle
              </DrawerTitle>
              <DrawerDescription style={{ color: "var(--app-text-secondary)" }}>
                Harcama detaylarını güncelleyin veya silin.
              </DrawerDescription>
            </DrawerHeader>

            <form onSubmit={handleUpdate} className="px-6 flex flex-col gap-5 pb-safe" noValidate>
              {/* Header Preview */}
              <div
                className="flex items-center gap-4 p-4 rounded-2xl border"
                style={{ backgroundColor: "var(--app-surface)", borderColor: "var(--app-surface-border)" }}
              >
                <div className="h-14 w-14 shrink-0">
                  <BrandLogo
                    domain={activeDomain}
                    name={form.name || "Gider"}
                    fallbackIcon={defaultIcon}
                    fallbackColor={color}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold" style={{ color: "var(--app-text-primary)" }}>
                    {form.amount ? `₺${form.amount}` : "₺0,00"}
                  </span>
                  <span className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
                    {CATEGORY_META[form.category].label}
                  </span>
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: "var(--app-text-secondary)" }}>Gider Adı</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-12 w-full rounded-xl border px-4 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  style={{
                    backgroundColor: "var(--app-input-bg)",
                    borderColor: "var(--app-surface-border)",
                    color: "var(--app-text-primary)",
                  }}
                />
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: "var(--app-text-secondary)" }}>Tutar (₺)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "var(--app-text-secondary)" }}>₺</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={form.amount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.,]/g, "");
                      setForm((f) => ({ ...f, amount: val }));
                    }}
                    className="h-12 w-full rounded-xl border pl-8 pr-4 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    style={{
                      backgroundColor: "var(--app-input-bg)",
                      borderColor: "var(--app-surface-border)",
                      color: "var(--app-text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: "var(--app-text-secondary)" }}>Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(CATEGORY_META) as ExpenseCategory[]).map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const active = form.category === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setForm((f) => ({ ...f, category: cat }))}
                        className="flex h-11 items-center gap-2 rounded-xl border px-3 text-sm transition-all"
                        style={
                          active
                            ? { borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.1)", color: "#818cf8" }
                            : { borderColor: "var(--app-surface-border)", backgroundColor: "var(--app-input-bg)", color: "var(--app-text-secondary)" }
                        }
                      >
                        <CategoryIcon category={cat} className="h-4 w-4 shrink-0" />
                        <span className="font-medium text-xs">{meta.label}</span>
                        {active && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-indigo-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Billing Day */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-medium" style={{ color: "var(--app-text-secondary)" }}>Ödeme Günü</label>
                <button
                  type="button"
                  onClick={() => setShowDayPicker((v) => !v)}
                  className={cn(
                    "flex h-12 w-full items-center justify-between rounded-xl border px-4 text-sm transition-colors",
                    showDayPicker ? "border-indigo-500 ring-1 ring-indigo-500" : ""
                  )}
                  style={{
                    backgroundColor: "var(--app-input-bg)",
                    borderColor: showDayPicker ? "#6366f1" : "var(--app-surface-border)",
                    color: "var(--app-text-primary)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: "var(--app-text-secondary)" }} />
                    <span>
                      Her ayın <span className="font-semibold text-indigo-400">{form.billing_day}.</span> günü
                    </span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showDayPicker && "rotate-180")} style={{ color: "var(--app-text-secondary)" }} />
                </button>

                {showDayPicker && (
                  <div
                    className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-20 overflow-hidden rounded-xl border shadow-xl backdrop-blur-xl"
                    style={{ backgroundColor: "var(--app-dropdown-bg)", borderColor: "var(--app-surface-border)" }}
                  >
                    <div className="grid grid-cols-7 gap-1 p-3">
                      {DAY_OPTIONS.map((day) => (
                        <button
                          type="button"
                          key={day}
                          onClick={() => {
                            setForm((f) => ({ ...f, billing_day: day }));
                            setShowDayPicker(false);
                          }}
                          className="flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-90"
                          style={
                            form.billing_day === day
                              ? { backgroundColor: "#6366f1", color: "#ffffff" }
                              : { color: "var(--app-text-secondary)" }
                          }
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DrawerFooter className="px-0 pt-2 pb-6 flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors active:scale-95 bg-red-500/10 text-red-500"
                  aria-label="Sil"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> Kaydet</>}
                </button>
              </DrawerFooter>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent
          className="w-[90%] rounded-2xl p-6 border"
          style={{ backgroundColor: "var(--app-dropdown-bg)", borderColor: "var(--app-surface-border)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ color: "var(--app-text-primary)" }}>Emin misiniz?</DialogTitle>
            <DialogDescription style={{ color: "var(--app-text-secondary)" }}>
              <strong style={{ color: "var(--app-text-primary)" }}>{expense.name}</strong> gideri kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3 mt-4 sm:justify-start">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex h-11 flex-1 items-center justify-center rounded-xl font-medium transition-colors"
              style={{ backgroundColor: "var(--app-input-bg)", color: "var(--app-text-primary)" }}
              disabled={deleting}
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 font-medium text-white transition-colors disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sil"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
