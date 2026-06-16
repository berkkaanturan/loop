"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DbExpense, Expense } from "@/lib/types";
import { dbExpenseToExpense } from "@/lib/data";

interface ExpensesContextType {
  expenses: Expense[];
  loading: boolean;
  refreshExpenses: () => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType>({
  expenses: [],
  loading: true,
  refreshExpenses: async () => {},
});

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshExpenses = useCallback(async () => {
    try {
      const supabase = createClient();
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
    <ExpensesContext.Provider value={{ expenses, loading, refreshExpenses }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export const useExpenses = () => useContext(ExpensesContext);
