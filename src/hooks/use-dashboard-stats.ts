import { useMemo } from "react"
import { useExpenses } from "./use-expenses"
import { useCategories } from "./use-categories"
import { useIncomes } from "./use-incomes"

export function useDashboardStats() {
  const { expenses } = useExpenses()
  const { categories } = useCategories()
  const { incomes } = useIncomes()

  return useMemo(() => {
    if (!expenses || !categories) {
      return {
        totalThisMonth: 0,
        totalLastMonth: 0,
        percentChange: 0,
        totalIncomeThisMonth: 0,
        totalIncomeLastMonth: 0,
        netSavings: 0,
        byCategory: [],
        dailyTrend: [],
        recentExpenses: [],
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
    // dailyCategoryMap: day → { categoryId: amount }
    const dailyCategoryMap: Record<number, Record<number, number>> = {}

    // Initialize daily map for this month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      dailyCategoryMap[i] = {}
    }

    expenses.forEach(exp => {
      const date = new Date(exp.date)
      const month = date.getMonth()
      const year = date.getFullYear()

      if (month === currentMonth && year === currentYear) {
        totalThisMonth += exp.amount

        // Category grouping
        categoryMap[exp.categoryId] = (categoryMap[exp.categoryId] || 0) + exp.amount

        // Daily + category grouping
        const day = date.getDate()
        if (!dailyCategoryMap[day]) dailyCategoryMap[day] = {}
        dailyCategoryMap[day][exp.categoryId] = (dailyCategoryMap[day][exp.categoryId] || 0) + exp.amount
      } else if (month === lastMonth && year === lastMonthYear) {
        totalLastMonth += exp.amount
      }
    })

    // Percent change
    let percentChange = 0
    if (totalLastMonth > 0) {
      percentChange = ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
    } else if (totalThisMonth > 0) {
      percentChange = 100
    }

    // Income stats
    let totalIncomeThisMonth = 0
    let totalIncomeLastMonth = 0

    if (incomes) {
      incomes.forEach(inc => {
        const date = new Date(inc.date)
        const month = date.getMonth()
        const year = date.getFullYear()

        if (month === currentMonth && year === currentYear) {
          totalIncomeThisMonth += inc.amount
        } else if (month === lastMonth && year === lastMonthYear) {
          totalIncomeLastMonth += inc.amount
        }
      })
    }

    const netSavings = totalIncomeThisMonth - totalThisMonth

    // Pie chart data
    const byCategory = Object.keys(categoryMap).map(catIdStr => {
      const catId = Number(catIdStr)
      const category = categories.find(c => c.id === catId)
      return {
        name: category?.name || "Unknown",
        value: categoryMap[catId],
        color: category?.color || "#94a3b8"
      }
    }).sort((a, b) => b.value - a.value)

    // Daily Trend – one entry per day, with a key per categoryId
    const dailyTrend = Object.keys(dailyCategoryMap).map(dayStr => {
      const day = Number(dayStr)
      const entry: Record<string, number> & { day: number } = { day }
      Object.keys(dailyCategoryMap[day]).forEach(catIdStr => {
        entry[catIdStr] = dailyCategoryMap[day][Number(catIdStr)]
      })
      return entry
    })

    // Recent Expenses
    const recentExpenses = expenses.slice(0, 5)

    return {
      totalThisMonth,
      totalLastMonth,
      percentChange,
      totalIncomeThisMonth,
      totalIncomeLastMonth,
      netSavings,
      byCategory,
      dailyTrend,
      recentExpenses,
    }
  }, [expenses, categories, incomes])
}
