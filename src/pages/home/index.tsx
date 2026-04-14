import * as React from "react"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useCategories } from "@/hooks/use-categories"
import { useSettings } from "@/hooks/use-settings"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, AlertCircle } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Icons, getIcon, type IconName } from "@/components/icons"

export const HomePage = () => {
    const { totalThisMonth, percentChange, byCategory, dailyTrend, recentExpenses } = useDashboardStats()
    const { categories } = useCategories()
    const { settings } = useSettings()

    const defaultCurrency = settings?.defaultCurrency || "BDT"
    const isUp = percentChange > 0

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
        <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground font-medium">Overwiew</p>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </h1>
                    </div>
                </div>
                <div className="flex bg-muted/50 rounded-full p-1 border">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Summary Card */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Pie Chart */}
                <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Spending by Category</CardTitle>
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
                                            innerRadius={60}
                                            outerRadius={80}
                                            strokeWidth={4}
                                            stroke="var(--background)"
                                            paddingAngle={2}
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

                {/* Daily Trend Chart */}
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
            </div>

            {/* Recent Transactions */}
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
        </div>
    )
}