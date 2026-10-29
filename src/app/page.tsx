"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Wallet } from "lucide-react";
import { SummaryCards } from "@/components/expense/summary-cards";
import { TransactionForm } from "@/components/expense/transaction-form";
import { TransactionList } from "@/components/expense/transaction-list";
import { CategoryPieChart } from "@/components/expense/category-pie-chart";
import { useTransactions } from "@/hooks/use-transactions";

export default function Home() {
  const {
    transactions,
    isLoaded,
    totals,
    addTransaction,
    deleteTransaction,
    restoreTransaction,
  } = useTransactions();

  // Compute the date after mount so server and client render identically.
  const [today, setToday] = useState<Date | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only clock snapshot
  useEffect(() => setToday(new Date()), []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50/70">
      {/* Decorative background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-emerald-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/3 size-72 rounded-full bg-teal-200/40 blur-3xl"
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
              <Wallet className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Expense Tracker
              </h1>
              <p className="text-sm text-muted-foreground">
                Keep your money moments in one place
              </p>
            </div>
          </div>
          <time
            dateTime={today ? format(today, "yyyy-MM-dd") : undefined}
            className="rounded-full border border-black/5 bg-white/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
          >
            {today ? format(today, "EEEE, MMM d, yyyy") : ""}
          </time>
        </header>

        {/* Summary */}
        <SummaryCards
          balance={totals.balance}
          totalIncome={totals.totalIncome}
          totalExpense={totals.totalExpense}
          isLoading={!isLoaded}
        />

        {/* Main grid: form + chart | transactions */}
        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <TransactionForm onAdd={addTransaction} />
            <CategoryPieChart
              transactions={transactions}
              isLoading={!isLoaded}
            />
          </div>
          <TransactionList
            transactions={transactions}
            isLoading={!isLoaded}
            onDelete={deleteTransaction}
            onRestore={restoreTransaction}
          />
        </div>
      </main>

      {/* Sticky footer */}
      <footer className="relative z-10 mt-auto border-t border-black/5 bg-white/60 py-4 backdrop-blur">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          Your data is saved locally in your browser — it persists across
          refreshes and never leaves your device.
        </p>
      </footer>
    </div>
  );
}
