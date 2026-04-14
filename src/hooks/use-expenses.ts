import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import { supabase } from "../lib/supabase"
import { syncAll } from "../lib/sync"
import type { Expense } from "../lib/types"

async function triggerSync() {
  const { data } = await supabase.auth.getSession()
  if (data.session?.user && navigator.onLine) {
    syncAll(data.session.user.id).catch(console.warn)
  }
}

export function useExpenses() {
  const expenses = useLiveQuery(() => db.expenses.orderBy("date").reverse().toArray())

  const addExpense = async (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    const id = await db.expenses.add({
      ...expense,
      syncStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    triggerSync()
    return id
  }

  const updateExpense = async (
    id: number,
    changes: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>
  ) => {
    const result = await db.expenses.update(id, {
      ...changes,
      syncStatus: "pending",
      updatedAt: new Date(),
    })
    triggerSync()
    return result
  }

  const deleteExpense = async (id: number) => {
    const expense = await db.expenses.get(id)
    // Soft-delete remotely so the deletion propagates to other devices
    const { data } = await supabase.auth.getSession()
    if (data.session?.user && navigator.onLine && expense?.remoteId) {
      await supabase
        .from("expenses")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", expense.remoteId)   // target by UUID, not local_id
        .catch(console.warn)
    }
    return db.expenses.delete(id)
  }

  return { expenses, addExpense, updateExpense, deleteExpense }
}
