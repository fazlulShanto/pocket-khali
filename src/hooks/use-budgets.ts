import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import type { Budget, BudgetStatus, Expense } from "../lib/types"

export function useBudgets() {
  const budgets = useLiveQuery(() => db.budgets.toArray())
  const expenses = useLiveQuery(() => db.expenses.toArray())

  const addBudget = async (budget: Omit<Budget, "id">) => {
    // Check if budget for category already exists
    const existing = await db.budgets.where("categoryId").equals(budget.categoryId).first()
    if (existing) {
      return db.budgets.update(existing.id!, budget)
    }
    return db.budgets.add(budget)
  }

  const updateBudget = async (id: number, changes: Partial<Budget>) => {
    return db.budgets.update(id, changes)
  }

  const deleteBudget = async (id: number) => {
    return db.budgets.delete(id)
  }

  const getBudgetStatus = (categoryId: number | "overall"): { spent: number; limit: number; percent: number; status: BudgetStatus } | null => {
    if (!budgets || !expenses) return null
    
    const budget = budgets.find(b => b.categoryId === categoryId)
    if (!budget) return null

    const now = new Date()
    let spent = 0

    if (budget.period === "monthly") {
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      
      expenses.forEach(exp => {
        if (categoryId === "overall" || exp.categoryId === categoryId) {
          const d = new Date(exp.date)
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            spent += exp.amount
          }
        }
      })
    } else if (budget.period === "weekly") {
      // Basic weekly calculation: from most recent Monday
      const monday = new Date(now)
      monday.setHours(0, 0, 0, 0)
      monday.setDate(monday.getDate() - (monday.getDay() === 0 ? 6 : monday.getDay() - 1))
      
      expenses.forEach(exp => {
        if (categoryId === "overall" || exp.categoryId === categoryId) {
          const d = new Date(exp.date)
          if (d >= monday) {
            spent += exp.amount
          }
        }
      })
    }

    const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
    let status: BudgetStatus = "normal"
    if (percent >= 100) status = "overspent"
    else if (percent >= 90) status = "critical"
    else if (percent >= 80) status = "warning"

    return { spent, limit: budget.amount, percent, status }
  }

  const getAllBudgetStatuses = () => {
    if (!budgets) return []
    return budgets.map(b => ({
      budget: b,
      status: getBudgetStatus(b.categoryId)
    })).filter(b => b.status !== null)
  }

  return { budgets, addBudget, updateBudget, deleteBudget, getBudgetStatus, getAllBudgetStatuses }
}
