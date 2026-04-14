import * as React from "react"
import { useExpenses } from "@/hooks/use-expenses"
import { useIncomes } from "@/hooks/use-incomes"
import { useCategories } from "@/hooks/use-categories"
import { TransactionSheet } from "@/components/transaction-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp } from "lucide-react"
import type { Expense, Income } from "@/lib/types"
import { getIcon } from "@/components/icons"
import { useSettings } from "@/hooks/use-settings"

type Tab = "all" | "expense" | "income"

// Helper to format dates
const formatDateHeader = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  if (targetDate.getTime() === today.getTime()) return "Today"
  if (targetDate.getTime() === yesterday.getTime()) return "Yesterday"
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
}

const toDateKey = (date: Date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

type UnifiedEntry =
  | { kind: "expense"; data: Expense; date: Date }
  | { kind: "income"; data: Income; date: Date }

export const TransactionsPage = () => {
  const { expenses, deleteExpense, updateExpense } = useExpenses()
  const { incomes, deleteIncome, updateIncome } = useIncomes()
  const { categories } = useCategories()
  const { settings } = useSettings()

  const defaultCurrency = settings?.defaultCurrency || "BDT"
  const currencySymbol = defaultCurrency === "BDT" ? "৳" : "$"

  const [tab, setTab] = React.useState<Tab>("all")
  const [search, setSearch] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingExpense, setEditingExpense] = React.useState<Expense | undefined>(undefined)

  // Build unified + filtered list
  const unified = React.useMemo<UnifiedEntry[]>(() => {
    const list: UnifiedEntry[] = []
    const lowerSearch = search.toLowerCase()

    if (tab !== "income" && expenses) {
      expenses.forEach(exp => {
        if (lowerSearch) {
          const cat = categories?.find(c => c.id === exp.categoryId)
          const match =
            exp.description?.toLowerCase().includes(lowerSearch) ||
            exp.notes?.toLowerCase().includes(lowerSearch) ||
            exp.tags?.some(t => t.toLowerCase().includes(lowerSearch)) ||
            exp.amount.toString().includes(lowerSearch) ||
            cat?.name.toLowerCase().includes(lowerSearch)
          if (!match) return
        }
        list.push({ kind: "expense", data: exp, date: new Date(exp.date) })
      })
    }

    if (tab !== "expense" && incomes) {
      incomes.forEach(inc => {
        if (lowerSearch) {
          const match =
            inc.description?.toLowerCase().includes(lowerSearch) ||
            inc.source?.toLowerCase().includes(lowerSearch) ||
            inc.notes?.toLowerCase().includes(lowerSearch) ||
            inc.amount.toString().includes(lowerSearch)
          if (!match) return
        }
        list.push({ kind: "income", data: inc, date: new Date(inc.date) })
      })
    }

    list.sort((a, b) => b.date.getTime() - a.date.getTime())
    return list
  }, [expenses, incomes, categories, search, tab])

  // Group by date
  const grouped = React.useMemo(() => {
    const groups: Record<string, UnifiedEntry[]> = {}
    unified.forEach(entry => {
      const key = toDateKey(entry.date)
      if (!groups[key]) groups[key] = []
      groups[key].push(entry)
    })
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(key => ({ date: key, items: groups[key] }))
  }, [unified])

  // Daily totals for tab=all
  const groupTotals = React.useMemo(() => {
    const totals: Record<string, { income: number; expense: number }> = {}
    grouped.forEach(g => {
      let income = 0
      let expense = 0
      g.items.forEach(entry => {
        if (entry.kind === "income") income += entry.data.amount
        else expense += entry.data.amount
      })
      totals[g.date] = { income, expense }
    })
    return totals
  }, [grouped])

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  const handleSaveExpense = async (expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    if (editingExpense?.id) await updateExpense(editingExpense.id, expenseData)
  }

  const handleSaveIncome = async (_income: Omit<Income, "id" | "createdAt" | "updatedAt">) => {
    // Income editing not wired in the transactions page (add via FAB)
  }

  const handleDeleteExpense = async (id: number | undefined) => {
    if (!id) return
    if (confirm("Delete this expense?")) await deleteExpense(id)
  }

  const handleDeleteIncome = async (id: number | undefined) => {
    if (!id) return
    if (confirm("Delete this income entry?")) await deleteIncome(id)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "expense", label: "Expenses" },
    { key: "income", label: "Income" },
  ]

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 pt-2 pb-3 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">All your recorded entries.</p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl overflow-hidden border p-1 gap-1 bg-muted">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={
                tab === t.key
                  ? {
                      background:
                        t.key === "income"
                          ? "linear-gradient(135deg, #166534, #15803d)"
                          : t.key === "expense"
                          ? "linear-gradient(135deg, oklch(0.491 0.27 292.581), oklch(0.432 0.232 292.759))"
                          : "var(--card)",
                      color: t.key === "all" ? "var(--foreground)" : "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }
                  : { color: "var(--muted-foreground)", background: "transparent" }
              }
            >
              {t.key === "income" ? "⬆️ " : t.key === "expense" ? "⬇️ " : ""}
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-muted/30 border-muted"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        {grouped.map(group => {
          const totals = groupTotals[group.date]
          return (
            <div key={group.date} className="space-y-3">
              {/* Date header */}
              <div className="flex items-center justify-between border-b pb-1">
                <h3 className="text-sm font-medium text-muted-foreground">{formatDateHeader(group.date)}</h3>
                {tab === "all" && (
                  <div className="flex items-center gap-3 text-xs">
                    {totals.income > 0 && (
                      <span className="text-green-500 font-semibold">
                        +{currencySymbol}{totals.income.toLocaleString()}
                      </span>
                    )}
                    {totals.expense > 0 && (
                      <span className="text-red-400 font-semibold">
                        -{currencySymbol}{totals.expense.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {group.items.map(entry => {
                  if (entry.kind === "expense") {
                    const expense = entry.data
                    const category = categories?.find(c => c.id === expense.categoryId)
                    const Icon = getIcon(category?.icon)
                    const catColor = category?.color || "#94a3b8"

                    return (
                      <div key={`expense-${expense.id}`} className="flex items-center justify-between p-3 rounded-xl border bg-card/60 hover:bg-card hover:shadow-sm transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1" onClick={() => handleEditExpense(expense)}>
                          <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: `${catColor}20`, color: catColor }}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-semibold text-[15px] truncate">{expense.description}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                              <span>{category?.name || "Unknown"}</span>
                              {expense.tags?.length > 0 && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                  <span className="truncate">{expense.tags.join(", ")}</span>
                                </>
                              )}
                            </div>
                            {expense.notes && (
                              <span className="text-[11px] text-muted-foreground/70 truncate mt-0.5 max-w-[200px]">{expense.notes}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                          <span className="font-bold text-base whitespace-nowrap text-red-400">
                            -{currencySymbol}{expense.amount.toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive opacity-60 hover:opacity-100 bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-all rounded-md"
                            onClick={e => { e.stopPropagation(); handleDeleteExpense(expense.id) }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    )
                  }

                  // Income entry
                  const income = entry.data
                  return (
                    <div key={`income-${income.id}`} className="flex items-center justify-between p-3 rounded-xl border bg-card/60 hover:bg-card hover:shadow-sm transition-colors" style={{ borderColor: "rgba(34,197,94,0.2)" }}>
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-semibold text-[15px] truncate">{income.source}</span>
                          {income.description && (
                            <span className="text-xs text-muted-foreground truncate">{income.description}</span>
                          )}
                          {income.notes && (
                            <span className="text-[11px] text-muted-foreground/70 truncate mt-0.5 max-w-[200px]">{income.notes}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                        <span className="font-bold text-base whitespace-nowrap text-green-500">
                          +{currencySymbol}{income.amount.toLocaleString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive opacity-60 hover:opacity-100 bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-all rounded-md"
                          onClick={e => { e.stopPropagation(); handleDeleteIncome(income.id) }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {grouped.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">No transactions found.</p>
            {search && <p className="text-sm text-muted-foreground/70 mt-1">Try adapting your search.</p>}
          </div>
        )}
      </div>

      {/* Edit form */}
      <TransactionSheet
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditingExpense(undefined) }}
        initialType="expense"
        initialData={editingExpense}
        onSaveExpense={handleSaveExpense}
        onSaveIncome={handleSaveIncome}
      />
    </div>
  )
}
