export type PaymentMethod = "cash" | "bank_card" | "bkash" | "rocket" | "nagad" | "other"

export interface Expense {
  id?: number
  amount: number
  currency: string
  categoryId: number
  description: string
  notes?: string
  tags: string[]
  paymentMethod: PaymentMethod
  date: Date
  photo?: Blob // compressed image blob
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id?: number
  name: string
  icon: string
  color: string
  isCustom: boolean
  keywords: string[]
  order: number
}

export interface Tag {
  id?: number
  name: string
  color?: string
}

export interface Budget {
  id?: number
  categoryId: number | "overall"
  amount: number
  period: "monthly" | "weekly"
  startDate: Date
}

export interface Settings {
  key: string
  value: any
}

export type BudgetStatus = "normal" | "warning" | "critical" | "overspent"
