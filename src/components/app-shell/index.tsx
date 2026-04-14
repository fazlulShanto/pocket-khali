import * as React from "react"
import { useRouterState, Outlet } from "@tanstack/react-router"
import { ExpenseForm } from "../expense-form"
import { Toaster } from "@/components/ui/sonner"
import { useExpenses } from "@/hooks/use-expenses"
import { toast } from "sonner"
import { useBudgets } from "@/hooks/use-budgets"
import { CloudSyncIndicator } from "./cloud-sync-indicator"
import { BottomNav } from "./bottom-nav"

export function AppShell() {
  const routerState = useRouterState()
  const { addExpense } = useExpenses()
  const { getBudgetStatus } = useBudgets()
  const [expenseFormOpen, setExpenseFormOpen] = React.useState(false)

  const handleSaveExpense = async (expense: any) => {
    await addExpense(expense)
    const checkLimit = (statusObj: ReturnType<typeof getBudgetStatus>, name: string) => {
      if (statusObj && statusObj.status !== "normal") {
        if (statusObj.status === "warning") {
          toast.warning(`You're at ${Math.round(statusObj.percent)}% of your ${name.toLowerCase()} budget.`)
        } else if (statusObj.status === "critical") {
          toast.error(`Only ${100 - Math.round(statusObj.percent)}% left in your ${name.toLowerCase()}!`)
        } else if (statusObj.status === "overspent") {
          toast.error(`You've overspent your ${name.toLowerCase()} budget!`)
        }
      }
    }

    checkLimit(getBudgetStatus(expense.categoryId), "category")
    checkLimit(getBudgetStatus("overall"), "overall")
    toast.success("Expense saved successfully.")
  }

  const isSettingsActive =
    routerState.location.pathname.startsWith("/settings") ||
    routerState.location.pathname.startsWith("/categories")

  // Don't show nav/shell on login page
  const isAuthPage = routerState.location.pathname === "/login"
  if (isAuthPage) {
    return (
      <>
        <Outlet />
        <Toaster position="top-center" richColors />
      </>
    )
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Top bar with cloud sync indicator */}
      <div className="p-3">
        <CloudSyncIndicator />
      </div>

      <main className="flex-1 w-full bg-background relative overflow-x-hidden pb-28">
        <Outlet />
      </main>

      {/* Floating Bottom Navigation (FAB + Pill) */}
      <BottomNav
        onFabClick={() => setExpenseFormOpen(true)}
        currentPath={routerState.location.pathname}
        isSettingsActive={isSettingsActive}
      />

      {/* Global Overlays */}
      <ExpenseForm
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        onSave={handleSaveExpense}
      />
      <Toaster position="top-center" richColors />
    </div>
  )
}
