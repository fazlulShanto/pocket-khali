import * as React from "react"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useCategories } from "@/hooks/use-categories"
import { useSettings } from "@/hooks/use-settings"
import { SummaryCard } from "./components/summary-card"
import { SpendingByCategory } from "./components/spending-by-category"
import { DailySpendingChart } from "./components/daily-spending-chart"
import { RecentTransactions } from "./components/recent-transactions"

export const HomePage = () => {
  const { totalThisMonth, totalLastMonth, percentChange, byCategory, dailyTrend, recentExpenses } = useDashboardStats()
  const { categories } = useCategories()
  const { settings } = useSettings()

  const defaultCurrency = settings?.defaultCurrency || "BDT"

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Overview</p>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h1>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <SummaryCard
        totalThisMonth={totalThisMonth}
        totalLastMonth={totalLastMonth}
        percentChange={percentChange}
        defaultCurrency={defaultCurrency}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SpendingByCategory byCategory={byCategory} />
        <DailySpendingChart dailyTrend={dailyTrend} defaultCurrency={defaultCurrency} />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions
        recentExpenses={recentExpenses}
        categories={categories}
        defaultCurrency={defaultCurrency}
      />
    </div>
  )
}