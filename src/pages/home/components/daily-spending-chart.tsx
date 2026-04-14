import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts"

interface DailySpendingChartProps {
  dailyTrend: Array<{
    day: number
    amount: number
  }>
  defaultCurrency: string
}

export const DailySpendingChart = ({ dailyTrend, defaultCurrency }: DailySpendingChartProps) => {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Daily Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {dailyTrend.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval="preserveStartEnd" minTickGap={20} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                  formatter={(value: number) => [`${defaultCurrency === "BDT" ? "৳" : "$"} ${value}`, "Spent"]}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No data this month
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
