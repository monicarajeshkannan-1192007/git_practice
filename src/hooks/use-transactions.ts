"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Transaction, TransactionType } from "@/lib/expense";

const STORAGE_KEY = "expense-tracker:transactions";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isValidTransaction(value: unknown): value is Transaction {
  if (typeof value !== "object" || value === null) return false;
  const tx = value as Record<string, unknown>;
  return (
    typeof tx.id === "string" &&
    typeof tx.description === "string" &&
    typeof tx.amount === "number" &&
    Number.isFinite(tx.amount) &&
    (tx.type === "income" || tx.type === "expense") &&
    typeof tx.category === "string" &&
    typeof tx.createdAt === "string"
  );
}

export interface AddTransactionInput {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

/**
 * Transactions state persisted in localStorage so data survives page refreshes.
 * Loading happens after mount (inside an effect) to avoid SSR hydration issues;
 * `isLoaded` lets the UI render skeletons until hydration is complete.
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted transactions once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, an external system
          setTransactions(parsed.filter(isValidTransaction));
        }
      }
    } catch {
      // Corrupted storage — start fresh rather than crashing.
      setTransactions([]);
    }
    setIsLoaded(true);
  }, []);

  // Persist on every change (after initial hydration).
  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // Storage may be unavailable (private mode / quota) — fail silently.
    }
  }, [transactions, isLoaded]);

  const addTransaction = useCallback((input: AddTransactionInput) => {
    const transaction: Transaction = {
      id: createId(),
      description: input.description.trim(),
      amount: input.amount,
      type: input.type,
      category: input.category,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [transaction, ...prev]);
    return transaction;
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    let removed: Transaction | undefined;
    setTransactions((prev) => {
      removed = prev.find((t) => t.id === id);
      return prev.filter((t) => t.id !== id);
    });
    return removed;
  }, []);

  const restoreTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  const clearAll = useCallback(() => setTransactions([]), []);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      count: transactions.length,
    };
  }, [transactions]);

  return {
    transactions,
    isLoaded,
    totals,
    addTransaction,
    deleteTransaction,
    restoreTransaction,
    clearAll,
  };
}
