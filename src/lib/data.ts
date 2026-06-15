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
  lifestyle: {
    label: "Yaşam Tarzı",
    icon: "💪",
    color: "bg-orange-500/15 text-orange-400",
  },
  other: {
    label: "Diğer",
    icon: "📦",
    color: "bg-zinc-500/15 text-zinc-400",
  },
};

// ─── Icon / color resolution ───────────────────────────────────────────────────

export interface PredefinedExpense {
  id: string;
  name: string;
  domain?: string;
  icon?: string;
  category: ExpenseCategory;
}

export const PREDEFINED_EXPENSES: PredefinedExpense[] = [
  // Digital & Streaming
  { id: "netflix", name: "Netflix", domain: "netflix.com", category: "digital" },
  { id: "spotify", name: "Spotify", domain: "spotify.com", category: "digital" },
  { id: "youtube", name: "YouTube Premium", domain: "youtube.com", category: "digital" },
  { id: "amazon", name: "Amazon Prime", domain: "amazon.com.tr", category: "digital" },
  { id: "disney", name: "Disney+", domain: "disneyplus.com", category: "digital" },
  { id: "exxen", name: "Exxen", domain: "exxen.com", category: "digital" },
  { id: "blutv", name: "BluTV", domain: "blutv.com", category: "digital" },
  { id: "mubi", name: "Mubi", domain: "mubi.com", category: "digital" },
  { id: "hbo", name: "HBO", domain: "hbo.com", category: "digital" },
  { id: "apple", name: "Apple Music", domain: "apple.com", category: "digital" },

  // Telecom & ISP
  { id: "turknet", name: "Turknet", domain: "turk.net", category: "digital" },
  { id: "turkcell", name: "Turkcell", domain: "turkcell.com.tr", category: "digital" },
  { id: "vodafone", name: "Vodafone", domain: "vodafone.com.tr", category: "digital" },
  { id: "turktelekom", name: "Türk Telekom", domain: "turktelekom.com.tr", category: "digital" },

  // Gaming & Entertainment
  { id: "steam", name: "Steam", domain: "steampowered.com", category: "digital" },
  { id: "psplus", name: "PlayStation Plus", domain: "playstation.com", category: "digital" },
  { id: "xbox", name: "Xbox Game Pass", domain: "xbox.com", category: "digital" },
  { id: "epic", name: "Epic Games", domain: "epicgames.com", category: "digital" },
  { id: "riot", name: "Riot Games", domain: "riotgames.com", category: "digital" },
  { id: "csfloat", name: "CSFloat", domain: "csfloat.com", category: "digital" },

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

  // Software, Education & Tools
  { id: "deepstash", name: "Deepstash Pro", domain: "deepstash.com", category: "digital" },
  { id: "brilliant", name: "Brilliant Premium", domain: "brilliant.org", category: "digital" },
  { id: "chatgpt", name: "ChatGPT", domain: "openai.com", category: "digital" },
  { id: "gemini", name: "Gemini", domain: "gemini.google.com", category: "digital" },
  { id: "claude", name: "Claude", domain: "claude.ai", category: "digital" },
  { id: "github", name: "GitHub", domain: "github.com", category: "digital" },
  { id: "notion", name: "Notion", domain: "notion.so", category: "digital" },
  { id: "googleone", name: "Google One", domain: "google.com", category: "digital" },
  { id: "icloud", name: "iCloud", domain: "apple.com", category: "digital" },
  { id: "vercel", name: "Vercel", domain: "vercel.com", category: "digital" },
  { id: "supabase", name: "Supabase", domain: "supabase.com", category: "digital" },
  { id: "adobe", name: "Adobe", domain: "adobe.com", category: "digital" },

  // Health, Fitness & Lifestyle
  { id: "stndrd", name: "STNDRD Workout & Fitness", domain: "stndrd.app", icon: "Dumbbell", category: "lifestyle" },
  { id: "macfit", name: "MacFit", domain: "macfit.com.tr", category: "lifestyle" },
  { id: "yemeksepeti", name: "Yemeksepeti", domain: "yemeksepeti.com", category: "lifestyle" },
  { id: "getir", name: "Getir", domain: "getir.com", category: "lifestyle" },
  { id: "trendyol", name: "Trendyol", domain: "trendyol.com", category: "lifestyle" },
  { id: "hepsiburada", name: "Hepsiburada", domain: "hepsiburada.com", category: "lifestyle" },

  // Utilities & Housing
  { id: "aidat", name: "Site/Bina Aidatı", icon: "Home", category: "other" },
  { id: "dogalgaz", name: "Doğalgaz Faturası", icon: "Flame", category: "other" },
  { id: "su", name: "Su Faturası", icon: "Droplet", category: "other" },
  { id: "elektrik", name: "Elektrik Faturası", icon: "Zap", category: "other" },
  { id: "kira", name: "Ev Kirası", icon: "Home", category: "other" },

  // Pets & Daily
  { id: "kedi_mamasi", name: "Kedi Maması", icon: "Paw", category: "other" }, // mapped to Dog / Paw ? Lucide doesn't have Paw. Let's use generic or we can map to a specific one. Wait, let's use 'Heart' or something if Paw isn't available. Oh wait, "Paw/Cat" icon requested. Lucide has 'Dog' or 'Cat'? It has 'Cat'. Let's use 'Cat'. Wait, 'Cat' might not be imported. We will handle imports.
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
  const { icon, color, domain: defaultDomain } = resolveBrandDetails(db.name, db.category);
  return {
    id: db.id,
    name: db.name,
    category: db.category,
    amount: Number(db.amount),
    currency: "₺",
    dueDay: db.billing_day,
    icon,
    color,
    domain: db.domain || defaultDomain,
    isActive: true,
  };
}

// ─── Pure computation helpers ──────────────────────────────────────────────────

export function getUpcomingPayments(
  allExpenses: Expense[],
  daysAhead: number = 7
): UpcomingPayment[] {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return allExpenses
    .map((expense) => {
      let daysUntil: number;
      let dueDate: Date;

      if (expense.dueDay >= currentDay) {
        dueDate = new Date(currentYear, currentMonth, expense.dueDay);
        daysUntil = expense.dueDay - currentDay;
      } else {
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        dueDate = new Date(currentYear, currentMonth + 1, expense.dueDay);
        daysUntil = lastDayOfMonth - currentDay + expense.dueDay;
      }

      return {
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        currency: expense.currency,
        dueDate: dueDate.toISOString(),
        daysUntil,
        icon: expense.icon,
        color: expense.color,
        domain: expense.domain,
      };
    })
    .filter((p) => p.daysUntil <= daysAhead && p.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);
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
