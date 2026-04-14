import * as React from "react"
import { useSettings } from "@/hooks/use-settings"
import { exportDatabase, importDatabase, clearDatabase } from "@/lib/backup"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import {
  Palette,
  Coins,
  CreditCard,
  DatabaseBackup,
  Trash2,
  Tags,
  Info,
  Download,
  Upload,
  Cloud,
  CloudOff,
  CloudUpload,
  Loader2,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useAuth } from "@/hooks/use-auth"
import { useSync } from "@/hooks/use-sync"
import { signOut } from "@/lib/auth"

// ─── Cloud Sync Section ────────────────────────────────────────────────────────
function CloudSyncSection() {
  const { user } = useAuth()
  const { isSyncing, lastSyncAt, pendingCount, lastResult, syncNow } = useSync()

  const formatSyncTime = (date: Date | null) => {
    if (!date) return "Never"
    const diff = Date.now() - date.getTime()
    if (diff < 60_000) return "Just now"
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`
    return date.toLocaleDateString()
  }

  const handleSignOut = async () => {
    if (!confirm("Sign out of Cloud Sync? Your local data will stay on this device.")) return
    try {
      await signOut()
      toast.success("Signed out successfully")
    } catch {
      toast.error("Failed to sign out")
    }
  }

  if (!user) {
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
          Cloud Sync
        </h2>
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 flex flex-col gap-4">
            {/* Promo card */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                <CloudOff className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Sync to the cloud</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  Register for free to back up your expenses and access them on any device.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                Encrypted & secure — only you can see your data
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                Works offline — sync happens automatically when online
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                Multi-device access
              </div>
            </div>
            <Link to="/login">
              <Button className="w-full gap-2">
                <Cloud className="w-4 h-4" />
                Sign In / Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Logged in view
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
        Cloud Sync
      </h2>
      <div className="bg-card border rounded-xl divide-y overflow-hidden shadow-sm">
        {/* Status row */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                lastResult?.error
                  ? "bg-destructive/10"
                  : isSyncing
                    ? "bg-primary/10"
                    : pendingCount > 0
                      ? "bg-yellow-500/10"
                      : "bg-green-500/10"
              }`}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : lastResult?.error ? (
                <AlertCircle className="w-4 h-4 text-destructive" />
              ) : pendingCount > 0 ? (
                <CloudUpload className="w-4 h-4 text-yellow-500" />
              ) : (
                <Cloud className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isSyncing
                  ? "Syncing..."
                  : lastResult?.error
                    ? "Sync error"
                    : pendingCount > 0
                      ? `${pendingCount} pending`
                      : "All synced"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lastResult?.error
                  ? lastResult.error.slice(0, 60)
                  : `Last synced: ${formatSyncTime(lastSyncAt)}`}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={syncNow}
            disabled={isSyncing}
            className="gap-1.5 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>

        {/* Account row */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {user.email?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-sm font-medium truncate max-w-[180px]">{user.email}</p>
              <p className="text-xs text-muted-foreground">Cloud Sync active</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 text-muted-foreground hover:text-destructive shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>

        {/* Stats row */}
        {(lastResult?.pushed !== undefined || lastResult?.pulled !== undefined) && (
          <div className="px-4 py-3 bg-muted/30 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Last sync: ↑ {lastResult.pushed} pushed · ↓ {lastResult.pulled} pulled</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Settings Page ────────────────────────────────────────────────────────
export const SettingsPage = () => {
  const { theme, setTheme } = useTheme()
  const { settings, setSetting } = useSettings()

  const defaultCurrency = settings?.defaultCurrency || "BDT"
  const defaultPaymentMethod = settings?.defaultPaymentMethod || "cash"

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSetting("defaultCurrency", e.target.value)
    toast.success(`Currency changed to ${e.target.value}`)
  }

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSetting("defaultPaymentMethod", e.target.value)
    toast.success("Default payment method updated")
  }

  const handleExportDB = async () => {
    const success = await exportDatabase()
    if (success) toast.success("Database exported successfully")
    else toast.error("Failed to export database")
  }

  const handleImportDB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (confirm("This will replace all current data. Are you absolutely sure?")) {
      const success = await importDatabase(file)
      if (success) {
        toast.success("Data imported successfully! Reloading...")
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error("Failed to import database. Check file format.")
      }
    }

    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleClearData = async () => {
    if (confirm("DANGER: This will permanently delete ALL data. Type 'DELETE' to confirm.")) {
      const userOk = prompt("Type DELETE to confirm")
      if (userOk === "DELETE") {
        await clearDatabase()
        toast.success("All data cleared. Reloading...")
        setTimeout(() => window.location.reload(), 1500)
      }
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 space-y-6 pb-24 pt-14">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences and data.</p>
      </div>

      {/* Cloud Sync */}
      <CloudSyncSection />

      {/* Appearance */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
          Appearance
        </h2>
        <div className="bg-card border rounded-xl divide-y overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Palette className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="theme-toggle" className="text-base font-medium">
                Dark Mode
              </Label>
            </div>
            <Switch
              id="theme-toggle"
              checked={
                theme === "dark" ||
                (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
              }
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>
      </div>

      {/* Defaults */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
          Defaults
        </h2>
        <div className="bg-card border rounded-xl divide-y overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Coins className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="currency-select" className="text-base font-medium">
                Currency
              </Label>
            </div>
            <select
              id="currency-select"
              className="bg-transparent text-sm font-medium focus:outline-none"
              value={defaultCurrency}
              onChange={handleCurrencyChange}
            >
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <CreditCard className="w-4 h-4 text-primary" />
              </div>
              <Label htmlFor="payment-select" className="text-base font-medium">
                Payment Method
              </Label>
            </div>
            <select
              id="payment-select"
              className="bg-transparent text-sm font-medium focus:outline-none"
              value={defaultPaymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <option value="cash">Cash</option>
              <option value="bank_card">Bank Card</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
            </select>
          </div>

          <Link
            to="/categories"
            className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Tags className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium">Manage Categories</span>
                <span className="text-xs text-muted-foreground">Add, edit, or set smart keywords</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
          Data Backup
        </h2>
        <div className="bg-card border rounded-xl divide-y overflow-hidden shadow-sm">
          <button
            onClick={handleExportDB}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Download className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium">Export Backup</span>
                <span className="text-xs text-muted-foreground">Save all data, including photos</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Upload className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium">Import Backup</span>
                <span className="text-xs text-muted-foreground">Restore from a previous backup</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleImportDB}
            />
          </button>

          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 group-hover:bg-destructive rounded-lg transition-colors">
                <Trash2 className="w-4 h-4 text-destructive group-hover:text-destructive-foreground transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium text-destructive">Wipe Data</span>
                <span className="text-xs text-destructive/70">Permanently delete everything</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="flex items-center justify-center pt-4 opacity-50">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wider">POCKET KHALI v1.0</span>
        </div>
      </div>
    </div>
  )
}
