import * as React from "react"
import { useExpenses } from "@/hooks/use-expenses"
import { useCategories } from "@/hooks/use-categories"
import { useSettings } from "@/hooks/use-settings"
import { exportToCSV, exportToJSON } from "@/lib/export"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { DownloadCloud, Table2 } from "lucide-react"

export const AnalyticsPage = () => {
  const { expenses } = useExpenses()
  const { categories } = useCategories()
  const { settings } = useSettings()

  const defaultCurrency = settings?.defaultCurrency || "BDT"

  // Process data for category breakdown
  const categoryData = React.useMemo(() => {
    if (!expenses || !categories) return []

    const map: Record<number, { amount: number, count: number }> = {}
    let total = 0
    expenses.forEach(exp => {
      if (!map[exp.categoryId]) map[exp.categoryId] = { amount: 0, count: 0 }
      map[exp.categoryId].amount += exp.amount
      map[exp.categoryId].count += 1
      total += exp.amount
    })

    return Object.keys(map).map(idStr => {
      const id = Number(idStr)
      const category = categories.find(c => c.id === id)
      return {
        id,
        name: category?.name || "Unknown",
        color: category?.color || "#94a3b8",
        amount: map[id].amount,
        count: map[id].count,
        percent: total > 0 ? (map[id].amount / total) * 100 : 0
      }
    }).sort((a, b) => b.amount - a.amount)

  }, [expenses, categories])

  // Process data for time trends (monthly)
  const monthlyData = React.useMemo(() => {
    if (!expenses) return []
    const map: Record<string, number> = {}
    
    expenses.forEach(exp => {
      const date = new Date(exp.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
      map[key] = (map[key] || 0) + exp.amount
    })

    return Object.keys(map).sort().map(key => {
      const [y, m] = key.split('-')
      const date = new Date(Number(y), Number(m) - 1, 1)
      return {
        key,
        label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), // "Jan 24"
        amount: map[key]
      }
    }).slice(-12) // Show last 12 active months
  }, [expenses])

  const chartConfig = React.useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {}
    categoryData.forEach(item => {
      config[item.name] = { label: item.name, color: item.color }
    })
    return config
  }, [categoryData])

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep dive into your spending habits.</p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <>
                  <div className="h-[250px] w-full mb-6 relative">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <RechartsTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Pie
                          data={categoryData}
                          dataKey="amount"
                          nameKey="name"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={2}
                          stroke="var(--background)"
                          strokeWidth={2}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </div>
                  
                  {/* Data Table */}
                  <div className="space-y-3">
                    {categoryData.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-sm">{item.name}</span>
                          <span className="text-xs text-muted-foreground ml-1">({item.percent.toFixed(1)}%)</span>
                        </div>
                        <span className="font-semibold text-sm">
                           {defaultCurrency === "BDT" ? "৳" : "$"} {item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={45} tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '13px' }}
                        formatter={(value: number) => [`${defaultCurrency === "BDT" ? "৳" : "$"} ${value.toLocaleString()}`, "Spent"]}
                        cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download your expenses for spreadsheet use or other apps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Table2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">CSV Spreadsheet</h4>
                    <p className="text-xs text-muted-foreground hidden sm:block">Works with Excel, Google Sheets</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => exportToCSV(expenses || [], categories)} disabled={!expenses?.length}>
                  <DownloadCloud className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>

               <div className="p-4 border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center font-mono font-bold">
                    {`{ }`}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Lightweight JSON</h4>
                    <p className="text-xs text-muted-foreground hidden sm:block">Developer friendly format</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => exportToJSON(expenses || [])} disabled={!expenses?.length}>
                  <DownloadCloud className="w-4 h-4 mr-2" />
                  Download JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  )
}