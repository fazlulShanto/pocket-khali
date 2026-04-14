import { z } from "zod"

const localDateString = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

export const expenseSchema = z.object({
  amount: z.number({ invalid_type_error: "Enter a valid amount" }).positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.number({ invalid_type_error: "Pick a category" }).int().positive("Pick a category"),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const incomeSchema = z.object({
  amount: z.number({ invalid_type_error: "Enter a valid amount" }).positive("Amount must be positive"),
  source: z.string().min(1, "Income source is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
export type IncomeFormValues = z.infer<typeof incomeSchema>

export { localDateString }
