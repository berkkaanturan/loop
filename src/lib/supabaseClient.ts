import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Eksik Supabase ortam değişkenleri. " +
      "NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini " +
      ".env.local dosyasında tanımlayın."
  );
}

/**
 * Singleton Supabase client for client-side use.
 * Used in browser components (Client Components).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database row type — mirrors the `expenses` table schema.
 */
export interface DbExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: "digital" | "bank" | "lifestyle" | "other";
  billing_day: number;
  created_at: string;
}
