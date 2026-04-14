import { createFileRoute } from '@tanstack/react-router'
import { BudgetsPage } from '@/pages/budgets'

export const Route = createFileRoute('/budgets')({
  component: BudgetsPage,
})
