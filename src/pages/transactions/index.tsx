import * as React from "react"
import { useExpenses } from "@/hooks/use-expenses"
import { useCategories } from "@/hooks/use-categories"
import { ExpenseForm } from "@/components/expense-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, Edit2, Trash2 } from "lucide-react"
import type { Expense } from "@/lib/types"
import { Icons, getIcon, type IconName } from "@/components/icons"
import { useSettings } from "@/hooks/use-settings"

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

  return date.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })
}

export const TransactionsPage = () => {
  const { expenses, deleteExpense, updateExpense } = useExpenses()
  const { categories } = useCategories()
  const { settings } = useSettings()

  const defaultCurrency = settings?.defaultCurrency || "BDT"

  const [search, setSearch] = React.useState("")
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingExpense, setEditingExpense] = React.useState<Expense | undefined>(undefined)

  // Filter transactions based on search
  const filteredExpenses = React.useMemo(() => {
    if (!expenses) return []
    if (!search) return expenses

    const lowerSearch = search.toLowerCase()

    return expenses.filter(expense => {
      const matchDesc = expense.description?.toLowerCase().includes(lowerSearch)
      const matchNotes = expense.notes?.toLowerCase().includes(lowerSearch)
      const matchTags = expense.tags?.some(t => t.toLowerCase().includes(lowerSearch))
      const matchAmount = expense.amount.toString().includes(lowerSearch)

      let matchCategory = false
      if (categories) {
        const cat = categories.find(c => c.id === expense.categoryId)
        if (cat && cat.name.toLowerCase().includes(lowerSearch)) {
          matchCategory = true
        }
      }

      return matchDesc || matchNotes || matchTags || matchAmount || matchCategory
    })
  }, [expenses, search, categories])

  // Group by date
  const groupedExpenses = React.useMemo(() => {
    const groups: Record<string, Expense[]> = {}
    filteredExpenses.forEach(expense => {
      // Create local date string YYYY-MM-DD
      const date = new Date(expense.date)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(expense)
    })

    // Sort keys descending
    return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(key => ({
      date: key,
      items: groups[key].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }))
  }, [filteredExpenses])

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  const handleSave = async (expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    if (editingExpense && editingExpense.id) {
      await updateExpense(editingExpense.id, expenseData)
    }
  }

  const handleDelete = async (id: number | undefined) => {
    if (!id) return
    if (confirm("Delete this expense?")) {
      await deleteExpense(id)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 space-y-6 pb-24">
      <div className="flex flex-col gap-4 sticky top-0 bg-background z-10 py-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">All your recorded expenses.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-muted/30 border-muted"
          />
        </div>
      </div>

      <div className="space-y-6">
        {groupedExpenses.map(group => (
          <div key={group.date} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
              {formatDateHeader(group.date)}
            </h3>

            <div className="flex flex-col gap-3">
              {group.items.map(expense => {
                const category = categories?.find(c => c.id === expense.categoryId)
                const Icon = getIcon(category?.icon)
                const catColor = category?.color || "#94a3b8"

                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl border bg-card/60 transition-colors hover:bg-card hover:shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1" onClick={() => handleEdit(expense)}>
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: `${catColor}20`, color: catColor }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-semibold text-[15px] truncate">{expense.description}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                          <span>{category?.name || "Unknown"}</span>
                          {expense.tags && expense.tags.length > 0 && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                              <span className="truncate">{expense.tags.join(", ")}</span>
                            </>
                          )}
                        </div>
                        {expense.notes && (
                          <span className="text-[11px] text-muted-foreground/70 truncate mt-0.5 max-w-[200px]">
                            {expense.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                      <span className="font-bold text-base whitespace-nowrap text-foreground">
                        {defaultCurrency === "BDT" ? "৳" : "$"} {expense.amount.toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive opacity-60 hover:opacity-100 bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground transition-all rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(expense.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {groupedExpenses.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">No transactions found.</p>
            {search && <p className="text-sm text-muted-foreground/70 mt-1">Try adapting your search.</p>}
          </div>
        )}
      </div>

      <ExpenseForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingExpense}
        onSave={handleSave}
      />
    </div>
  )
}
