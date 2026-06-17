"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense } from "@/lib/types";
import { dbExpenseToExpense } from "@/lib/data";

interface ExpensesContextType {
  expenses: Expense[];
  loading: boolean;
  refreshExpenses: () => Promise<void>;
  currency: string;
  currencySymbol: string;
  setCurrency: (c: string) => void;
}

const ExpensesContext = createContext<ExpensesContextType>({
  expenses: [],
  loading: true,
  refreshExpenses: async () => {},
  currency: "TRY",
  currencySymbol: "₺",
  setCurrency: () => {},
});

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("TRY");
  const [currencySymbol, setCurrencySymbol] = useState("₺");

  useEffect(() => {
    // Load initial currency from localStorage if available
    const storedCurrency = typeof window !== "undefined" ? localStorage.getItem("loop-currency") : null;
    if (storedCurrency) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrency(storedCurrency);
    }
  }, []);

  // Sync symbol when currency changes
  useEffect(() => {
    import("@/lib/data").then(({ CURRENCIES }) => {
      const cur = CURRENCIES.find((c) => c.code === currency);
      if (cur) {
        setCurrencySymbol(cur.symbol);
      }
    });
  }, [currency]);

  // Optionally load from user_metadata in refreshExpenses
  const refreshExpenses = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // Load user currency preference
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.currency) {
        setCurrency(user.user_metadata.currency);
        localStorage.setItem("loop-currency", user.user_metadata.currency);
      }

      const { data } = await supabase.from("expenses").select("*").order("billing_day", { ascending: true });
      if (data) {
        setExpenses((data as DbExpense[]).map(dbExpenseToExpense));
      }
    } catch (err) {
      console.error("Giderler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    refreshExpenses();
  }, [refreshExpenses]);

  return (
    <ExpensesContext.Provider value={{ expenses, loading, refreshExpenses, currency, currencySymbol, setCurrency }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export const useExpenses = () => useContext(ExpensesContext);
