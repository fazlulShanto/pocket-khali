import * as React from "react"
import { Link } from "@tanstack/react-router"

interface NavItemProps {
  icon: React.ElementType
  label: string
  to: string
  isActive: boolean
}

export function NavItem({
  icon: Icon,
  label,
  to,
  isActive,
}: NavItemProps) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-2 group relative"
    >
      <span
        className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${isActive
          ? "bg-primary/15 text-primary scale-110"
          : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted/60"
          }`}
      >
        <Icon
          className={`w-5 h-5 transition-all duration-300 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`}
        />
      </span>
      <span
        className={`text-[10px] font-semibold leading-none tracking-wide transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          }`}
      >
        {label}
      </span>
      {/* Active dot */}
      {isActive && (
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary shadow-[0_0_6px_2px] shadow-primary/60" />
      )}
    </Link>
  )
}
