"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface Category {
  id: number
  name: string
  color: string
}

interface DailySpendingChartProps {
  /** Each entry has a `day` number plus one key per categoryId holding the amount spent */
  dailyTrend: Array<Record<string, number> & { day: number }>
  /** All categories present in the data, used to build bar + legend config */
  categories: Category[]
  defaultCurrency: string
}

export function DailySpendingChart({ dailyTrend, categories, defaultCurrency }: DailySpendingChartProps) {
  const currencySymbol = defaultCurrency === "BDT" ? "৳" : "$"

  // Build chartConfig dynamically from the categories that actually appear in dailyTrend
  const activeCategoryIds = new Set<number>()
  dailyTrend.forEach(day => {
    Object.keys(day).forEach(key => {
      if (key !== "day") activeCategoryIds.add(Number(key))
    })
  })

  const activeCategories = categories.filter(c => activeCategoryIds.has(c.id))

  const chartConfig: ChartConfig = {}
  activeCategories.forEach(cat => {
    chartConfig[String(cat.id)] = {
      label: cat.name,
      color: cat.color,
    }
  })

  const hasData = dailyTrend.some(d =>
    Object.keys(d).some(k => k !== "day" && d[k] > 0)
  )

  // Determine how many ticks to show so the axis doesn't crowd on mobile
  const tickInterval = dailyTrend.length > 20 ? 4 : dailyTrend.length > 10 ? 2 : 1

  // Pick the bars whose radius should be rounded at the top (last stacked bar)
  const lastCatId = activeCategories.length > 0
    ? String(activeCategories[activeCategories.length - 1].id)
    : null

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Daily Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart data={dailyTrend} margin={{ top: 4, right: 0, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 10 }}
                interval={tickInterval - 1}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) =>
                      [`${currencySymbol}${Number(value).toFixed(2)}`, chartConfig[name]?.label ?? name]
                    }
                    labelFormatter={label => `Day ${label}`}
                  />
                }
              />
              {activeCategories.map((cat, idx) => {
                const isFirst = idx === 0
                const isLast = String(cat.id) === lastCatId
                return (
                  <Bar
                    key={cat.id}
                    dataKey={String(cat.id)}
                    stackId="daily"
                    fill={cat.color}
                    radius={
                      isLast && isFirst
                        ? [4, 4, 4, 4]   // only bar – round all corners
                        : isLast
                          ? [4, 4, 0, 0]   // top of stack
                          : isFirst
                            ? [0, 0, 4, 4]   // bottom of stack
                            : [0, 0, 0, 0]
                    }
                  />
                )
              })}
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
            No spending data this month
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pb-3">
        Each bar shows daily spending broken down by category
      </CardFooter>
    </Card>
  )
}
