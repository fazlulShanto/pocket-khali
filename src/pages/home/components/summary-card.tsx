import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"

interface SummaryCardProps {
  totalThisMonth: number
  percentChange: number
  defaultCurrency: string
}

export const SummaryCard = ({ totalThisMonth, percentChange, defaultCurrency }: SummaryCardProps) => {
  const isUp = percentChange > 0

  return (
    <Card className="bg-primary text-primary-foreground border-none rounded-2xl shadow-md overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <CardContent className="p-6 relative z-10">
        <p className="text-primary-foreground/80 font-medium mb-1 tracking-wide uppercase text-xs">Total Spent</p>
        <div className="flex items-end gap-3 mb-4">
          <h2 className="text-5xl font-extrabold tracking-tight">
            <span className="text-3xl opacity-70 mr-1">{defaultCurrency === "BDT" ? "৳" : "$"}</span>
            {totalThisMonth.toLocaleString()}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${isUp ? 'bg-destructive/20 text-destructive-foreground' : 'bg-green-500/20 text-green-100'} backdrop-blur-sm`}>
            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(percentChange).toFixed(1)}%</span>
          </div>
          <span className="text-primary-foreground/70">vs last month</span>
        </div>
      </CardContent>
    </Card>
  )
}
