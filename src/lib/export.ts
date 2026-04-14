import type { Expense, Category } from "./types"

export const exportToCSV = (expenses: Expense[], categories: Category[] | undefined) => {
  if (!expenses.length) return

  // Headers
  const headers = ["Date", "Category", "Description", "Amount", "Currency", "Tags", "Payment Method", "Notes"]
  
  // Rows
  const rows = expenses.map(exp => {
    const category = categories?.find(c => c.id === exp.categoryId)?.name || "Unknown"
    const date = new Date(exp.date).toISOString().split('T')[0] // local formatting could be applied
    const tags = exp.tags ? exp.tags.join(";") : ""
    
    return [
      date,
      `"${category}"`, // Quote in case of commas
      `"${exp.description.replace(/"/g, '""')}"`, // Escape quotes
      exp.amount,
      exp.currency,
      `"${tags}"`,
      exp.paymentMethod,
      `"${(exp.notes || "").replace(/"/g, '""')}"`
    ].join(",")
  })

  const csvContent = [headers.join(","), ...rows].join("\n")
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  downloadBlob(blob, `pocket-khali-export-${new Date().toISOString().split('T')[0]}.csv`)
}

export const exportToJSON = (expenses: Expense[]) => {
  if (!expenses.length) return
  
  // Strip photo data to keep the export lightweight or keep it?
  // Let's keep it lightweight for general JSON export. 
  // Database backup JSON handled separately will include photos.
  const lightweightExpenses = expenses.map(e => {
    const { photo, ...rest } = e
    return rest
  })

  const jsonContent = JSON.stringify(lightweightExpenses, null, 2)
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
  downloadBlob(blob, `pocket-khali-export-${new Date().toISOString().split('T')[0]}.json`)
}

const downloadBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement("a")
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
