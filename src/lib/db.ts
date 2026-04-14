import Dexie, { type EntityTable } from "dexie"
import type { Expense, Category, Tag, Budget, Settings } from "./types"

export class PocketKhaliDB extends Dexie {
  expenses!: EntityTable<Expense, "id">
  categories!: EntityTable<Category, "id">
  tags!: EntityTable<Tag, "id">
  budgets!: EntityTable<Budget, "id">
  settings!: EntityTable<Settings, "key">

  constructor() {
    super("PocketKhaliDB")
    this.version(1).stores({
      expenses: "++id, date, categoryId, [categoryId+date]",
      categories: "++id, name",
      tags: "++id, name",
      budgets: "++id, categoryId, period",
      settings: "key"
    })
    // v2: add order index to categories
    this.version(2).stores({
      categories: "++id, name, order"
    })
    // v3: add syncStatus index to expenses for cloud sync
    this.version(3).stores({
      expenses: "++id, date, categoryId, [categoryId+date], syncStatus"
    })
  }
}

export const db = new PocketKhaliDB()
