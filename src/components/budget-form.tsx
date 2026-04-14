import * as React from "react"
import { useCategories } from "@/hooks/use-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import type { Budget } from "@/lib/types"

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Budget
  onSave: (budget: Omit<Budget, "id"> | Budget) => void
}

export function BudgetForm({ open, onOpenChange, initialData, onSave }: BudgetFormProps) {
  const { categories } = useCategories()
  
  const [categoryId, setCategoryId] = React.useState<number | "overall" | "">("")
  const [amount, setAmount] = React.useState("")
  const [period, setPeriod] = React.useState<"monthly" | "weekly">("monthly")

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setCategoryId(initialData.categoryId)
        setAmount(initialData.amount.toString())
        setPeriod(initialData.period)
      } else {
        setCategoryId("")
        setAmount("")
        setPeriod("monthly")
      }
    }
  }, [open, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || categoryId === "") return

    const budgetData = {
      ...(initialData ? { id: initialData.id } : {}),
      categoryId: categoryId === "overall" ? "overall" : Number(categoryId),
      amount: parseFloat(amount),
      period,
      startDate: initialData ? initialData.startDate : new Date(),
    }

    onSave(budgetData as Budget)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit Budget" : "New Budget"}</DialogTitle>
            <DialogDescription>
               Set spending limits to get alerts when you are close to overspending.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            
            {!initialData && (
              <div className="grid gap-2">
                <Label>Category</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value === "overall" ? "overall" : Number(e.target.value))}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  <option value="overall">🌟 Overall Budget</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="amount">Limit Amount</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Period</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={period}
                onChange={e => setPeriod(e.target.value as "monthly" | "weekly")}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Budget</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
