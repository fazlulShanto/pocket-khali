import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface SpendingByCategoryProps {
  byCategory: Array<{
    name: string
    value: number
    color: string
  }>
}

export const SpendingByCategory = ({ byCategory }: SpendingByCategoryProps) => {
  const chartConfig = React.useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {}
    byCategory.forEach(item => {
      config[item.name] = {
        label: item.name,
        color: item.color
      }
    })
    return config
  }, [byCategory])

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Total Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {byCategory.length > 0 ? (
          <div className="h-[200px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  stroke="var(--background)"
                  paddingAngle={0.4}
                >
                  {byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            No data this month
          </div>
        )}
      </CardContent>
    </Card>
  )
}
