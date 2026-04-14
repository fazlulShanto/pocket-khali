import * as React from "react"
import { Link, useRouterState, Outlet } from "@tanstack/react-router"
import { Home, ListOrdered, PieChart, Wallet, Settings } from "lucide-react"
import { ExpenseForm } from "./expense-form"
import { Fab } from "./fab"
import { Toaster } from "@/components/ui/sonner"
import { useExpenses } from "@/hooks/use-expenses"
import { toast } from "sonner"
import { useBudgets } from "@/hooks/use-budgets"

const NavItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: ListOrdered, label: "List", to: "/transactions" },
  { isFabSpace: true }, // Placeholder for the physical FAB center notch
  { icon: Wallet, label: "Budgets", to: "/budgets" },
  { icon: PieChart, label: "Reports", to: "/analytics" },
]

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

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <main className="flex-1 w-full bg-background relative overflow-x-hidden">
        <Outlet />
      </main>

      {/* Global Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-t pb-safe-area shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto flex items-center justify-between px-2 h-16">
          {NavItems.map((item, idx) => {
            if (item.isFabSpace) {
              return <div key="fab-space" className="w-14" /> // Space for the FAB
            }

            const Icon = item.icon!
            const isActive = routerState.location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-primary rounded-b-full -translate-y-1/2 shadow-[0_2px_10px] shadow-primary/50" />
                )}
              </Link>
            )
          })}

          <Link
            to="/settings"
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all relative ${routerState.location.pathname.startsWith("/settings") || routerState.location.pathname.startsWith("/categories") ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">Settings</span>
          </Link>
        </div>
      </nav>

      {/* Global FAB centered */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Fab onClick={() => setExpenseFormOpen(true)} />
      </div>

      <ExpenseForm
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        onSave={handleSaveExpense}
      />
      <Toaster position="top-center" richColors />
    </div>
  )
}
