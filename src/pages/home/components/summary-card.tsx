import * as React from "react"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"
import { useBudgets } from "@/hooks/use-budgets"

interface SummaryCardProps {
  totalThisMonth: number
  totalLastMonth: number
  percentChange: number
  totalIncomeThisMonth: number
  netSavings: number
  defaultCurrency: string
}

export const SummaryCard = ({
  totalThisMonth,
  totalLastMonth,
  percentChange,
  totalIncomeThisMonth,
  netSavings,
  defaultCurrency,
}: SummaryCardProps) => {
  const { getBudgetStatus } = useBudgets()
  const overallBudget = getBudgetStatus("overall")

  const isUp = percentChange > 0
  const currencySymbol = defaultCurrency === "BDT" ? "৳" : "$"

  const budgetLimit = overallBudget?.limit ?? 0
  const budgetSpent = overallBudget?.spent ?? totalThisMonth
  const budgetPercent = budgetLimit > 0 ? Math.min(100, (budgetSpent / budgetLimit) * 100) : 0
  const progressColor =
    budgetPercent >= 100 ? "#ef4444" : budgetPercent >= 80 ? "#f97316" : "#a78bfa"

  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount)
    if (abs >= 1_00_000) return `${(abs / 1_00_000).toFixed(1)}L`
    if (abs >= 1000) return abs.toLocaleString("en-IN")
    return abs.toLocaleString()
  }

  const savings = netSavings
  const savingsPositive = savings >= 0

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(99,60,180,0.35), 0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "-3rem", right: "-3rem", width: "10rem", height: "10rem", background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-2rem", left: "-2rem", width: "8rem", height: "8rem", background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <p style={{ color: "rgba(221,214,254,0.75)", fontSize: "0.775rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          This Month
        </p>
        <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "999px", padding: "0.25rem 0.75rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Wallet size={12} color="rgba(221,214,254,0.8)" />
          <span style={{ color: "rgba(221,214,254,0.9)", fontSize: "0.72rem", fontWeight: 600 }}>Overview</span>
        </div>
      </div>

      {/* Total expense (main number) */}
      <div style={{ marginBottom: "0.5rem" }}>
        <p style={{ color: "rgba(196,181,253,0.6)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>Total Expenses</p>
        <h2 style={{ color: "#ffffff", fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 600, opacity: 0.7, marginRight: "0.15rem" }}>{currencySymbol}</span>
          {formatAmount(totalThisMonth)}
        </h2>
      </div>

      {/* % change badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: isUp ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)", border: `1px solid ${isUp ? "rgba(239,68,68,0.35)" : "rgba(34,197,94,0.35)"}`, borderRadius: "999px", padding: "0.15rem 0.6rem" }}>
          {isUp ? <TrendingUp size={11} color="#fca5a5" /> : <TrendingDown size={11} color="#86efac" />}
          <span style={{ color: isUp ? "#fca5a5" : "#86efac", fontSize: "0.72rem", fontWeight: 700 }}>
            {isUp ? "+" : ""}{Math.abs(percentChange).toFixed(1)}%
          </span>
        </div>
        <span style={{ color: "rgba(196,181,253,0.6)", fontSize: "0.72rem" }}>vs last month ({currencySymbol}{formatAmount(totalLastMonth)})</span>
      </div>

      {/* Budget progress bar */}
      {budgetLimit > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ color: "rgba(196,181,253,0.6)", fontSize: "0.65rem" }}>Budget used</span>
            <span style={{ color: "rgba(196,181,253,0.8)", fontSize: "0.65rem", fontWeight: 600 }}>{budgetPercent.toFixed(0)}%</span>
          </div>
          <div style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${budgetPercent}%`, background: `linear-gradient(90deg, #a78bfa, ${progressColor})`, borderRadius: "999px", transition: "width 0.6s ease", boxShadow: `0 0 8px ${progressColor}88` }} />
          </div>
        </div>
      )}

      {/* ── Income / Expense / Savings pills ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
        {/* Income */}
        <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "1rem", padding: "0.6rem 0.6rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.65rem" }}>⬆️</span>
            <span style={{ color: "rgba(196,181,253,0.65)", fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Income</span>
          </div>
          <span style={{ color: "#86efac", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            {currencySymbol}{formatAmount(totalIncomeThisMonth)}
          </span>
        </div>

        {/* Expense */}
        <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "1rem", padding: "0.6rem 0.6rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.65rem" }}>⬇️</span>
            <span style={{ color: "rgba(196,181,253,0.65)", fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Expense</span>
          </div>
          <span style={{ color: "#fca5a5", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            {currencySymbol}{formatAmount(totalThisMonth)}
          </span>
        </div>

        {/* Savings */}
        <div style={{ background: savingsPositive ? "rgba(167,139,250,0.15)" : "rgba(239,68,68,0.12)", border: `1px solid ${savingsPositive ? "rgba(167,139,250,0.3)" : "rgba(239,68,68,0.25)"}`, borderRadius: "1rem", padding: "0.6rem 0.6rem", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <PiggyBank size={10} color="rgba(196,181,253,0.65)" />
            <span style={{ color: "rgba(196,181,253,0.65)", fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Savings</span>
          </div>
          <span style={{ color: savingsPositive ? "#c4b5fd" : "#fca5a5", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>
            {savingsPositive ? "+" : "-"}{currencySymbol}{formatAmount(savings)}
          </span>
        </div>
      </div>
    </div>
  )
}
