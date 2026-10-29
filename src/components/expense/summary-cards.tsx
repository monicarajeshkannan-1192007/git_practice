"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedNumber } from "@/components/expense/animated-number";
import { formatCurrency } from "@/lib/expense";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  isLoading: boolean;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 120, damping: 18 },
  },
};

export function SummaryCards({
  balance,
  totalIncome,
  totalExpense,
  isLoading,
}: SummaryCardsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      {/* Total Balance — emphasized gradient card */}
      <motion.div variants={item}>
        <Card className="group h-full overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-emerald-50/90">
                  Total Balance
                </p>
                {isLoading ? (
                  <Skeleton className="h-9 w-32 bg-white/20" />
                ) : (
                  <AnimatedNumber
                    value={balance}
                    format={formatCurrency}
                    className="block truncate text-2xl font-bold tracking-tight sm:text-3xl"
                  />
                )}
                <p className="text-xs text-emerald-100/70">
                  {balance >= 0
                    ? "You're in the green"
                    : "Spending exceeds income"}
                </p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                <Wallet className="size-5" aria-hidden="true" />
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Income */}
      <motion.div variants={item}>
        <Card className="group h-full rounded-2xl border border-black/5 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Income
                </p>
                {isLoading ? (
                  <Skeleton className="h-9 w-28" />
                ) : (
                  <AnimatedNumber
                    value={totalIncome}
                    format={formatCurrency}
                    className="block truncate text-2xl font-bold tracking-tight text-emerald-600 sm:text-3xl"
                  />
                )}
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp
                    className="size-3.5 text-emerald-500"
                    aria-hidden="true"
                  />
                  Total money in
                </p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
                <TrendingUp className="size-5" aria-hidden="true" />
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expenses */}
      <motion.div variants={item}>
        <Card className="group h-full rounded-2xl border border-black/5 bg-white/80 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Expenses
                </p>
                {isLoading ? (
                  <Skeleton className="h-9 w-28" />
                ) : (
                  <AnimatedNumber
                    value={totalExpense}
                    format={formatCurrency}
                    className={cn(
                      "block truncate text-2xl font-bold tracking-tight text-rose-600 sm:text-3xl"
                    )}
                  />
                )}
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingDown
                    className="size-3.5 text-rose-500"
                    aria-hidden="true"
                  />
                  Total money out
                </p>
              </div>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 transition-transform duration-300 group-hover:scale-110">
                <TrendingDown className="size-5" aria-hidden="true" />
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
