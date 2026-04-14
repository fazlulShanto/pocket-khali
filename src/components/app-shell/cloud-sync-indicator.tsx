
import { Link } from "@tanstack/react-router"
import { CloudOff, CloudUpload, Cloud, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSync } from "@/hooks/use-sync"

export function CloudSyncIndicator() {
  const { user } = useAuth()
  const { isSyncing, pendingCount } = useSync()

  if (!user) {
    return (
      <Link
        to="/login"
        className="flex items-center justify-center size-8 rounded-full bg-muted hover:bg-muted/80 transition-colors relative"
        title="Sign in for Cloud Sync"
      >
        <CloudOff className="size-6 text-muted-foreground" />
      </Link>
    )
  }

  return (
    <Link
      to="/settings"
      className="flex items-center justify-center size-8 rounded-full bg-green-500/10 hover:bg-green-500/20 transition-colors relative"
      title={isSyncing ? "Syncing..." : pendingCount > 0 ? `${pendingCount} pending` : "Synced"}
    >
      {isSyncing ? (
        <Loader2 className="size-6 animate-spin text-primary" />
      ) : pendingCount > 0 ? (
        <>
          <CloudUpload className="size-6 text-yellow-500" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 text-[9px] font-bold text-white flex items-center justify-center leading-none">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        </>
      ) : (
        <Cloud className="size-6 text-green-500" />
      )}
    </Link>
  )
}
