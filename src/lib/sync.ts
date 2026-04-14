import { db } from "../lib/db"
import { supabase } from "../lib/supabase"
import type { Expense } from "../lib/types"

// ─── Type for remote record ───────────────────────────────────────────────────
interface RemoteExpense {
  id: string
  local_id: number
  user_id: string
  amount: number
  currency: string
  category_id: number
  description: string
  notes: string | null
  tags: string[]
  payment_method: string
  date: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// ─── Map local Expense → Supabase row ─────────────────────────────────────────
function toRemote(expense: Expense & { id: number }, userId: string): Omit<RemoteExpense, "id"> {
  return {
    local_id: expense.id,
    user_id: userId,
    amount: expense.amount,
    currency: expense.currency,
    category_id: expense.categoryId,
    description: expense.description,
    notes: expense.notes ?? null,
    tags: expense.tags,
    payment_method: expense.paymentMethod,
    date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
    created_at:
      expense.createdAt instanceof Date ? expense.createdAt.toISOString() : expense.createdAt,
    updated_at:
      expense.updatedAt instanceof Date ? expense.updatedAt.toISOString() : expense.updatedAt,
    deleted_at: null,
  }
}

// ─── Map Supabase row → local Expense ─────────────────────────────────────────
function toLocal(remote: RemoteExpense): Omit<Expense, "photo"> & { id: number } {
  return {
    id: remote.local_id,
    amount: remote.amount,
    currency: remote.currency,
    categoryId: remote.category_id,
    description: remote.description,
    notes: remote.notes ?? undefined,
    tags: remote.tags ?? [],
    paymentMethod: remote.payment_method as Expense["paymentMethod"],
    date: new Date(remote.date),
    createdAt: new Date(remote.created_at),
    updatedAt: new Date(remote.updated_at),
    syncStatus: "synced",
  }
}

// ─── Push pending local changes to Supabase ───────────────────────────────────
export async function pushExpenses(userId: string): Promise<number> {
  const pending = await db.expenses
    .where("syncStatus")
    .equals("pending")
    .toArray()

  if (pending.length === 0) return 0

  const rows = pending
    .filter((e): e is Expense & { id: number } => e.id !== undefined)
    .map((e) => toRemote(e, userId))

  const { error } = await supabase
    .from("expenses")
    .upsert(rows, { onConflict: "user_id,local_id" })

  if (error) {
    console.error("[Sync] Push failed:", error.message)
    throw error
  }

  // Mark as synced
  const ids = pending.filter((e) => e.id !== undefined).map((e) => e.id as number)
  await db.expenses.bulkUpdate(ids.map((id) => ({ key: id, changes: { syncStatus: "synced" } })))

  return ids.length
}

// ─── Pull remote changes since lastSyncAt ─────────────────────────────────────
export async function pullExpenses(userId: string): Promise<number> {
  const lastSyncRow = await db.settings.get("lastSyncAt")
  const lastSyncAt: string | null = lastSyncRow?.value ?? null

  let query = supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: true })

  if (lastSyncAt) {
    query = query.gt("updated_at", lastSyncAt)
  }

  const { data, error } = await query

  if (error) {
    console.error("[Sync] Pull failed:", error.message)
    throw error
  }

  if (!data || data.length === 0) return 0

  let updated = 0
  for (const remote of data as RemoteExpense[]) {
    if (remote.deleted_at) {
      // Soft-deleted remotely → delete locally if it exists
      await db.expenses.delete(remote.local_id)
      updated++
      continue
    }

    const local = await db.expenses.get(remote.local_id)
    const remoteUpdatedAt = new Date(remote.updated_at)

    if (!local) {
      // New record from another device
      await db.expenses.put(toLocal(remote) as unknown as Expense)
      updated++
    } else if (remoteUpdatedAt > local.updatedAt) {
      // Remote is newer → last-write-wins
      const { photo } = local // preserve local photo (not synced)
      await db.expenses.update(remote.local_id, { ...toLocal(remote), photo })
      updated++
    }
  }

  // Update lastSyncAt
  await db.settings.put({ key: "lastSyncAt", value: new Date().toISOString() })

  return updated
}

// ─── Full bidirectional sync ───────────────────────────────────────────────────
export type SyncResult = {
  pushed: number
  pulled: number
  error?: string
}

export async function syncAll(userId: string): Promise<SyncResult> {
  try {
    const pushed = await pushExpenses(userId)
    const pulled = await pullExpenses(userId)
    return { pushed, pulled }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown sync error"
    return { pushed: 0, pulled: 0, error: message }
  }
}

// ─── Helper: mark a single expense as dirty (pending sync) ───────────────────
export async function markDirty(expenseId: number) {
  await db.expenses.update(expenseId, { syncStatus: "pending" })
}
