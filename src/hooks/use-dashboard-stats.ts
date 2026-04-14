import { useMemo } from "react"
import { useExpenses } from "./use-expenses"
import { useCategories } from "./use-categories"

export function useDashboardStats() {
  const { expenses } = useExpenses()
  const { categories } = useCategories()

  return useMemo(() => {
    if (!expenses || !categories) {
      return {
        totalThisMonth: 0,
        totalLastMonth: 0,
        percentChange: 0,
        byCategory: [],
        dailyTrend: [],
        recentExpenses: []
      }
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Previous month calculation
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    let totalThisMonth = 0
    let totalLastMonth = 0

    const categoryMap: Record<number, number> = {}
    const dailyMap: Record<number, number> = {}

    // Initialize daily map for this month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
        dailyMap[i] = 0
    }

    expenses.forEach(exp => {
      const date = new Date(exp.date)
      const month = date.getMonth()
      const year = date.getFullYear()

      if (month === currentMonth && year === currentYear) {
        totalThisMonth += exp.amount
        
        // Category grouping
        categoryMap[exp.categoryId] = (categoryMap[exp.categoryId] || 0) + exp.amount
        
        // Daily grouping
        const day = date.getDate()
        dailyMap[day] += exp.amount
      } else if (month === lastMonth && year === lastMonthYear) {
        totalLastMonth += exp.amount
      }
    })

    // Percent change
    let percentChange = 0
    if (totalLastMonth > 0) {
      percentChange = ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
    } else if (totalThisMonth > 0) {
      percentChange = 100 // up 100% if last month was 0
    }

    // Pie chart Data
    const byCategory = Object.keys(categoryMap).map(catIdStr => {
      const catId = Number(catIdStr)
      const category = categories.find(c => c.id === catId)
      return {
        name: category?.name || "Unknown",
        value: categoryMap[catId],
        color: category?.color || "#94a3b8"
      }
    }).sort((a, b) => b.value - a.value)

    // Daily Trend
    const dailyTrend = Object.keys(dailyMap).map(day => ({
      day: Number(day),
      amount: dailyMap[Number(day)]
    }))

    // Recent Expenses
    const recentExpenses = expenses.slice(0, 5) // since expenses are sorted by date descending in useExpenses

    return {
      totalThisMonth,
      totalLastMonth,
      percentChange,
      byCategory,
      dailyTrend,
      recentExpenses
    }
  }, [expenses, categories])
}
