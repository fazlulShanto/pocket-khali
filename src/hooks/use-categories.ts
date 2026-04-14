import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import type { Category } from "../lib/types"

export function useCategories() {
  const categories = useLiveQuery(() => db.categories.orderBy("order").toArray())

  const addCategory = async (category: Omit<Category, "id">) => {
    // Add to end of list
    const count = await db.categories.count()
    return db.categories.add({ ...category, order: count + 1 })
  }

  const updateCategory = async (id: number, changes: Partial<Category>) => {
    return db.categories.update(id, changes)
  }

  const deleteCategory = async (id: number) => {
    // Also consider what happens to expenses with this category.
    // For MVP we might just delete the category or prevent deletion if it has expenses.
    return db.categories.delete(id)
  }

  const reorderCategories = async (categories: Category[]) => {
    return db.transaction("rw", db.categories, async () => {
      for (const [index, cat] of categories.entries()) {
        if (cat.id) {
          await db.categories.update(cat.id, { order: index + 1 })
        }
      }
    })
  }

  return { categories, addCategory, updateCategory, deleteCategory, reorderCategories }
}
