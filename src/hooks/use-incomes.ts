import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import type { Income } from "../lib/types"

export function useIncomes() {
  const incomes = useLiveQuery(() => db.incomes.orderBy("date").reverse().toArray())

  const addIncome = async (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => {
    return db.incomes.add({
      ...income,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const updateIncome = async (
    id: number,
    changes: Partial<Omit<Income, "id" | "createdAt" | "updatedAt">>
  ) => {
    return db.incomes.update(id, {
      ...changes,
      updatedAt: new Date(),
    })
  }

  const deleteIncome = async (id: number) => {
    return db.incomes.delete(id)
  }

  return { incomes, addIncome, updateIncome, deleteIncome }
}
