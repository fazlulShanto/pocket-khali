import * as React from "react"
import { useRouterState, Outlet } from "@tanstack/react-router"
import { TransactionSheet } from "../transaction-sheet"
import type { FormType } from "../transaction-sheet"
import { Toaster } from "@/components/ui/sonner"
import { useExpenses } from "@/hooks/use-expenses"
import { useIncomes } from "@/hooks/use-incomes"
import { toast } from "sonner"
import { useBudgets } from "@/hooks/use-budgets"
import { CloudSyncIndicator } from "./cloud-sync-indicator"
import { BottomNav } from "./bottom-nav"

export function AppShell() {
  const routerState = useRouterState()
  const { addExpense } = useExpenses()
  const { addIncome } = useIncomes()
  const { getBudgetStatus } = useBudgets()
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [initialFormType, setInitialFormType] = React.useState<FormType>("expense")

  const handleSaveExpense = async (expense: any) => {
    await addExpense(expense)
    const checkLimit = (statusObj: ReturnType<typeof getBudgetStatus>, name: string) => {
      if (!statusObj || statusObj.status === "normal") return
      if (statusObj.status === "warning")
        toast.warning(`You're at ${Math.round(statusObj.percent)}% of your ${name.toLowerCase()} budget.`)
      else if (statusObj.status === "critical")
        toast.error(`Only ${100 - Math.round(statusObj.percent)}% left in your ${name.toLowerCase()}!`)
      else if (statusObj.status === "overspent")
        toast.error(`You've overspent your ${name.toLowerCase()} budget!`)
    }
    checkLimit(getBudgetStatus(expense.categoryId), "category")
    checkLimit(getBudgetStatus("overall"), "overall")
    toast.success("Expense saved.")
  }

  const handleSaveIncome = async (income: any) => {
    await addIncome(income)
    toast.success("Income saved.")
  }

  const isSettingsActive =
    routerState.location.pathname.startsWith("/settings") ||
    routerState.location.pathname.startsWith("/categories")

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
      <main className="flex-1 w-full bg-background relative overflow-x-hidden pb-28">
        <Outlet />
      </main>

      <BottomNav
        onFabClick={() => {
          setInitialFormType("expense")
          setSheetOpen(true)
        }}
        currentPath={routerState.location.pathname}
        isSettingsActive={isSettingsActive}
      />

      <TransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialType={initialFormType}
        onSaveExpense={handleSaveExpense}
        onSaveIncome={handleSaveIncome}
      />
      <Toaster position="top-center" richColors />
    </div>
  )
}
