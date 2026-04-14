import { useForm } from "@tanstack/react-form"
import { useSettings } from "@/hooks/use-settings"
import type { Income } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { incomeSchema, localDateString } from "./schemas"

interface IncomeFormProps {
  onSave: (data: Omit<Income, "id" | "createdAt" | "updatedAt">) => Promise<void>
  onClose: () => void
}

function FieldError({ errors }: { errors: string[] }) {
  if (!errors.length) return null
  return <p className="text-xs text-destructive mt-1">{errors[0]}</p>
}

export function IncomeFormFields({ onSave, onClose }: IncomeFormProps) {
  const { settings } = useSettings()
  const defaultCurrency = settings?.defaultCurrency || "BDT"
  const currencySymbol = defaultCurrency === "BDT" ? "৳" : "$"

  const form = useForm({
    defaultValues: {
      amount: 0 as unknown as number,
      source: "",
      description: "",
      date: localDateString(),
      notes: "",
    },
    validators: { onSubmit: incomeSchema },
    onSubmit: async ({ value }) => {
      await onSave({
        amount: value.amount,
        currency: defaultCurrency,
        source: value.source,
        description: value.description ?? "",
        date: new Date(value.date),
        notes: value.notes ?? "",
      })
      onClose()
    },
  })

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
                id="income-amount"
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

        {/* Source */}
        <form.Field name="source">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Income Source *
              </Label>
              <Input
                id="income-source"
                placeholder="e.g. Salary, Freelance, Client payment…"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="text-base py-5"
              />
              <FieldError errors={field.state.meta.errors as string[]} />
            </div>
          )}
        </form.Field>

        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description <span className="font-normal normal-case">(optional)</span>
              </Label>
              <Input
                id="income-description"
                placeholder="Any extra label…"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="text-base py-5"
              />
            </div>
          )}
        </form.Field>

        {/* Date */}
        <form.Field name="date">
          {(field) => (
            <div className="space-y-1.5">
              <Label>Date &amp; Time</Label>
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

        {/* Notes */}
        <form.Field name="notes">
          {(field) => (
            <div className="space-y-1.5">
              <Label>Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                placeholder="Additional details…"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t bg-background shrink-0">
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              id="income-save-btn"
              type="submit"
              size="lg"
              className="w-full text-lg rounded-xl h-14"
              style={{ background: "linear-gradient(135deg,#166534,#15803d)", color: "#fff" }}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save Income"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}
