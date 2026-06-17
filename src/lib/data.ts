import type { DbExpense, Expense, ExpenseCategory, UpcomingPayment } from "./types";

// ─── Category metadata ─────────────────────────────────────────────────────────

export interface CategoryMeta {
  label: string;         // Turkish display name
  icon: string;          // emoji
  color: string;         // Tailwind classes
}

export const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  digital: {
    label: "Dijital",
    icon: "💻",
    color: "bg-violet-500/15 text-violet-400",
  },
  bank: {
    label: "Banka / Finans",
    icon: "💳",
    color: "bg-blue-500/15 text-blue-400",
  },
  social: {
    label: "Sosyal",
    icon: "🍻",
    color: "bg-orange-500/15 text-orange-400",
  },
  travel: {
    label: "Seyahat",
    icon: "✈️",
    color: "bg-teal-500/15 text-teal-400",
  },
  personal_care: {
    label: "Kişisel Bakım",
    icon: "💆",
    color: "bg-pink-500/15 text-pink-400",
  },
  other: {
    label: "Diğer",
    icon: "📦",
    color: "bg-zinc-500/15 text-zinc-400",
  },
};

export const CURRENCIES = [
  { code: "TRY", symbol: "₺", label: "Türk Lirası", flag: "🇹🇷" },
  { code: "USD", symbol: "$", label: "Amerikan Doları", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", label: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", label: "İngiliz Sterlini", flag: "🇬🇧" },
];

// ─── Icon / color resolution ───────────────────────────────────────────────────

export interface PredefinedExpense {
  id: string;
  name: string;
  domain?: string;
  icon?: string;
  category: ExpenseCategory;
  /** If set, autocomplete sets this expense_type when selected */
  expenseType?: "subscription" | "bill";
}

export const PREDEFINED_EXPENSES: PredefinedExpense[] = [
  // Digital & Streaming (Subscriptions)
  { id: "netflix", name: "Netflix", domain: "netflix.com", category: "digital", expenseType: "subscription" },
  { id: "spotify", name: "Spotify", domain: "spotify.com", category: "digital", expenseType: "subscription" },
  { id: "youtube", name: "YouTube Premium", domain: "youtube.com", category: "digital", expenseType: "subscription" },
  { id: "amazon", name: "Amazon Prime", domain: "amazon.com.tr", category: "digital", expenseType: "subscription" },
  { id: "disney", name: "Disney+", domain: "disneyplus.com", category: "digital", expenseType: "subscription" },
  { id: "exxen", name: "Exxen", domain: "exxen.com", category: "digital", expenseType: "subscription" },
  { id: "blutv", name: "BluTV", domain: "blutv.com", category: "digital", expenseType: "subscription" },
  { id: "mubi", name: "Mubi", domain: "mubi.com", category: "digital", expenseType: "subscription" },
  { id: "hbo", name: "HBO", domain: "hbo.com", category: "digital", expenseType: "subscription" },
  { id: "apple", name: "Apple Music", domain: "apple.com", category: "digital", expenseType: "subscription" },

  // Telecom & ISP — recurring BILLS
  { id: "turknet", name: "Turknet", domain: "turk.net", category: "digital", expenseType: "bill" },
  { id: "turkcell", name: "Turkcell", domain: "turkcell.com.tr", category: "digital", expenseType: "bill" },
  { id: "vodafone", name: "Vodafone", domain: "vodafone.com.tr", category: "digital", expenseType: "bill" },
  { id: "turktelekom", name: "Türk Telekom", domain: "turktelekom.com.tr", category: "digital", expenseType: "bill" },

  // Gaming & Entertainment (Subscriptions)
  { id: "steam", name: "Steam", domain: "steampowered.com", category: "digital", expenseType: "subscription" },
  { id: "psplus", name: "PlayStation Plus", domain: "playstation.com", category: "digital", expenseType: "subscription" },
  { id: "xbox", name: "Xbox Game Pass", domain: "xbox.com", category: "digital", expenseType: "subscription" },
  { id: "epic", name: "Epic Games", domain: "epicgames.com", category: "digital", expenseType: "subscription" },
  { id: "riot", name: "Riot Games", domain: "riotgames.com", category: "digital", expenseType: "subscription" },
  { id: "csfloat", name: "CSFloat", domain: "csfloat.com", category: "digital", expenseType: "subscription" },

  // Banks, Finance & Investments
  { id: "garanti", name: "Garanti BBVA", domain: "garantibbva.com.tr", category: "bank" },
  { id: "isbank", name: "İş Bankası", domain: "isbank.com.tr", category: "bank" },
  { id: "yapi", name: "Yapı Kredi", domain: "yapikredi.com.tr", category: "bank" },
  { id: "akbank", name: "Akbank", domain: "akbank.com", category: "bank" },
  { id: "ziraat", name: "Ziraat Bankası", domain: "ziraatbank.com.tr", category: "bank" },
  { id: "qnb", name: "QNB Finansbank", domain: "qnbfinansbank.com", category: "bank" },
  { id: "enpara", name: "Enpara", domain: "enpara.com", category: "bank" },
  { id: "papara", name: "Papara", domain: "papara.com", category: "bank" },
  { id: "bes", name: "Bireysel Emeklilik / BES", icon: "Building2", category: "bank" },
  { id: "yatirim", name: "Yatırım Fonu", icon: "TrendingUp", category: "bank" },

  // Software, Education & Tools (Subscriptions)
  { id: "deepstash", name: "Deepstash Pro", domain: "deepstash.com", category: "digital", expenseType: "subscription" },
  { id: "brilliant", name: "Brilliant Premium", domain: "brilliant.org", category: "digital", expenseType: "subscription" },
  { id: "chatgpt", name: "ChatGPT", domain: "openai.com", category: "digital", expenseType: "subscription" },
  { id: "gemini", name: "Gemini", domain: "gemini.google.com", category: "digital", expenseType: "subscription" },
  { id: "claude", name: "Claude", domain: "claude.ai", category: "digital", expenseType: "subscription" },
  { id: "github", name: "GitHub", domain: "github.com", category: "digital", expenseType: "subscription" },
  { id: "notion", name: "Notion", domain: "notion.so", category: "digital", expenseType: "subscription" },
  { id: "googleone", name: "Google One", domain: "google.com", category: "digital", expenseType: "subscription" },
  { id: "icloud", name: "iCloud", domain: "apple.com", category: "digital", expenseType: "subscription" },
  { id: "vercel", name: "Vercel", domain: "vercel.com", category: "digital", expenseType: "subscription" },
  { id: "supabase", name: "Supabase", domain: "supabase.com", category: "digital", expenseType: "subscription" },
  { id: "adobe", name: "Adobe", domain: "adobe.com", category: "digital", expenseType: "subscription" },

  // Health, Fitness & Lifestyle
  { id: "stndrd", name: "STNDRD Workout & Fitness", domain: "stndrd.app", icon: "Dumbbell", category: "social", expenseType: "subscription" },
  { id: "macfit", name: "MacFit", domain: "macfit.com.tr", category: "social", expenseType: "subscription" },
  { id: "yemeksepeti", name: "Yemeksepeti", domain: "yemeksepeti.com", category: "social" },
  { id: "getir", name: "Getir", domain: "getir.com", category: "social" },
  { id: "trendyol", name: "Trendyol", domain: "trendyol.com", category: "social" },
  { id: "hepsiburada", name: "Hepsiburada", domain: "hepsiburada.com", category: "social" },

  // Utilities & Housing (Bills)
  { id: "aidat", name: "Site/Bina Aidatı", icon: "Home", category: "other", expenseType: "bill" },
  { id: "dogalgaz", name: "Doğalgaz Faturası", icon: "Flame", category: "other", expenseType: "bill" },
  { id: "su", name: "Su Faturası", icon: "Droplet", category: "other", expenseType: "bill" },
  { id: "elektrik", name: "Elektrik Faturası", icon: "Zap", category: "other", expenseType: "bill" },
  { id: "kira", name: "Ev Kirası", icon: "Home", category: "other", expenseType: "bill" },

  // Pets & Daily
  { id: "kedi_mamasi", name: "Kedi Maması", icon: "Cat", category: "other" },
  { id: "kedi_kumu", name: "Kedi Kumu", icon: "Cat", category: "other" },
  { id: "veteriner", name: "Veteriner", icon: "HeartPulse", category: "other" },
  { id: "market", name: "Market Alışverişi", icon: "ShoppingCart", category: "other" }
];

export function resolveBrandDetails(
  name: string,
  category: ExpenseCategory
): { icon?: string; color: string; domain?: string } {
  const nameLower = name.toLowerCase().trim();
  
  // 1. Try matching predefined expenses
  const preset = PREDEFINED_EXPENSES.find(p => p.name.toLowerCase() === nameLower || nameLower.includes(p.name.toLowerCase()));
  if (preset) {
    return {
      icon: preset.icon,
      color: CATEGORY_META[category].color,
      domain: preset.domain
    };
  }

  // Fallback to initial letter
  return {
    icon: undefined,
    color: CATEGORY_META[category].color,
    domain: undefined
  };
}

// ─── DB → UI mapping ───────────────────────────────────────────────────────────

/**
 * Map a raw Supabase row to the rich UI Expense object.
 */
export function dbExpenseToExpense(db: DbExpense): Expense {
  let safeCategory = db.category;
  // @ts-expect-error - legacy database category mapping
  if (safeCategory === "lifestyle") safeCategory = "social";
  if (!CATEGORY_META[safeCategory]) safeCategory = "other";

  const { icon, color, domain: defaultDomain } = resolveBrandDetails(db.name, safeCategory);
  const meta = CATEGORY_META[safeCategory];
  return {
    id: db.id,
    name: db.name,
    category: safeCategory,
    amount: db.amount,
    dueDay: db.billing_day,
    domain: db.domain || defaultDomain,
    expense_type: db.expense_type || "subscription",
    icon: icon || meta?.icon,
    color: color || meta?.color || "bg-zinc-800 text-zinc-300",
    isActive: true,
  };
}

// ─── Pure computation helpers ──────────────────────────────────────────────────

export function getNotificationPayments(
  allExpenses: Expense[],
  daysAhead: number = 7,
  pastDays: number = 7
): UpcomingPayment[] {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return allExpenses
    .map((expense) => {
      // Past: dueDay was earlier this month
      if (expense.dueDay < currentDay) {
        const daysPast = currentDay - expense.dueDay;
        const dueDate = new Date(currentYear, currentMonth, expense.dueDay);
        const lastMonthDue = new Date(currentYear, currentMonth, expense.dueDay);
        if (daysPast <= pastDays) {
          return {
            id: expense.id,
            name: expense.name,
            amount: expense.amount,
            dueDate: lastMonthDue.toISOString(),
            daysUntil: -daysPast,
            isPast: true,
            icon: expense.icon,
            color: expense.color,
            domain: expense.domain,
          } as UpcomingPayment;
        }
        return null;
      }

      // Upcoming: dueDay is today or later in this month
      const daysUntil = expense.dueDay - currentDay;
      const dueDate = new Date(currentYear, currentMonth, expense.dueDay);
      if (daysUntil <= daysAhead) {
        return {
          id: expense.id,
          name: expense.name,
          amount: expense.amount,
          dueDate: dueDate.toISOString(),
          daysUntil,
          isPast: false,
          icon: expense.icon,
          color: expense.color,
          domain: expense.domain,
        } as UpcomingPayment;
      }
      return null;
    })
    .filter((p): p is UpcomingPayment => p !== null)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export function getUpcomingPayments(
  allExpenses: Expense[],
  daysAhead: number = 7
): UpcomingPayment[] {
  return getNotificationPayments(allExpenses, daysAhead, 0);
}

export function getTotalMonthlyExpense(allExpenses: Expense[]): number {
  return allExpenses.reduce((sum, e) => sum + e.amount, 0);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
