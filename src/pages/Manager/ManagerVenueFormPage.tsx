import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm, type Resolver } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"
import { Alert } from "../../components/Alert"
import { useAuth } from "../../context/AuthContext"
import * as api from "../../lib/api"
import {
  buildVenueUpsertBody,
  type ManagerVenueFormValues,
} from "../../lib/managerVenueBody"
import { useDocumentTitle } from "../../lib/useDocumentTitle"

const urlOptional = z
  .string()
  .trim()
  .refine((s) => s === "" || z.string().url().safeParse(s).success, {
    message: "Enter a valid image URL",
  })

const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  price: z
    .number({ error: "Price is required" })
    .positive("Price must be greater than 0")
    .max(100_000, "Price is too high"),
  maxGuests: z
    .number({ error: "Max guests is required" })
    .int("Must be a whole number")
    .min(1, "At least 1 guest")
    .max(100, "Too many guests"),
  // empty number inputs become NaN with valueAsNumber — treat as omitted
  rating: z
    .union([z.number(), z.nan(), z.undefined()])
    .transform((v) =>
      typeof v === "number" && Number.isFinite(v) ? v : undefined,
    )
    .refine(
      (v) => v === undefined || (v >= 0 && v <= 5),
      "Rating must be between 0 and 5",
    ),
  imageUrl: urlOptional,
  wifi: z.boolean(),
  parking: z.boolean(),
  breakfast: z.boolean(),
  pets: z.boolean(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
})

type FormValues = z.output<typeof schema>

const inputClass =
  "mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/30"

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1 text-sm text-red-700" role="alert">
      {message}
    </p>
  )
}

const defaults: FormValues = {
  name: "",
  description: "",
  price: 100,
  maxGuests: 2,
  rating: undefined,
  imageUrl: "",
  wifi: false,
  parking: false,
  breakfast: false,
  pets: false,
  address: "",
  city: "",
  country: "",
}

// create only for now — edit uses the same page later
export function ManagerVenueFormPage({ mode }: { mode: "create" }) {
  void mode
  useDocumentTitle("New venue")
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: defaults,
  })
  const { errors, isSubmitting } = form.formState

  const createMutation = useMutation({
    mutationFn: (values: ManagerVenueFormValues) =>
      api.createVenue(user!.accessToken, buildVenueUpsertBody(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["manager-venues", user?.name],
      })
      navigate("/manager/venues", { replace: true })
    },
    onError: (e: Error) => form.setError("root", { message: e.message }),
  })

  function onSubmit(values: FormValues) {
    createMutation.mutate(values)
  }

  if (!user?.venueManager) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-brand-950">
          New venue
        </h1>
        <Link
          to="/manager/venues"
          className="text-sm font-medium text-brand-700 underline"
        >
          Back to dashboard
        </Link>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <div>
          <label
            htmlFor="venue-name"
            className="text-sm font-medium text-brand-800"
          >
            Name
          </label>
          <input
            id="venue-name"
            required
            autoComplete="off"
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={errors.name ? "venue-name-error" : undefined}
            className={inputClass}
            {...form.register("name")}
          />
          <FieldError id="venue-name-error" message={errors.name?.message} />
        </div>

        <div>
          <label
            htmlFor="venue-description"
            className="text-sm font-medium text-brand-800"
          >
            Description
          </label>
          <textarea
            id="venue-description"
            required
            rows={5}
            aria-invalid={Boolean(errors.description) || undefined}
            aria-describedby={
              errors.description ? "venue-description-error" : undefined
            }
            className={inputClass}
            {...form.register("description")}
          />
          <FieldError
            id="venue-description-error"
            message={errors.description?.message}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="venue-price"
              className="text-sm font-medium text-brand-800"
            >
              Price per night
            </label>
            <input
              id="venue-price"
              type="number"
              inputMode="decimal"
              min={1}
              step={1}
              required
              aria-invalid={Boolean(errors.price) || undefined}
              aria-describedby={errors.price ? "venue-price-error" : undefined}
              className={inputClass}
              {...form.register("price", { valueAsNumber: true })}
            />
            <FieldError
              id="venue-price-error"
              message={errors.price?.message}
            />
          </div>
          <div>
            <label
              htmlFor="venue-max-guests"
              className="text-sm font-medium text-brand-800"
            >
              Max guests
            </label>
            <input
              id="venue-max-guests"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              required
              aria-invalid={Boolean(errors.maxGuests) || undefined}
              aria-describedby={
                errors.maxGuests ? "venue-max-guests-error" : undefined
              }
              className={inputClass}
              {...form.register("maxGuests", { valueAsNumber: true })}
            />
            <FieldError
              id="venue-max-guests-error"
              message={errors.maxGuests?.message}
            />
          </div>
          <div>
            <label
              htmlFor="venue-rating"
              className="text-sm font-medium text-brand-800"
            >
              Rating (optional)
            </label>
            <input
              id="venue-rating"
              type="number"
              inputMode="decimal"
              min={0}
              max={5}
              step={0.1}
              aria-invalid={Boolean(errors.rating) || undefined}
              aria-describedby={
                errors.rating ? "venue-rating-error" : "venue-rating-hint"
              }
              className={inputClass}
              {...form.register("rating", { valueAsNumber: true })}
            />
            <p
              id="venue-rating-hint"
              className="mt-1 text-xs text-brand-700/70"
            >
              Optional, 0 to 5.
            </p>
            <FieldError
              id="venue-rating-error"
              message={errors.rating?.message}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="venue-image-url"
            className="text-sm font-medium text-brand-800"
          >
            Image URL (optional)
          </label>
          <input
            id="venue-image-url"
            type="url"
            inputMode="url"
            autoComplete="off"
            aria-invalid={Boolean(errors.imageUrl) || undefined}
            aria-describedby={
              errors.imageUrl ? "venue-image-url-error" : undefined
            }
            className={inputClass}
            {...form.register("imageUrl")}
          />
          <FieldError
            id="venue-image-url-error"
            message={errors.imageUrl?.message}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-brand-800">
            Amenities
          </legend>
          {(
            [
              ["wifi", "Wifi"],
              ["parking", "Parking"],
              ["breakfast", "Breakfast"],
              ["pets", "Pets allowed"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              htmlFor={`venue-${key}`}
              className="flex cursor-pointer items-center gap-3 text-sm text-brand-800"
            >
              <input
                id={`venue-${key}`}
                type="checkbox"
                className="size-4 rounded border-brand-300"
                {...form.register(key)}
              />
              {label}
            </label>
          ))}
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-2 text-sm font-medium text-brand-800 sm:col-span-3">
            Location (optional)
          </legend>
          <div>
            <label
              htmlFor="venue-address"
              className="text-sm font-medium text-brand-800"
            >
              Address
            </label>
            <input
              id="venue-address"
              autoComplete="street-address"
              aria-invalid={Boolean(errors.address) || undefined}
              aria-describedby={
                errors.address ? "venue-address-error" : undefined
              }
              className={inputClass}
              {...form.register("address")}
            />
            <FieldError
              id="venue-address-error"
              message={errors.address?.message}
            />
          </div>
          <div>
            <label
              htmlFor="venue-city"
              className="text-sm font-medium text-brand-800"
            >
              City
            </label>
            <input
              id="venue-city"
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.city) || undefined}
              aria-describedby={errors.city ? "venue-city-error" : undefined}
              className={inputClass}
              {...form.register("city")}
            />
            <FieldError id="venue-city-error" message={errors.city?.message} />
          </div>
          <div>
            <label
              htmlFor="venue-country"
              className="text-sm font-medium text-brand-800"
            >
              Country
            </label>
            <input
              id="venue-country"
              autoComplete="country-name"
              aria-invalid={Boolean(errors.country) || undefined}
              aria-describedby={
                errors.country ? "venue-country-error" : undefined
              }
              className={inputClass}
              {...form.register("country")}
            />
            <FieldError
              id="venue-country-error"
              message={errors.country?.message}
            />
          </div>
        </fieldset>

        {errors.root ? <Alert tone="error">{errors.root.message}</Alert> : null}

        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending}
          aria-disabled={isSubmitting || createMutation.isPending}
          className="w-full rounded-full bg-brand-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/15 transition hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {createMutation.isPending ? "Creating…" : "Create venue"}
        </button>
      </form>
    </div>
  )
}
