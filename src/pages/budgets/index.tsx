import * as React from "react"
import { useBudgets } from "@/hooks/use-budgets"
import { useCategories } from "@/hooks/use-categories"
import { useSettings } from "@/hooks/use-settings"
import { BudgetForm } from "@/components/budget-form"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, AlertTriangle, Wallet } from "lucide-react"
import type { Budget, BudgetStatus } from "@/lib/types"
import { Icons, getIcon, type IconName } from "@/components/icons"

const statusColors: Record<BudgetStatus, string> = {
  normal: "bg-green-500",
  warning: "bg-yellow-500",
  critical: "bg-red-500",
  overspent: "bg-red-700"
}

export const BudgetsPage = () => {
  const { addBudget, updateBudget, deleteBudget, getAllBudgetStatuses } = useBudgets()
  const { categories } = useCategories()
  const { settings } = useSettings()

  const defaultCurrency = settings?.defaultCurrency || "BDT"

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingBudget, setEditingBudget] = React.useState<Budget | undefined>(undefined)

  const budgetStatuses = getAllBudgetStatuses()

  const handleOpenNew = () => {
    setEditingBudget(undefined)
    setFormOpen(true)
  }

  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormOpen(true)
  }

  const handleSave = async (budgetData: Omit<Budget, "id"> | Budget) => {
    if ("id" in budgetData && budgetData.id) {
      await updateBudget(budgetData.id, budgetData)
    } else {
      await addBudget(budgetData)
    }
  }

  const handleDelete = async (id: number | undefined) => {
    if (!id) return
    if (confirm("Delete this budget constraint?")) {
      await deleteBudget(id)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">Keep your spending in check.</p>
        </div>
        <Button onClick={handleOpenNew} size="sm" className="gap-1 rounded-full px-4">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Budget</span>
        </Button>
      </div>

      <div className="space-y-4">
        {budgetStatuses.map(({ budget, status }) => {
          if (!status) return null
          
          const isOverall = budget.categoryId === "overall"
          const category = isOverall ? null : categories?.find(c => c.id === budget.categoryId)
          const Icon = isOverall ? Wallet : getIcon(category?.icon)
          const badgeColor = isOverall ? "#3b82f6" : (category?.color || "#94a3b8")
          const name = isOverall ? "Overall Budget" : (category?.name || "Unknown")
          const barColor = statusColors[status.status]
          
          const progressPercent = Math.min(status.percent, 100)

          return (
            <div key={budget.id} className="flex flex-col gap-3 p-4 rounded-xl border bg-card/60 transition-colors hover:bg-card hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-sm" 
                    style={{ backgroundColor: `${badgeColor}20`, color: badgeColor }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="font-semibold truncate">{name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{budget.period} limit</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleOpenEdit(budget)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(budget.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-end text-sm">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">
                      {defaultCurrency === "BDT" ? "৳" : "$"} {status.spent.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Spent</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-muted-foreground">
                      {defaultCurrency === "BDT" ? "৳" : "$"} {status.limit.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Limit</span>
                  </div>
                </div>
                
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full w-full flex-1 transition-all duration-500 ease-in-out ${barColor}`}
                    style={{ transform: `translateX(-${100 - progressPercent}%)` }}
                  />
                </div>
                
                {status.status !== "normal" && (
                  <div className={`flex items-center gap-1.5 text-xs font-semibold mt-1 ${status.status === 'warning' ? 'text-yellow-600 dark:text-yellow-500' : 'text-destructive'}`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {status.status === "warning" && `You're at ${Math.round(status.percent)}% of your budget.`}
                    {status.status === "critical" && `Only ${100 - Math.round(status.percent)}% left!`}
                    {status.status === "overspent" && "You've gone over budget."}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {budgetStatuses.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4 border rounded-xl border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-foreground font-medium mb-1">No budgets set</p>
            <p className="text-sm text-muted-foreground max-w-[250px]">Create budgets to track your spending limits and receive alerts.</p>
          </div>
        )}
      </div>

      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingBudget}
        onSave={handleSave}
      />
    </div>
  )
}
