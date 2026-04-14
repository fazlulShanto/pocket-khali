import { db } from "./db"
import type { Category } from "./types"

export const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { name: "Food & Dining", icon: "utensils", color: "#ef4444", isCustom: false, keywords: ["food", "lunch", "dinner", "breakfast", "restaurant", "eat", "meal", "snack", "coffee", "tea"], order: 1 },
  { name: "Transport", icon: "car", color: "#3b82f6", isCustom: false, keywords: ["bus", "uber", "taxi", "rickshaw", "cng", "fuel", "gas", "fare", "train", "ride", "auto"], order: 2 },
  { name: "Rent", icon: "home", color: "#8b5cf6", isCustom: false, keywords: ["rent", "house", "apartment", "flat", "mess"], order: 3 },
  { name: "Utilities", icon: "zap", color: "#f59e0b", isCustom: false, keywords: ["electricity", "water", "gas", "internet", "wifi", "bill", "phone", "recharge", "biddyut", "pani"], order: 4 },
  { name: "Entertainment", icon: "gamepad-2", color: "#ec4899", isCustom: false, keywords: ["movie", "netflix", "game", "fun", "party", "concert", "show", "cinema", "ticket"], order: 5 },
  { name: "Shopping", icon: "shopping-cart", color: "#10b981", isCustom: false, keywords: ["shop", "buy", "purchase", "amazon", "clothes", "shoes", "mall", "daraz", "market", "bazar"], order: 6 },
  { name: "Health", icon: "heart-pulse", color: "#06b6d4", isCustom: false, keywords: ["medicine", "doctor", "hospital", "pharmacy", "gym", "health", "workout", "clinic", "osudh"], order: 7 },
  { name: "Education", icon: "book-open", color: "#6366f1", isCustom: false, keywords: ["book", "course", "tuition", "school", "college", "class", "study", "university", "fee", "khata", "pen"], order: 8 },
  { name: "Personal", icon: "user", color: "#f97316", isCustom: false, keywords: ["grooming", "haircut", "salon", "personal", "parlor", "beauty"], order: 9 },
  { name: "Other", icon: "package", color: "#6b7280", isCustom: false, keywords: [], order: 10 },
]

export async function seedDatabase() {
  try {
    const categoryCount = await db.categories.count()
    if (categoryCount === 0) {
      // Create a mutable copy of the defaults for bulkAdd, as it expects mutable objects and might modify them.
      await db.categories.bulkAdd([...DEFAULT_CATEGORIES] as Category[])
    }

    const defaultCurrency = await db.settings.get("defaultCurrency")
    if (!defaultCurrency) {
      await db.settings.add({ key: "defaultCurrency", value: "BDT" })
    }

    const defaultPaymentMethod = await db.settings.get("defaultPaymentMethod")
    if (!defaultPaymentMethod) {
      await db.settings.add({ key: "defaultPaymentMethod", value: "cash" })
    }
  } catch (error) {
    console.error("Failed to seed database", error)
  }
}
