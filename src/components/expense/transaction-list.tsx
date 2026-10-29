"use client";

import { AnimatePresence, motion } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { Inbox, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  formatSignedCurrency,
  getCategoryMeta,
  type Transaction,
} from "@/lib/expense";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onDelete: (id: string) => Transaction | undefined;
  onRestore: (transaction: Transaction) => void;
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

function formatTimeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "h:mm a");
}

/** Compact date for small screens, e.g. "Today" / "Yesterday" / "Oct 17". */
function formatShortDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export function TransactionList({
  transactions,
  isLoading,
  onDelete,
  onRestore,
}: TransactionListProps) {
  const { toast } = useToast();

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function handleDelete(transaction: Transaction) {
    onDelete(transaction.id);
    toast({
      title: "Transaction deleted",
      description: `"${transaction.description}" was removed.`,
      action: (
        <button
          onClick={() => onRestore(transaction)}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Undo
        </button>
      ),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, type: "spring", stiffness: 120, damping: 18 }}
      className="h-full"
    >
      <Card className="flex h-full flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm backdrop-blur">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              Recent Transactions
            </CardTitle>
            <CardDescription className="text-xs">
              {isLoading
                ? "Loading your history…"
                : `${transactions.length} transaction${
                    transactions.length === 1 ? "" : "s"
                  } recorded`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <div
                    className="hidden w-24 flex-col items-end gap-1.5 sm:flex"
                    aria-hidden="true"
                  >
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium">No transactions yet</p>
                <p className="max-w-[240px] text-xs text-muted-foreground">
                  Add your first income or expense using the form to get
                  started.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Column headers (desktop only) */}
              <div
                aria-hidden="true"
                className="mb-1.5 hidden items-center gap-3 border-b border-black/5 px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:flex"
              >
                <span className="w-10" />
                <span className="flex-1">Transaction</span>
                <span className="w-24 text-right">Date</span>
                <span className="w-24 text-right">Amount</span>
                <span className="w-9" />
              </div>
              <ul
                className="custom-scrollbar -mr-2 max-h-[520px] space-y-1.5 overflow-y-auto pr-2"
                aria-label="Transaction history"
              >
              <AnimatePresence initial={false}>
                {sorted.map((tx) => {
                  const meta = getCategoryMeta(tx.category);
                  const isIncome = tx.type === "income";
                  return (
                    <motion.li
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{
                        opacity: 0,
                        x: 32,
                        transition: { duration: 0.18 },
                      }}
                      transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      className="group flex items-center gap-2 rounded-xl border border-transparent p-2.5 transition-colors hover:border-black/5 hover:bg-muted/50 sm:gap-3"
                    >
                      {/* Category chip */}
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase text-white sm:size-10"
                        style={{ backgroundColor: meta.color }}
                        aria-hidden="true"
                      >
                        {meta.label.slice(0, 2)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {tx.description}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {meta.label}
                        </p>
                      </div>

                      {/* Date column (desktop only) */}
                      <div className="hidden w-24 shrink-0 text-right sm:block">
                        <p className="text-xs font-medium text-foreground/80">
                          {formatDateLabel(tx.createdAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeLabel(tx.createdAt)}
                        </p>
                      </div>

                      {/* Amount — fixed-width column on desktop */}
                      <span
                        className={cn(
                          "hidden w-24 shrink-0 text-right text-sm font-semibold tabular-nums sm:block",
                          isIncome ? "text-emerald-600" : "text-rose-600"
                        )}
                      >
                        {formatSignedCurrency(tx.amount, tx.type)}
                      </span>

                      {/* Mobile: amount with compact date stacked beneath */}
                      <div className="flex shrink-0 flex-col items-end gap-0.5 sm:hidden">
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            isIncome ? "text-emerald-600" : "text-rose-600"
                          )}
                        >
                          {formatSignedCurrency(tx.amount, tx.type)}
                        </span>
                        <span className="text-[11px] leading-none text-muted-foreground">
                          {formatShortDateLabel(tx.createdAt)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(tx)}
                        aria-label={`Delete transaction: ${tx.description}`}
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-all hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
