import { db } from "../lib/db"
import { supabase } from "../lib/supabase"
import type { Expense, Income } from "../lib/types"

// ─── Expense remote type ───────────────────────────────────────────────────────
interface RemoteExpense {
  id: string           // Supabase UUID (canonical identifier)
  local_id: number     // Dexie auto-id from the device that originally pushed
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

// ─── Income remote type ────────────────────────────────────────────────────────
interface RemoteIncome {
  id: string           // Supabase UUID (canonical identifier)
  local_id: number     // Dexie auto-id from the device that originally pushed
  user_id: string
  amount: number
  currency: string
  source: string
  description: string
  notes: string | null
  date: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// ─── Expense mappers ───────────────────────────────────────────────────────────
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

function toLocal(remote: RemoteExpense): Omit<Expense, "photo"> & { id: number } {
  return {
    id: remote.local_id,
    remoteId: remote.id,          // ← store Supabase UUID
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

// ─── Income mappers ────────────────────────────────────────────────────────────
function toRemoteIncome(income: Income & { id: number }, userId: string): Omit<RemoteIncome, "id"> {
  return {
    local_id: income.id,
    user_id: userId,
    amount: income.amount,
    currency: income.currency,
    source: income.source,
    description: income.description,
    notes: income.notes ?? null,
    date: income.date instanceof Date ? income.date.toISOString() : income.date,
    created_at:
      income.createdAt instanceof Date ? income.createdAt.toISOString() : income.createdAt,
    updated_at:
      income.updatedAt instanceof Date ? income.updatedAt.toISOString() : income.updatedAt,
    deleted_at: null,
  }
}

function toLocalIncome(remote: RemoteIncome): Income & { id: number } {
  return {
    id: remote.local_id,
    remoteId: remote.id,          // ← store Supabase UUID
    amount: remote.amount,
    currency: remote.currency,
    source: remote.source,
    description: remote.description,
    notes: remote.notes ?? undefined,
    date: new Date(remote.date),
    createdAt: new Date(remote.created_at),
    updatedAt: new Date(remote.updated_at),
    syncStatus: "synced",
  }
}

// ─── Push pending expenses to Supabase ────────────────────────────────────────
export async function pushExpenses(userId: string): Promise<number> {
  const pending = await db.expenses
    .where("syncStatus")
    .equals("pending")
    .toArray()

  if (pending.length === 0) return 0

  const rows = pending
    .filter((e): e is Expense & { id: number } => e.id !== undefined)
    .map((e) => toRemote(e, userId))

  const { data: upserted, error } = await supabase
    .from("expenses")
    .upsert(rows, { onConflict: "user_id,local_id" })
    .select("id, local_id")

  if (error) {
    console.error("[Sync] Push expenses failed:", error.message)
    throw error
  }

  // Store remoteId back on local records and mark synced
  if (upserted) {
    for (const row of upserted as { id: string; local_id: number }[]) {
      await db.expenses.update(row.local_id, { remoteId: row.id, syncStatus: "synced" })
    }
  } else {
    // Fallback: just mark synced without remoteId
    const ids = pending.filter((e) => e.id !== undefined).map((e) => e.id as number)
    await db.expenses.bulkUpdate(ids.map((id) => ({ key: id, changes: { syncStatus: "synced" } })))
  }

  return pending.length
}

// ─── Pull remote expenses since lastSyncAt ────────────────────────────────────
export async function pullExpenses(userId: string, lastSyncAt: string | null): Promise<number> {
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
    console.error("[Sync] Pull expenses failed:", error.message)
    throw error
  }

  if (!data || data.length === 0) return 0

  let updated = 0
  for (const remote of data as RemoteExpense[]) {
    // Find local record by remoteId first (works cross-device), fall back to local_id
    const byRemoteId = await db.expenses.where("remoteId").equals(remote.id).first()
    const local = byRemoteId ?? await db.expenses.get(remote.local_id)

    if (remote.deleted_at) {
      if (local?.id !== undefined) {
        await db.expenses.delete(local.id)
        updated++
      }
      continue
    }

    const remoteUpdatedAt = new Date(remote.updated_at)

    if (!local) {
      // New record from another device — let Dexie assign a new local id
      const { id: _ignored, ...withoutId } = toLocal(remote)
      await db.expenses.add(withoutId as unknown as Expense)
      updated++
    } else if (remoteUpdatedAt > local.updatedAt) {
      const photo = (local as Expense).photo
      await db.expenses.update(local.id as number, {
        ...toLocal(remote),
        id: local.id,     // keep the local Dexie id
        photo,
      })
      updated++
    }
  }

  return updated
}

// ─── Push pending incomes to Supabase ─────────────────────────────────────────
export async function pushIncomes(userId: string): Promise<number> {
  const pending = await db.incomes
    .where("syncStatus")
    .equals("pending")
    .toArray()

  if (pending.length === 0) return 0

  const rows = pending
    .filter((i): i is Income & { id: number } => i.id !== undefined)
    .map((i) => toRemoteIncome(i, userId))

  const { data: upserted, error } = await supabase
    .from("incomes")
    .upsert(rows, { onConflict: "user_id,local_id" })
    .select("id, local_id")

  if (error) {
    console.error("[Sync] Push incomes failed:", error.message)
    throw error
  }

  if (upserted) {
    for (const row of upserted as { id: string; local_id: number }[]) {
      await db.incomes.update(row.local_id, { remoteId: row.id, syncStatus: "synced" })
    }
  } else {
    const ids = pending.filter((i) => i.id !== undefined).map((i) => i.id as number)
    await db.incomes.bulkUpdate(ids.map((id) => ({ key: id, changes: { syncStatus: "synced" } })))
  }

  return pending.length
}

// ─── Pull remote incomes since lastSyncAt ─────────────────────────────────────
export async function pullIncomes(userId: string, lastSyncAt: string | null): Promise<number> {
  let query = supabase
    .from("incomes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: true })

  if (lastSyncAt) {
    query = query.gt("updated_at", lastSyncAt)
  }

  const { data, error } = await query

  if (error) {
    console.error("[Sync] Pull incomes failed:", error.message)
    throw error
  }

  if (!data || data.length === 0) return 0

  let updated = 0
  for (const remote of data as RemoteIncome[]) {
    const byRemoteId = await db.incomes.where("remoteId").equals(remote.id).first()
    const local = byRemoteId ?? await db.incomes.get(remote.local_id)

    if (remote.deleted_at) {
      if (local?.id !== undefined) {
        await db.incomes.delete(local.id)
        updated++
      }
      continue
    }

    const remoteUpdatedAt = new Date(remote.updated_at)

    if (!local) {
      const { id: _ignored, ...withoutId } = toLocalIncome(remote)
      await db.incomes.add(withoutId as unknown as Income)
      updated++
    } else if (remoteUpdatedAt > local.updatedAt) {
      await db.incomes.update(local.id as number, {
        ...toLocalIncome(remote),
        id: local.id,     // keep the local Dexie id
      })
      updated++
    }
  }

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
    const lastSyncRow = await db.settings.get("lastSyncAt")
    const lastSyncAt: string | null = lastSyncRow?.value ?? null

    // Push all pending local changes first
    const [pushedExpenses, pushedIncomes] = await Promise.all([
      pushExpenses(userId),
      pushIncomes(userId),
    ])

    // Then pull remote changes since last sync
    const [pulledExpenses, pulledIncomes] = await Promise.all([
      pullExpenses(userId, lastSyncAt),
      pullIncomes(userId, lastSyncAt),
    ])

    // Update lastSyncAt after all pulls
    await db.settings.put({ key: "lastSyncAt", value: new Date().toISOString() })

    return {
      pushed: pushedExpenses + pushedIncomes,
      pulled: pulledExpenses + pulledIncomes,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown sync error"
    return { pushed: 0, pulled: 0, error: message }
  }
}

// ─── Helper: mark a single expense as dirty (pending sync) ───────────────────
export async function markDirty(expenseId: number) {
  await db.expenses.update(expenseId, { syncStatus: "pending" })
}

// ─── Helper: mark a single income as dirty (pending sync) ────────────────────
export async function markIncomeDirty(incomeId: number) {
  await db.incomes.update(incomeId, { syncStatus: "pending" })
}
