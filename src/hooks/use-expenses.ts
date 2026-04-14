import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import type { Expense } from "../lib/types"

export function useExpenses() {
  const expenses = useLiveQuery(() => db.expenses.orderBy("date").reverse().toArray())

  const addExpense = async (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    return db.expenses.add({
      ...expense,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }

  const updateExpense = async (id: number, changes: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>) => {
    return db.expenses.update(id, {
      ...changes,
      updatedAt: new Date()
    })
  }

  const deleteExpense = async (id: number) => {
    return db.expenses.delete(id)
  }

  return { expenses, addExpense, updateExpense, deleteExpense }
}
