"use client"

import { useActionState, useEffect, useState } from "react"
import { MapPin, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { saveShippingAddress, type ShippingAddressState } from "@/app/account/actions"

type Props = {
  defaults: {
    recipient_name: string | null
    phone: string | null
    postal_code: string | null
    street_address: string | null
    city: string | null
    state: string | null
    country: string | null
  }
}

export function ShippingAddressForm({ defaults }: Props) {
  const [state, formAction, isPending] = useActionState<ShippingAddressState, FormData>(saveShippingAddress, {})
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (state.success) {
      setShowSuccess(true)
      const t = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(t)
    }
  }, [state.success])

  const isComplete = Boolean(
    defaults.recipient_name && defaults.phone && defaults.street_address && defaults.city && defaults.country,
  )

  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Shipping address</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Where we should send your free product when it&apos;s ready. Required before claiming.
            </p>
          </div>
        </div>
        {isComplete ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Incomplete
          </span>
        )}
      </div>

      <form action={formAction} className="mt-6 space-y-6">
        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="recipient_name">Recipient name *</FieldLabel>
              <Input
                id="recipient_name"
                name="recipient_name"
                defaultValue={defaults.recipient_name ?? ""}
                required
                autoComplete="name"
                placeholder="Jane Smith"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone *</FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={defaults.phone ?? ""}
                required
                autoComplete="tel"
                placeholder="+1 555-555-5555"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="street_address">Street address *</FieldLabel>
            <Input
              id="street_address"
              name="street_address"
              defaultValue={defaults.street_address ?? ""}
              required
              autoComplete="street-address"
              placeholder="1234 Market St, Apt 5B"
            />
            <FieldDescription>House / apartment number, street, building.</FieldDescription>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="city">City *</FieldLabel>
              <Input
                id="city"
                name="city"
                defaultValue={defaults.city ?? ""}
                required
                autoComplete="address-level2"
                placeholder="San Francisco"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="state">State / Province</FieldLabel>
              <Input
                id="state"
                name="state"
                defaultValue={defaults.state ?? ""}
                autoComplete="address-level1"
                placeholder="CA"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="postal_code">Postal / ZIP code</FieldLabel>
              <Input
                id="postal_code"
                name="postal_code"
                defaultValue={defaults.postal_code ?? ""}
                autoComplete="postal-code"
                placeholder="94103"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="country">Country *</FieldLabel>
              <Input
                id="country"
                name="country"
                defaultValue={defaults.country ?? ""}
                required
                autoComplete="country-name"
                placeholder="United States"
              />
            </Field>
          </div>
        </FieldGroup>

        {state.error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        {showSuccess ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Shipping address saved.
          </p>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save address"}
        </Button>
      </form>
    </div>
  )
}
