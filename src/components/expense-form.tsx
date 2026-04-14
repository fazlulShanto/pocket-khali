import * as React from "react"
import { useCategories } from "@/hooks/use-categories"
import { useSettings } from "@/hooks/use-settings"
import { useTags } from "@/hooks/use-tags"
import { compressImage, blobToBase64 } from "@/lib/image-compress"
import type { Expense, PaymentMethod } from "@/lib/types"
import { Icons, getIcon, type IconName } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { ChevronDown, ChevronUp, Camera, X } from "lucide-react"

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Expense
  onSave: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
}

export function ExpenseForm({ open, onOpenChange, initialData, onSave }: ExpenseFormProps) {
  const { categories } = useCategories()
  const { tags } = useTags()
  const { settings } = useSettings()

  const defaultCurrency = settings?.defaultCurrency || "BDT"
  const defaultPaymentMethod = settings?.defaultPaymentMethod || "cash"

  const [amount, setAmount] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [categoryId, setCategoryId] = React.useState<number | "">("")

  // Advanced options
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  // Initialize date locally
  const getLocalDateString = () => {
    const now = new Date();
    // Format to YYYY-MM-DDThh:mm
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  const [date, setDate] = React.useState<string>(getLocalDateString())
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("cash")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [notes, setNotes] = React.useState("")
  const [photoBlob, setPhotoBlob] = React.useState<Blob | undefined>(undefined)
  const [photoPreview, setPhotoPreview] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Reset or load initial data when opened
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setAmount(initialData.amount.toString())
        setDescription(initialData.description)
        setCategoryId(initialData.categoryId)

        // Format initial date to YYYY-MM-DDThh:mm
        const d = new Date(initialData.date)
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
        setDate(d.toISOString().slice(0, 16))

        setPaymentMethod(initialData.paymentMethod)
        setSelectedTags(initialData.tags || [])
        setNotes(initialData.notes || "")
        setPhotoBlob(initialData.photo)

        if (initialData.photo) {
          blobToBase64(initialData.photo).then(setPhotoPreview)
        } else {
          setPhotoPreview("")
        }
        setShowAdvanced(true)
      } else {
        // Defaults for new expense
        setAmount("")
        setDescription("")
        setCategoryId("")
        setDate(getLocalDateString())
        setPaymentMethod(defaultPaymentMethod as PaymentMethod)
        setSelectedTags([])
        setNotes("")
        setPhotoBlob(undefined)
        setPhotoPreview("")
        setShowAdvanced(false)
      }
      setIsSubmitting(false)
    }
  }, [open, initialData, defaultPaymentMethod])

  // Smart Category Guess
  React.useEffect(() => {
    if (initialData) return // Don't guess if editing
    if (!description || !categories) return

    const descWords = description.toLowerCase().split(/\s+/)
    let matchedCategoryId = null

    // Look through categories and check if any words match keywords
    for (const category of categories) {
      if (category.keywords && category.keywords.length > 0) {
        const hasMatch = descWords.some(word => category.keywords.includes(word))
        if (hasMatch) {
          matchedCategoryId = category.id
          // Don't break immediately, let later matches override (e.g. "bus ride to gym" -> matches Transport then Health -> sets to Health. You can adjust this logic as desired.)
        }
      }
    }

    if (matchedCategoryId) {
      setCategoryId(matchedCategoryId)
    }
  }, [description, categories, initialData])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Compress and store as blob
      const compressedBlob = await compressImage(file)
      setPhotoBlob(compressedBlob)
      // Preview
      const base64 = await blobToBase64(compressedBlob)
      setPhotoPreview(base64)
    } catch (error) {
      console.error("Photo compression failed:", error)
    }
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || categoryId === "") return

    setIsSubmitting(true)

    try {
      await onSave({
        amount: parseFloat(amount),
        currency: defaultCurrency,
        categoryId: Number(categoryId),
        description,
        date: new Date(date),
        paymentMethod,
        tags: selectedTags,
        notes,
        ...(photoBlob ? { photo: photoBlob } : {})
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save expense:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-auto sm:max-w-md w-full mx-auto rounded-t-2xl px-4 overflow-y-auto">
        <SheetHeader className="text-left mb-4 mt-2">
          <SheetTitle>{initialData ? "Edit Expense" : "New Expense"}</SheetTitle>
          <SheetDescription className="sr-only">Add a new expense record.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-8">
          {/* Main required fields */}
          <div className="flex flex-col gap-5">
            {/* Amount */}
            <div className="space-y-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">
                {defaultCurrency === "BDT" ? "৳" : "$"}
              </span>
              <Input
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="text-4xl font-bold h-16 pl-10 border-0 border-b-2 border-transparent bg-muted/30 focus-visible:ring-0 focus-visible:border-primary rounded-none"
                placeholder="0.00"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Input
                type="text"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="text-lg py-6 border-x-0 border-t-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-primary rounded-none px-1"
              />
            </div>

            {/* Category Chips */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Category</Label>
              <div className="flex overflow-x-auto pb-2 gap-2 snap-x scrollbar-hide py-1">
                {categories?.map((c) => {
                  const Icon = getIcon(c.icon)
                  const isSelected = categoryId === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id!)}
                      className={`flex flex-col items-center justify-center min-w-[72px] h-20 rounded-xl transition-all snap-start ${isSelected ? "ring-2 ring-offset-2 ring-offset-background shadow-md scale-105" : "hover:bg-muted/50 border bg-card"
                        }`}
                      style={isSelected ? { backgroundColor: c.color, color: "#fff", ringColor: c.color } : {}}
                    >
                      <Icon className="w-6 h-6 mb-1" style={!isSelected ? { color: c.color } : {}} />
                      <span className="text-[10px] text-center px-1 leading-tight line-clamp-2 w-full break-words">
                        {c.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground justify-center py-6 border-y"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? (
              <><ChevronUp className="w-4 h-4 mr-2" /> Hide Options</>
            ) : (
              <><ChevronDown className="w-4 h-4 mr-2" /> More Options</>
            )}
          </Button>

          {showAdvanced && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-top-4 duration-300">

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1.5">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-1.5">
                  <Label>Payment Method</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_card">Bank Card</option>
                    <option value="bkash">bKash</option>
                    <option value="nagad">Nagad</option>
                    <option value="rocket">Rocket</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.name)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${selectedTags.includes(t.name)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 hover:bg-muted"
                          }`}
                      >
                        #{t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Additional details..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              {/* Photo */}
              <div className="space-y-1.5">
                <Label>Receipt / Photo</Label>
                {photoPreview ? (
                  <div className="relative w-max">
                    <img src={photoPreview} alt="Receipt preview" className="h-32 rounded-md object-cover border" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => {
                        setPhotoPreview("")
                        setPhotoBlob(undefined)
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="w-4 h-4" />
                      Add Photo
                    </Button>
                    <span className="text-xs text-muted-foreground">Compresses automatically</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                />
              </div>

            </div>
          )}

          <SheetFooter className="mt-4 pb-safe">
            <Button type="submit" size="lg" className="w-full text-lg rounded-xl h-14" disabled={isSubmitting || !amount || !description || categoryId === ""}>
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Save Expense"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
