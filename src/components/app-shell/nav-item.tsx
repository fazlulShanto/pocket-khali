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
      className="flex flex-col items-center justify-center gap-1 flex-1 group relative"
    >
      <span
        className={`flex items-center justify-center w-10 h-8 rounded-2xl transition-all duration-300 ${isActive
          ? "bg-primary/15 text-primary scale-110"
          : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted/60"
          }`}
      >
        <Icon
          className={`w-5 h-5 transition-all duration-300 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`}
        />
      </span>
      <span
        className={`text-[10px] hidden font-semibold leading-none tracking-wide transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          }`}
      >
        {label}
      </span>
      {/* Active dot */}

    </Link>
  )
}
