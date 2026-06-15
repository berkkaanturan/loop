// ─── DB-aligned types ─────────────────────────────────────────────────────────

/** Category values matching the Supabase 'expenses' table CHECK constraint */
export type ExpenseCategory = "digital" | "bank" | "lifestyle" | "other";

/**
 * Supabase row — what we get back from the DB.
 * user_id and created_at are server-generated; we don't send them on INSERT.
 */
export interface DbExpense {
  id: string;          // uuid
  user_id: string;     // uuid → auth.users
  name: string;
  amount: number;      // numeric
  category: ExpenseCategory;
  billing_day: number; // 1–31
  domain?: string;     // text (nullable) - for Brandfetch
  created_at: string;  // ISO timestamp
}

// ─── UI-layer types ────────────────────────────────────────────────────────────

/**
 * Rich display object derived from DbExpense + computed icon/color metadata.
 * Used throughout UI components; never stored in the DB.
 */
export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  currency: "₺";
  dueDay: number;   // billing_day aliased for UI
  icon?: string;    // emoji or undefined
  color: string;    // Tailwind classes like "bg-red-500/15 text-red-400"
  domain?: string;  // domain for icon.horse
  isActive: boolean;
}

export interface UpcomingPayment {
  id: string;
  name: string;
  amount: number;
  currency: "₺";
  dueDate: string; // ISO date string
  daysUntil: number;
  icon?: string;
  color: string;
  domain?: string;
}

// ─── Form types ────────────────────────────────────────────────────────────────

export interface NewExpenseForm {
  name: string;
  amount: string;        // string while user types; parsed to number on submit
  category: ExpenseCategory;
  billing_day: number;
  domain?: string;       // captured from Brandfetch search
}
