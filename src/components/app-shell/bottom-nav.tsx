import * as React from "react"
import { Home, List, PieChart, Settings, Plus } from "lucide-react"
import { NavItem } from "./nav-item"

const LeftNavItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: List, label: "List", to: "/transactions" },
]

const RightNavItems = [

  { icon: PieChart, label: "Reports", to: "/analytics" },
]

interface BottomNavProps {
  onFabClick: () => void
  currentPath: string
  isSettingsActive: boolean
}

export function BottomNav({ onFabClick, currentPath, isSettingsActive }: BottomNavProps) {
  const [fabPressed, setFabPressed] = React.useState(false)

  const handleFabClick = () => {
    setFabPressed(true)
    setTimeout(() => setFabPressed(false), 200)
    onFabClick()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center pb-safe-area">
      {/* FAB — sits above the nav bar */}
      <div className="relative z-10 -mb-5">
        <button
          onClick={handleFabClick}
          aria-label="Add Expense"
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${fabPressed ? "scale-90" : "scale-100 hover:scale-105"
            }`}
          style={{
            background: "linear-gradient(135deg, oklch(0.60 0.28 300), oklch(0.45 0.28 270))",
            boxShadow: "0 4px 24px oklch(0.50 0.28 292 / 0.55), 0 0 0 4px oklch(0.50 0.28 292 / 0.15)",
          }}
        >
          <Plus
            className={`w-6 h-6 text-white transition-transform duration-200 ${fabPressed ? "rotate-45" : "rotate-0"}`}
            strokeWidth={2.5}
          />
        </button>
      </div>

      {/* Nav bar pill */}
      <nav
        className="w-[calc(100%-24px)] max-w-md rounded-2xl border border-border/60 overflow-hidden"
        style={{
          background: "oklch(var(--background-l, 0.141) var(--background-c, 0.005) 285.823 / 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 -2px 20px oklch(0 0 0 / 0.15), inset 0 1px 0 oklch(1 0 0 / 0.08)",
        }}
      >
        <div className="flex items-center h-16 px-1">
          {/* Left Items */}
          {LeftNavItems.map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={currentPath === item.to}
            />
          ))}



          {/* Right Items */}
          {RightNavItems.map((item) => (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              isActive={currentPath === item.to}
            />
          ))}

          {/* Settings */}
          <NavItem
            icon={Settings}
            label="Settings"
            to="/settings"
            isActive={isSettingsActive}
          />
        </div>
      </nav>

    </div>
  )
}
