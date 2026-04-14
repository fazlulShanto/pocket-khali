import * as React from "react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import { syncAll, type SyncResult } from "../lib/sync"
import { useAuth } from "./use-auth"

interface SyncStatus {
  isSyncing: boolean
  lastSyncAt: Date | null
  pendingCount: number
  lastResult: SyncResult | null
  syncNow: () => Promise<void>
}

export function useSync(): SyncStatus {
  const { user } = useAuth()
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [lastResult, setLastResult] = React.useState<SyncResult | null>(null)

  const lastSyncRow = useLiveQuery(() => db.settings.get("lastSyncAt"))
  const pendingExpenses =
    useLiveQuery(() => db.expenses.where("syncStatus").equals("pending").count()) ?? 0
  const pendingIncomes =
    useLiveQuery(() => db.incomes.where("syncStatus").equals("pending").count()) ?? 0
  const pendingCount = pendingExpenses + pendingIncomes

  const lastSyncAt = lastSyncRow?.value ? new Date(lastSyncRow.value as string) : null

  const syncNow = React.useCallback(async () => {
    if (!user || isSyncing) return
    setIsSyncing(true)
    try {
      const result = await syncAll(user.id)
      setLastResult(result)
    } finally {
      setIsSyncing(false)
    }
  }, [user, isSyncing])

  // Auto-sync when coming back online
  React.useEffect(() => {
    const handleOnline = () => {
      if (user) syncNow()
    }
    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [user, syncNow])

  // Auto-sync on user login
  React.useEffect(() => {
    if (user) {
      syncNow()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return { isSyncing, lastSyncAt, pendingCount, lastResult, syncNow }
}
