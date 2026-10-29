"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  categoriesFor,
  formatCurrency,
  getCategoryMeta,
  type Transaction,
  type TransactionType,
} from "@/lib/expense";
import { cn } from "@/lib/utils";

interface CategoryPieChartProps {
  transactions: Transaction[];
  isLoading: boolean;
}

interface SliceData {
  key: string;
  name: string;
  value: number;
  color: string;
  percent: number;
}
/** Expands the hovered slice outward. */
function renderActiveSlice(props: {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
}) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={(outerRadius ?? 0) + 7}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={5}
      style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.18))" }}
    />
  );
}

export function CategoryPieChart({
  transactions,
  isLoading,
}: CategoryPieChartProps) {
  const [view, setView] = useState<TransactionType>("expense");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const { slices, total } = useMemo(() => {
    const totals = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== view) continue;
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    }
    const grandTotal = [...totals.values()].reduce((sum, v) => sum + v, 0);
    const data: SliceData[] = [...totals.entries()]
      .map(([key, value]) => {
        const meta = getCategoryMeta(key);
        return {
          key,
          name: meta.label,
          value,
          color: meta.color,
          percent: grandTotal > 0 ? (value / grandTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);
    return { slices: data, total: grandTotal };
  }, [transactions, view]);

  const activeSlice = slices.find((s) => s.key === activeKey) ?? null;
  const activeIndex = activeSlice ? slices.indexOf(activeSlice) : -1;

  function handleViewChange(next: string) {
    if (next !== "income" && next !== "expense") return;
    setView(next);
    setActiveKey(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, type: "spring", stiffness: 120, damping: 18 }}
    >
      <Card className="rounded-2xl border border-black/5 bg-white/80 shadow-sm backdrop-blur">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              Category Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Interactive chart based on your entries
            </CardDescription>
          </div>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={handleViewChange}
            variant="outline"
            className="rounded-xl bg-muted/60 p-1"
          >
            <ToggleGroupItem
              value="expense"
              aria-label="Show expense breakdown"
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium data-[state=on]:bg-white data-[state=on]:shadow-sm",
                view === "expense" && "text-rose-600"
              )}
            >
              Expenses
            </ToggleGroupItem>
            <ToggleGroupItem
              value="income"
              aria-label="Show income breakdown"
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium data-[state=on]:bg-white data-[state=on]:shadow-sm",
                view === "income" && "text-emerald-600"
              )}
            >
              Income
            </ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Skeleton className="size-48 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : slices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <PieChartIcon
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  No {view === "expense" ? "expenses" : "income"} to chart yet
                </p>
                <p className="max-w-[260px] text-xs text-muted-foreground">
                  Add a few {view === "expense" ? "expenses" : "income entries"}{" "}
                  and the breakdown will appear here automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              {/* Donut with center label */}
              <div className="relative h-[240px] w-full max-w-[300px] sm:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slices}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={slices.length > 1 ? 3 : 0}
                      cornerRadius={5}
                      stroke="none"
                      activeIndex={activeIndex}
                      activeShape={renderActiveSlice}
                      onMouseEnter={(_, index) =>
                        setActiveKey(slices[index]?.key ?? null)
                      }
                      onMouseLeave={() => setActiveKey(null)}
                    >
                      {slices.map((slice) => (
                        <Cell
                          key={slice.key}
                          fill={slice.color}
                          opacity={
                            activeKey && activeKey !== slice.key ? 0.35 : 1
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center readout */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <AnimatePresence mode="wait">
                    {activeSlice ? (
                      <motion.div
                        key={activeSlice.key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                      >
                        <p className="max-w-[110px] truncate text-xs font-medium text-muted-foreground">
                          {activeSlice.name}
                        </p>
                        <p className="text-lg font-bold tabular-nums">
                          {formatCurrency(activeSlice.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activeSlice.percent.toFixed(0)}%
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="total"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                      >
                        <p className="text-xs font-medium text-muted-foreground">
                          {view === "expense" ? "Total Spent" : "Total Earned"}
                        </p>
                        <p className="text-lg font-bold tabular-nums">
                          {formatCurrency(total)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Legend */}
              <ul className="grid w-full grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {slices.map((slice) => (
                  <li
                    key={slice.key}
                    onMouseEnter={() => setActiveKey(slice.key)}
                    onMouseLeave={() => setActiveKey(null)}
                    className={cn(
                      "flex cursor-default items-center gap-2 rounded-lg px-2 py-1 transition-colors",
                      activeKey === slice.key && "bg-muted/70"
                    )}
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {slice.name}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {slice.percent.toFixed(0)}%
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums">
                      {formatCurrency(slice.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
