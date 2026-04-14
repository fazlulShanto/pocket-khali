
import { Plus } from "lucide-react"

interface FabProps {
  onClick: () => void
}

export function Fab({ onClick }: FabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-0 right-0 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-40"
      aria-label="Add Expense"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
