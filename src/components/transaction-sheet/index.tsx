import * as React from "react"
import { Sheet, SheetContent, SheetDescription } from "@/components/ui/sheet"
import type { Expense, Income } from "@/lib/types"
import { ExpenseFormFields } from "./expense-form"
import { IncomeFormFields } from "./income-form"
import { ArrowDown, ArrowUp, MoveUp } from "lucide-react"
import { Button } from "../ui/button"

export type FormType = "expense" | "income"

export interface TransactionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialType?: FormType
  initialData?: Expense // editing is expense-only for now
  onSaveExpense: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onSaveIncome: (data: Omit<Income, "id" | "createdAt" | "updatedAt">) => Promise<void>
}

export function TransactionSheet({
  open,
  onOpenChange,
  initialType = "expense",
  initialData,
  onSaveExpense,
  onSaveIncome,
}: TransactionSheetProps) {
  const [formType, setFormType] = React.useState<FormType>(initialType)

  // Sync type when sheet opens
  React.useEffect(() => {
    if (open) setFormType(initialType)
  }, [open, initialType])

  const isEditing = !!initialData

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[92vh] w-full max-w-2xl mx-auto rounded-t-2xl flex flex-col p-0 gap-0 overflow-hidden [&>button>svg]:hidden"
      >
        <SheetDescription className="sr-only">Add a new expense or income record.</SheetDescription>

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b shrink-0">
          <h2 className="text-lg font-bold tracking-tight">
            {isEditing ? "Edit Transaction" : "New Transaction"}
          </h2>

          {/* Type toggle — hide when editing (always expense) */}
          {!isEditing && (
            <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
              <Button
                type="button"
                onClick={() => setFormType("expense")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${formType === "expense"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground bg-secondary"
                  }`}
              >
                <ArrowUp size={16} /> Expense
              </Button>
              <Button
                type="button"
                onClick={() => setFormType("income")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${formType === "income" ? "text-white shadow-sm" : "text-muted-foreground bg-secondary hover:text-foreground"
                  }`}
                style={
                  formType === "income"
                    ? { background: "linear-gradient(135deg,#166534,#15803d)" }
                    : {}
                }
              >
                <ArrowDown size={16} /> Income
              </Button>
            </div>
          )}
        </div>

        {/* ── Form body ───────────────────────────────────── */}
        {formType === "expense" ? (
          <ExpenseFormFields
            key={`expense-${open}`}
            initialData={initialData}
            onSave={onSaveExpense}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <IncomeFormFields
            key={`income-${open}`}
            onSave={onSaveIncome}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
