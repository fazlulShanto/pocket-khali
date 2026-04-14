import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import { supabase } from "../lib/supabase"
import type { Income } from "../lib/types"

export function useIncomes() {
  const incomes = useLiveQuery(() => db.incomes.orderBy("date").reverse().toArray())

  const addIncome = async (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => {
    return db.incomes.add({
      ...income,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: "pending",
    })
  }

  const updateIncome = async (
    id: number,
    changes: Partial<Omit<Income, "id" | "createdAt" | "updatedAt">>
  ) => {
    return db.incomes.update(id, {
      ...changes,
      updatedAt: new Date(),
      syncStatus: "pending",
    })
  }

  const deleteIncome = async (id: number) => {
    const income = await db.incomes.get(id)
    const { data } = await supabase.auth.getSession()
    if (data.session?.user && navigator.onLine && income?.remoteId) {
      await supabase
        .from("incomes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", income.remoteId)   // target by UUID, not local_id
        .catch(console.warn)
    }
    return db.incomes.delete(id)
  }

  return { incomes, addIncome, updateIncome, deleteIncome }
}
