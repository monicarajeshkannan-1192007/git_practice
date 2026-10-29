/**
 * Core types, category metadata and formatting helpers for the Expense Tracker.
 */

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  /** Always a positive number; `type` determines the sign. */
  amount: number;
  type: TransactionType;
  /** Category key, see CATEGORIES below. */
  category: string;
  /** ISO timestamp of when the transaction was created. */
  createdAt: string;
}

export interface CategoryMeta {
  value: string;
  label: string;
  /** Hex color used for chart segments, dots and badges. */
  color: string;
}

/** Categories available when the transaction is an EXPENSE. */
export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  { value: "food", label: "Food & Dining", color: "#f59e0b" },
  { value: "groceries", label: "Groceries", color: "#84cc16" },
  { value: "transport", label: "Transport", color: "#14b8a6" },
  { value: "shopping", label: "Shopping", color: "#ec4899" },
  { value: "entertainment", label: "Entertainment", color: "#a855f7" },
  { value: "bills", label: "Bills & Utilities", color: "#ef4444" },
  { value: "health", label: "Health", color: "#10b981" },
  { value: "other-expense", label: "Other", color: "#78716c" },
];

/** Categories available when the transaction is INCOME. */
export const INCOME_CATEGORIES: CategoryMeta[] = [
  { value: "salary", label: "Salary", color: "#10b981" },
  { value: "freelance", label: "Freelance", color: "#14b8a6" },
  { value: "business", label: "Business", color: "#22c55e" },
  { value: "investments", label: "Investments", color: "#84cc16" },
  { value: "gifts", label: "Gifts", color: "#f59e0b" },
  { value: "other-income", label: "Other", color: "#64748b" },
];

export function categoriesFor(type: TransactionType): CategoryMeta[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

const CATEGORY_INDEX: Record<string, CategoryMeta> = Object.fromEntries(
  [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => [c.value, c])
);

/** Look up category metadata with a safe fallback for unknown values. */
export function getCategoryMeta(value: string): CategoryMeta {
  return (
    CATEGORY_INDEX[value] ?? { value, label: "Uncategorized", color: "#a8a29e" }
  );
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Format a number as USD currency, e.g. 1234.5 -> "$1,234.50". */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Signed currency for lists, e.g. income -> "+$50.00", expense -> "-$20.00". */
export function formatSignedCurrency(
  value: number,
  type: TransactionType
): string {
  const prefix = type === "income" ? "+" : "-";
  return `${prefix}${currencyFormatter.format(value)}`;
}
