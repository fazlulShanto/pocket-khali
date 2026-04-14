import * as React from "react"
import { useCategories } from "@/hooks/use-categories"
import { CategoryForm } from "@/components/category-form"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import type { Category } from "@/lib/types"
import { Icons, getIcon, type IconName } from "@/components/icons"

export const CategoriesPage = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<Category | undefined>(undefined)

  const handleOpenNew = () => {
    setEditingCategory(undefined)
    setFormOpen(true)
  }

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category)
    setFormOpen(true)
  }

  const handleSave = async (categoryData: Omit<Category, "id"> | Category) => {
    if ("id" in categoryData && categoryData.id) {
      await updateCategory(categoryData.id, categoryData)
    } else {
      await addCategory(categoryData)
    }
  }

  const handleDelete = async (id: number | undefined) => {
    if (!id) return
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(id)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage your expense categories.</p>
        </div>
        <Button onClick={handleOpenNew} size="sm" className="gap-1 rounded-full">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Category</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories?.map((category) => {
          const Icon = getIcon(category.icon)
          return (
            <div 
              key={category.id} 
              className="flex items-center justify-between p-3 rounded-lg border bg-card transition-colors hover:shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-full shrink-0" 
                  style={{ backgroundColor: category.color + "20", color: category.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">{category.name}</span>
                  {category.keywords && category.keywords.length > 0 ? (
                    <span className="text-xs text-muted-foreground truncate opacity-70">
                      {category.keywords.join(", ")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground opacity-50">No keywords</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => handleOpenEdit(category)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}
        {categories?.length === 0 && (
          <div className="col-span-full py-10 text-center border rounded-lg border-dashed text-muted-foreground">
            No categories found.
          </div>
        )}
      </div>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingCategory}
        onSave={handleSave}
      />
    </div>
  )
}
