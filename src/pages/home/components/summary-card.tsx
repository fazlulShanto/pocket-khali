import * as React from "react"
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useBudgets } from "@/hooks/use-budgets"

interface SummaryCardProps {
  totalThisMonth: number
  totalLastMonth: number
  percentChange: number
  defaultCurrency: string
}

export const SummaryCard = ({
  totalThisMonth,
  totalLastMonth,
  percentChange,
  defaultCurrency,
}: SummaryCardProps) => {
  const { getBudgetStatus } = useBudgets()
  const overallBudget = getBudgetStatus("overall")

  const isUp = percentChange > 0
  const currencySymbol = defaultCurrency === "BDT" ? "৳" : "$"

  const budgetLimit = overallBudget?.limit ?? 0
  const budgetSpent = overallBudget?.spent ?? totalThisMonth
  const budgetRemaining = budgetLimit > 0 ? Math.max(0, budgetLimit - budgetSpent) : 0
  const budgetPercent = budgetLimit > 0 ? Math.min(100, (budgetSpent / budgetLimit) * 100) : 0

  const progressColor =
    budgetPercent >= 100
      ? "#ef4444"
      : budgetPercent >= 80
      ? "#f97316"
      : "#a78bfa"

  const formatAmount = (amount: number) => {
    if (amount >= 1_00_000) return `${(amount / 1_00_000).toFixed(1)}L`
    if (amount >= 1000) return amount.toLocaleString("en-IN")
    return amount.toLocaleString()
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(99, 60, 180, 0.35), 0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: "absolute",
          top: "-3rem",
          right: "-3rem",
          width: "10rem",
          height: "10rem",
          background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-2rem",
          left: "-2rem",
          width: "8rem",
          height: "8rem",
          background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <p style={{ color: "rgba(221,214,254,0.75)", fontSize: "0.775rem", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Your Expenses
        </p>
        <div
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "999px",
            padding: "0.25rem 0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <Wallet size={12} color="rgba(221,214,254,0.8)" />
          <span style={{ color: "rgba(221,214,254,0.9)", fontSize: "0.72rem", fontWeight: 600 }}>This Month</span>
        </div>
      </div>

      {/* Main amount */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ color: "#ffffff", fontSize: "2.75rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 600, opacity: 0.7, marginRight: "0.15rem" }}>{currencySymbol}</span>
          {formatAmount(totalThisMonth)}
        </h2>
      </div>

      {/* Percent change badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            background: isUp ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)",
            border: `1px solid ${isUp ? "rgba(239,68,68,0.35)" : "rgba(34,197,94,0.35)"}`,
            borderRadius: "999px",
            padding: "0.15rem 0.6rem",
          }}
        >
          {isUp ? (
            <TrendingUp size={11} color={isUp ? "#fca5a5" : "#86efac"} />
          ) : (
            <TrendingDown size={11} color="#86efac" />
          )}
          <span style={{ color: isUp ? "#fca5a5" : "#86efac", fontSize: "0.72rem", fontWeight: 700 }}>
            {isUp ? "+" : ""}{Math.abs(percentChange).toFixed(1)}%
          </span>
        </div>
        <span style={{ color: "rgba(196,181,253,0.6)", fontSize: "0.72rem" }}>vs last month</span>
      </div>

      {/* Budget progress bar (only if budget is set) */}
      {budgetLimit > 0 && (
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              height: "6px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${budgetPercent}%`,
                background: `linear-gradient(90deg, #a78bfa, ${progressColor})`,
                borderRadius: "999px",
                transition: "width 0.6s ease",
                boxShadow: `0 0 8px ${progressColor}88`,
              }}
            />
          </div>
        </div>
      )}

      {/* Bottom pills: Last Month vs Budget */}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        {/* Last Month pill */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1rem",
            padding: "0.6rem 0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <ArrowDownRight size={13} color="#fca5a5" />
            <span style={{ color: "rgba(196,181,253,0.7)", fontSize: "0.65rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Last Month
            </span>
          </div>
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.92rem" }}>
            {currencySymbol}{formatAmount(totalLastMonth)}
          </span>
        </div>

        {/* Budget pill */}
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1rem",
            padding: "0.6rem 0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <ArrowUpRight size={13} color="#86efac" />
            <span style={{ color: "rgba(196,181,253,0.7)", fontSize: "0.65rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {budgetLimit > 0 ? "Remaining" : "Budget"}
            </span>
          </div>
          <span style={{ color: budgetLimit > 0 && budgetRemaining === 0 ? "#fca5a5" : "#ffffff", fontWeight: 700, fontSize: "0.92rem" }}>
            {budgetLimit > 0
              ? `${currencySymbol}${formatAmount(budgetRemaining)}`
              : "Not set"}
          </span>
        </div>
      </div>
    </div>
  )
}
