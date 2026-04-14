import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@tanstack/react-router"
import { getIcon } from "@/components/icons"

interface RecentTransactionsProps {
  recentExpenses: any[]
  categories: any[]
  defaultCurrency: string
}

export const RecentTransactions = ({ recentExpenses, categories, defaultCurrency }: RecentTransactionsProps) => {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Recent Transactions</CardTitle>
        <Link to="/transactions" className="text-xs font-semibold text-primary hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent className="px-0">
        {recentExpenses.length > 0 ? (
          <div className="flex flex-col divide-y">
            {recentExpenses.map(expense => {
              const category = categories?.find(c => c.id === expense.categoryId)
              const Icon = getIcon(category?.icon)
              const catColor = category?.color || "#94a3b8"

              return (
                <div key={expense.id} className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: `${catColor}20`, color: catColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-medium text-sm truncate">{expense.description}</span>
                      <span className="text-xs text-muted-foreground truncate">{category?.name || "Unknown"}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-sm whitespace-nowrap text-foreground">
                    {defaultCurrency === "BDT" ? "৳" : "$"} {expense.amount.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No transactions recorded yet. <br />Use the + button to add one!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
