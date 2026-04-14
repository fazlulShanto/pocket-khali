import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import type { Category } from "@/lib/types"
import { Icons, IconName } from "./icons"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Category
  onSave: (category: Omit<Category, "id"> | Category) => void
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#10b981", 
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", 
  "#d946ef", "#ec4899", "#f43f5e", "#64748b", "#71717a", "#78716c"
]

export function CategoryForm({ open, onOpenChange, initialData, onSave }: CategoryFormProps) {
  const [name, setName] = React.useState("")
  const [icon, setIcon] = React.useState<IconName>("Circle")
  const [color, setColor] = React.useState("#ef4444")
  const [keywords, setKeywords] = React.useState("")

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name)
        setIcon((initialData.icon as IconName) || "Circle")
        setColor(initialData.color)
        setKeywords(initialData.keywords.join(", "))
      } else {
        setName("")
        setIcon("Circle")
        setColor("#ef4444")
        setKeywords("")
      }
    }
  }, [open, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const parsedKeywords = keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean)

    const categoryData = {
      ...(initialData ? { id: initialData.id } : {}),
      name: name.trim(),
      icon,
      color,
      keywords: parsedKeywords,
      isCustom: initialData ? initialData.isCustom : true,
      order: initialData ? initialData.order : 0, // Handled by hook if 0
    }

    onSave(categoryData as Category)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>
              Create a custom category with smart keyword matching.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Subscriptions"
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === c ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1">
                {(Object.keys(Icons) as IconName[]).map((iconName) => {
                  const Icon = Icons[iconName]
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      className={`flex items-center justify-center p-2 rounded-md hover:bg-muted ${
                        icon === iconName ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
                      }`}
                      aria-label={`Select icon ${iconName}`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="keywords">Smart Guess Keywords (comma separated)</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. netflix, prime, spotify"
              />
              <p className="text-xs text-muted-foreground">
                We'll automatically suggest this category when these words appear in an expense description.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
