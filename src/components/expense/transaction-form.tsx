"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import {
  categoriesFor,
  type TransactionType,
} from "@/lib/expense";
import { cn } from "@/lib/utils";
import type { AddTransactionInput } from "@/hooks/use-transactions";

interface TransactionFormProps {
  onAdd: (input: AddTransactionInput) => void;
}

interface Errors {
  description?: string;
  amount?: string;
}

export function TransactionForm({ onAdd }: TransactionFormProps) {
  const { toast } = useToast();
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [errors, setErrors] = useState<Errors>({});

  const categories = categoriesFor(type);
  const selectedCategory = categories.find((c) => c.value === category);

  function handleTypeChange(next: string) {
    if (next !== "income" && next !== "expense") return;
    setType(next);
    // Reset category to the first option of the newly selected type.
    setCategory(categoriesFor(next)[0].value);
    setErrors((prev) => ({ ...prev, amount: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = description.trim();
    const parsedAmount = Number.parseFloat(amount);

    const nextErrors: Errors = {};
    if (!trimmed) {
      nextErrors.description = "Please enter a description.";
    } else if (trimmed.length > 60) {
      nextErrors.description = "Keep it under 60 characters.";
    }
    if (!amount.trim() || Number.isNaN(parsedAmount)) {
      nextErrors.amount = "Please enter a valid amount.";
    } else if (parsedAmount <= 0) {
      nextErrors.amount = "Amount must be greater than 0.";
    } else if (parsedAmount > 99_999_999) {
      nextErrors.amount = "That amount is a bit too large.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onAdd({
      description: trimmed,
      amount: Math.round(parsedAmount * 100) / 100,
      type,
      category,
    });

    setDescription("");
    setAmount("");
    setErrors({});

    toast({
      title: type === "income" ? "Income added" : "Expense added",
      description: `${trimmed} · ${
        type === "income" ? "+" : "-"
      }$${parsedAmount.toFixed(2)}`,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 120, damping: 18 }}
    >
      <Card className="rounded-2xl border border-black/5 bg-white/80 shadow-sm backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">
            Add Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Income / Expense toggle */}
            <div className="space-y-1.5">
              <Label className="sr-only" htmlFor="tx-type">
                Transaction type
              </Label>
              <ToggleGroup
                id="tx-type"
                type="single"
                value={type}
                onValueChange={handleTypeChange}
                variant="outline"
                className="grid w-full grid-cols-2 rounded-xl bg-muted/60 p-1"
              >
                <ToggleGroupItem
                  value="expense"
                  aria-label="Record an expense"
                  className={cn(
                    "gap-2 rounded-lg py-2.5 text-sm font-medium transition-all data-[state=on]:bg-white data-[state=on]:shadow-sm",
                    type === "expense" && "text-rose-600"
                  )}
                >
                  <ArrowDownCircle className="size-4" aria-hidden="true" />
                  Expense
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="income"
                  aria-label="Record income"
                  className={cn(
                    "gap-2 rounded-lg py-2.5 text-sm font-medium transition-all data-[state=on]:bg-white data-[state=on]:shadow-sm",
                    type === "income" && "text-emerald-600"
                  )}
                >
                  <ArrowUpCircle className="size-4" aria-hidden="true" />
                  Income
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="tx-description">Description</Label>
              <Input
                id="tx-description"
                placeholder={
                  type === "expense" ? "e.g. Lunch with team" : "e.g. Monthly salary"
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={80}
                aria-invalid={Boolean(errors.description)}
                className={cn(
                  "h-11 rounded-xl",
                  errors.description && "border-rose-400 focus-visible:ring-rose-300"
                )}
              />
              {errors.description && (
                <p className="text-xs font-medium text-rose-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Amount + Category */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tx-amount">Amount</Label>
                <div className="relative">
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                    aria-hidden="true"
                  >
                    $
                  </span>
                  <Input
                    id="tx-amount"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    aria-invalid={Boolean(errors.amount)}
                    className={cn(
                      "h-11 rounded-xl pl-7",
                      errors.amount && "border-rose-400 focus-visible:ring-rose-300"
                    )}
                  />
                </div>
                {errors.amount && (
                  <p className="text-xs font-medium text-rose-600">
                    {errors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tx-category">Category</Label>
                <Select key={type} value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    id="tx-category"
                    className="h-11 w-full rounded-xl"
                  >
                    <SelectValue placeholder="Select category">
                      {selectedCategory ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: selectedCategory.color }}
                            aria-hidden="true"
                          />
                          {selectedCategory.label}
                        </span>
                      ) : (
                        "Select category"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: c.color }}
                            aria-hidden="true"
                          />
                          {c.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className={cn(
                "h-11 w-full rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]",
                type === "expense"
                  ? "bg-rose-500 hover:bg-rose-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              )}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add {type === "income" ? "Income" : "Expense"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
