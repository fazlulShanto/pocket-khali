import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { useCategories } from "@/hooks/use-categories"
import { useSettings } from "@/hooks/use-settings"
import { useTags } from "@/hooks/use-tags"
import { compressImage, blobToBase64 } from "@/lib/image-compress"
import type { Expense, PaymentMethod } from "@/lib/types"
import { getIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Camera, X } from "lucide-react"
import { expenseSchema, localDateString } from "./schemas"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface ExpenseFormProps {
  initialData?: Expense
  onSave: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onClose: () => void
}

function FieldError({ errors }: { errors: string[] }) {
  if (!errors.length) return null
  return <p className="text-xs text-destructive mt-1">{errors[0]}</p>
}

export function ExpenseFormFields({ initialData, onSave, onClose }: ExpenseFormProps) {
  const { categories } = useCategories()
  const { tags } = useTags()
  const { settings } = useSettings()
  const defaultCurrency = settings?.defaultCurrency || "BDT"
  const currencySymbol = defaultCurrency === "BDT" ? "৳" : "$"

  const [showAdvanced, setShowAdvanced] = React.useState(!!initialData)
  const [photoBlob, setPhotoBlob] = React.useState<Blob | undefined>(initialData?.photo)
  const [photoPreview, setPhotoPreview] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (initialData?.photo) blobToBase64(initialData.photo).then(setPhotoPreview)
  }, [initialData?.photo])

  const form = useForm({
    defaultValues: {
      amount: initialData?.amount ?? (0 as unknown as number),
      description: initialData?.description ?? "",
      categoryId: initialData?.categoryId ?? (0 as unknown as number),
      date: (() => {
        if (initialData?.date) {
          const d = new Date(initialData.date)
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
          return d.toISOString().slice(0, 16)
        }
        return localDateString()
      })(),
      paymentMethod: (initialData?.paymentMethod ?? settings?.defaultPaymentMethod ?? "cash") as string,
      notes: initialData?.notes ?? "",
      tags: initialData?.tags ?? ([] as string[]),
    },
    validators: { onSubmit: expenseSchema },
    onSubmit: async ({ value }) => {
      await onSave({
        amount: value.amount,
        currency: defaultCurrency,
        categoryId: value.categoryId,
        description: value.description,
        date: new Date(value.date),
        paymentMethod: value.paymentMethod as PaymentMethod,
        tags: value.tags ?? [],
        notes: value.notes ?? "",
        ...(photoBlob ? { photo: photoBlob } : {}),
      })
      onClose()
    },
  })


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

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}
      className="flex flex-col flex-1 overflow-y-auto"
    >
      <div className="flex flex-col gap-5 px-5 py-5 flex-1">
        {/* Amount */}
        <form.Field name="amount">
          {(field) => (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="expense-amount"
                type="number"
                step="any"
                inputMode="decimal"
                name={field.name}
                value={field.state.value === 0 ? "" : field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                autoFocus
                className="text-xl font-bold h-fit pl-10 border-0 border-b-2 border-transparent bg-muted/30 focus-visible:ring-0 focus-visible:border-primary rounded-none"
                placeholder="0.00"
              />
              <FieldError errors={field.state.meta.errors as string[]} />
            </div>
          )}
        </form.Field>

        {/* Description — onChange listener handles smart category guess */}
        <form.Field
          name="description"
          listeners={{
            onChange: ({ value }) => {
              if (!value || !categories || initialData) return
              const words = value.toLowerCase().split(/\s+/)
              for (const cat of categories) {
                if (cat.keywords?.some((k) => words.includes(k))) {
                  form.setFieldValue("categoryId", cat.id!)
                  break
                }
              }
            },
          }}
        >
          {(field) => (
            <div>
              <Input
                id="expense-description"
                type="text"
                placeholder="What was this for?"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="text-sm py-2 border-x-0 border-t-0 border-b bg-transparent focus-visible:ring-0 focus-visible:border-primary rounded-none px-1"
              />
              <FieldError errors={field.state.meta.errors as string[]} />
            </div>
          )}
        </form.Field>

        {/* Categories */}
        <form.Field name="categoryId">
          {(field) => (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
              <div className="flex overflow-x-auto pb-2 gap-2 snap-x py-1 scrollbar-hide px-2">
                {categories?.map((c) => {
                  const Icon = getIcon(c.icon)
                  const selected = field.state.value === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => field.handleChange(c.id!)}
                      className={`flex flex-col items-center justify-center h-16 w-20 rounded-xl transition-all snap-start shrink-0 ${selected
                        ? "ring-1 ring-offset-1 ring-offset-background shadow-md"
                        : "hover:bg-muted/50 border bg-card"
                        }`}
                      style={selected ? { backgroundColor: c.color, color: "#fff" } : {}}
                    >
                      <Icon className="size-4" style={!selected ? { color: c.color } : {}} />
                      <span className="text-xs text-center px-1 leading-tight line-clamp-2 w-full break-words">
                        {c.name}
                      </span>
                    </button>
                  )
                })}
              </div>
              <FieldError errors={field.state.meta.errors as string[]} />
            </div>
          )}
        </form.Field>

        {/* Advanced toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-muted-foreground justify-center py-3 border-y"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced
            ? <><ChevronUp className="w-4 h-4 mr-2" />Hide Options</>
            : <><ChevronDown className="w-4 h-4 mr-2" />More Options</>}
        </Button>

        {showAdvanced && (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <form.Field name="date">
                {(field) => (
                  <div className="space-y-1.5">
                    {/* <Label>Date &amp; Time</Label> */}
                    <Input
                      type="datetime-local"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={field.state.meta.errors as string[]} />
                  </div>
                )}
              </form.Field>

              {/* Payment Method */}
              <form.Field name="paymentMethod">
                {(field) => (
                  <div className="space-y-1.5">
                    <Select
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Payment method" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectGroup>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank_card">Bank Card</SelectItem>
                          <SelectItem value="bkash">bKash</SelectItem>
                          <SelectItem value="nagad">Nagad</SelectItem>
                          <SelectItem value="rocket">Rocket</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <form.Field name="tags">
                {(field) => (
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => {
                        const active = (field.state.value ?? []).includes(t.name)
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              const prev = field.state.value ?? []
                              field.handleChange(
                                active ? prev.filter((x) => x !== t.name) : [...prev, t.name]
                              )
                            }}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
                              }`}
                          >
                            #{t.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </form.Field>
            )}

            {/* Notes */}
            <form.Field name="notes">
              {(field) => (
                <div className="space-y-1">
                  {/* <Label>Notes (Optional)</Label> */}
                  <Input
                    placeholder="Additional notes"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            {/* Photo */}
            <div className="space-y-1.5">
              {/* <Label>Receipt / Photo</Label> */}
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
                  <Button type="button" variant="outline" className="gap-2 w-full" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4" />Add Photo
                  </Button>

                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handlePhotoUpload} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t bg-background shrink-0">
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              id="expense-save-btn"
              type="submit"
              size="lg"
              className="w-full text-lg rounded-xl h-14"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Saving…" : initialData ? "Save Changes" : "Save Expense"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
