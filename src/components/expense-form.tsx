import * as React from "react"
import { useCategories } from "@/hooks/use-categories"
import { useSettings } from "@/hooks/use-settings"
import { useTags } from "@/hooks/use-tags"
import { compressImage, blobToBase64 } from "@/lib/image-compress"
import type { Expense, Income, PaymentMethod } from "@/lib/types"
import { getIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription } from "@/components/ui/sheet"
import { ChevronDown, ChevronUp, Camera, X } from "lucide-react"

export type FormType = "expense" | "income"

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Expense
  initialType?: FormType
  onSave: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onSaveIncome: (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => Promise<void>
}

export function ExpenseForm({
  open,
  onOpenChange,
  initialData,
  initialType = "expense",
  onSave,
  onSaveIncome,
}: ExpenseFormProps) {
  const { categories } = useCategories()
  const { tags } = useTags()
  const { settings } = useSettings()

  const defaultCurrency = settings?.defaultCurrency || "BDT"
  const defaultPaymentMethod = settings?.defaultPaymentMethod || "cash"
  const currencySymbol = defaultCurrency === "BDT" ? "৳" : "$"

  const [formType, setFormType] = React.useState<FormType>(initialType)

  // shared
  const [amount, setAmount] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const getLocalDateString = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }
  const [date, setDate] = React.useState(getLocalDateString())

  // expense-only
  const [categoryId, setCategoryId] = React.useState<number | "">("")
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("cash")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [photoBlob, setPhotoBlob] = React.useState<Blob | undefined>(undefined)
  const [photoPreview, setPhotoPreview] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // income-only
  const [source, setSource] = React.useState("")

  // reset on open
  React.useEffect(() => {
    if (!open) return
    setFormType(initialType)
    if (initialData) {
      setAmount(initialData.amount.toString())
      setDescription(initialData.description)
      setCategoryId(initialData.categoryId)
      const d = new Date(initialData.date)
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
      setDate(d.toISOString().slice(0, 16))
      setPaymentMethod(initialData.paymentMethod)
      setSelectedTags(initialData.tags || [])
      setNotes(initialData.notes || "")
      setPhotoBlob(initialData.photo)
      if (initialData.photo) blobToBase64(initialData.photo).then(setPhotoPreview)
      else setPhotoPreview("")
      setShowAdvanced(true)
    } else {
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
      setSource("")
    }
    setIsSubmitting(false)
  }, [open, initialData, defaultPaymentMethod, initialType])

  // smart category guess
  React.useEffect(() => {
    if (formType !== "expense" || initialData || !description || !categories) return
    const words = description.toLowerCase().split(/\s+/)
    let match: number | null = null
    for (const cat of categories) {
      if (cat.keywords?.some(k => words.includes(k))) match = cat.id!
    }
    if (match) setCategoryId(match)
  }, [description, categories, initialData, formType])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const blob = await compressImage(file)
      setPhotoBlob(blob)
      setPhotoPreview(await blobToBase64(blob))
    } catch (err) {
      console.error("Photo compression failed:", err)
    }
  }

  const toggleTag = (name: string) =>
    setSelectedTags(prev => (prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return
    setIsSubmitting(true)
    try {
      if (formType === "income") {
        if (!source) return
        await onSaveIncome({ amount: parseFloat(amount), currency: defaultCurrency, source, description, date: new Date(date), notes })
      } else {
        if (categoryId === "") return
        await onSave({ amount: parseFloat(amount), currency: defaultCurrency, categoryId: Number(categoryId), description, date: new Date(date), paymentMethod, tags: selectedTags, notes, ...(photoBlob ? { photo: photoBlob } : {}) })
      }
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to save:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid =
    formType === "expense"
      ? !!amount && !!description && categoryId !== ""
      : !!amount && !!source

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0 overflow-hidden"
      >
        <SheetDescription className="sr-only">Add a new expense or income record.</SheetDescription>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b shrink-0">
          <h2 className="text-lg font-bold tracking-tight">
            {initialData ? "Edit Expense" : "New Transaction"}
          </h2>

          {/* Tab pill — only show when creating new */}
          {!initialData && (
            <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setFormType("expense")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${formType === "expense"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                ⬇ Expense
              </button>
              <button
                type="button"
                onClick={() => setFormType("income")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${formType === "income" ? "text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                style={formType === "income" ? { background: "linear-gradient(135deg,#166534,#15803d)" } : {}}
              >
                ⬆ Income
              </button>
            </div>
          )}
        </div>

        {/* ── Scrollable form body ── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex flex-col gap-5 px-5 py-5 flex-1">

            {/* Amount */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="transaction-amount"
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                required
                className="text-4xl font-bold h-16 pl-10 border-0 border-b-2 border-transparent bg-muted/30 focus-visible:ring-0 focus-visible:border-primary rounded-none"
                placeholder="0.00"
              />
            </div>

            {/* ── INCOME FIELDS ── */}
            {formType === "income" && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Income Source *
                  </Label>
                  <Input
                    id="income-source"
                    placeholder="e.g. Salary, Freelance, Client payment…"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    required
                    className="text-base py-5"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description <span className="font-normal normal-case">(optional)</span>
                  </Label>
                  <Input
                    id="income-description"
                    placeholder="Any extra label…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="text-base py-5"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Date &amp; Time</Label>
                  <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                </div>

                <div className="space-y-1.5">
                  <Label>Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input placeholder="Additional details…" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>
            )}

            {/* ── EXPENSE FIELDS ── */}
            {formType === "expense" && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-left-4 duration-200">
                {/* Description */}
                <div>
                  <Input
                    id="expense-description"
                    type="text"
                    placeholder="What was this for?"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="text-lg py-6 border-x-0 border-t-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-primary rounded-none px-1"
                  />
                </div>

                {/* Category chips */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                  <div className="flex overflow-x-auto pb-2 gap-2 snap-x py-1 scrollbar-hide">
                    {categories?.map(c => {
                      const Icon = getIcon(c.icon)
                      const selected = categoryId === c.id
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategoryId(c.id!)}
                          className={`flex flex-col items-center justify-center min-w-[68px] h-[76px] rounded-xl transition-all snap-start shrink-0 ${selected ? "ring-2 ring-offset-2 ring-offset-background shadow-md scale-105" : "hover:bg-muted/50 border bg-card"
                            }`}
                          style={selected ? { backgroundColor: c.color, color: "#fff" } : {}}
                        >
                          <Icon className="w-5 h-5 mb-1" style={!selected ? { color: c.color } : {}} />
                          <span className="text-[10px] text-center px-1 leading-tight line-clamp-2 w-full break-words">
                            {c.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Advanced toggle */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground justify-center py-5 border-y"
                  onClick={() => setShowAdvanced(v => !v)}
                >
                  {showAdvanced
                    ? <><ChevronUp className="w-4 h-4 mr-2" />Hide Options</>
                    : <><ChevronDown className="w-4 h-4 mr-2" />More Options</>}
                </Button>

                {showAdvanced && (
                  <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Date &amp; Time</Label>
                        <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Payment Method</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

                    {tags && tags.length > 0 && (
                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                          {tags.map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggleTag(t.name)}
                              className={`text-xs px-3 py-1 rounded-full border transition-colors ${selectedTags.includes(t.name) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                                }`}
                            >
                              #{t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label>Notes (Optional)</Label>
                      <Input placeholder="Additional details…" value={notes} onChange={e => setNotes(e.target.value)} />
                    </div>

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
                            onClick={() => { setPhotoPreview(""); setPhotoBlob(undefined); if (fileInputRef.current) fileInputRef.current.value = "" }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Button type="button" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="w-4 h-4" />Add Photo
                          </Button>
                          <span className="text-xs text-muted-foreground">Compresses automatically</span>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handlePhotoUpload} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sticky footer ── */}
          <div className="px-5 py-4 border-t bg-background shrink-0">
            <Button
              id="transaction-save-btn"
              type="submit"
              size="lg"
              className="w-full text-lg rounded-xl h-14 transition-all"
              style={formType === "income" ? { background: "linear-gradient(135deg,#166534,#15803d)", color: "#fff" } : {}}
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? "Saving…" : initialData ? "Save Changes" : formType === "income" ? "Save Income" : "Save Expense"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
