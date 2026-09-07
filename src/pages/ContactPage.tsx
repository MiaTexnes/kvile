import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"
import { Alert } from "../components/Alert"
import { useDocumentTitle } from "../lib/useDocumentTitle"

const DEFAULT_TO = "hello@kvile.no"

const schema = z.object({
  name: z.string().max(120, "Name is too long"),
  email: z
    .string()
    .max(254, "Email is too long")
    .refine(
      (val) =>
        val.trim() === "" || z.string().email().safeParse(val.trim()).success,
      {
        message: "Enter a valid email or leave blank",
      },
    ),
  message: z
    .string()
    .min(10, "Please write at least 10 characters.")
    .max(8000, "Message is too long"),
})

type Form = z.infer<typeof schema>

const inputClass =
  "mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none ring-mobile-primary/30 focus:ring-2 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/30"

export function ContactPage() {
  useDocumentTitle("Contact")
  const [pendingMailto, setPendingMailto] = useState<string | null>(null)
  const [showMailtoFallback, setShowMailtoFallback] = useState(false)

  useEffect(() => {
    if (!pendingMailto) return
    window.location.assign(pendingMailto)
  }, [pendingMailto])

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const { errors } = form.formState

  function onSubmit(values: Form) {
    const name = values.name.trim()
    const email = values.email.trim()
    const message = values.message.trim()
    const subject = encodeURIComponent(
      `Kvile inquiry from ${name || "visitor"}`,
    )
    const body = encodeURIComponent(
      `${message}\n\n--\nName: ${name || "(not provided)"}\nReply-to: ${email || "(not provided)"}`,
    )
    const href = `mailto:${DEFAULT_TO}?subject=${subject}&body=${body}`
    setShowMailtoFallback(true)
    setPendingMailto(href)
  }

  return (
    <div className="font-manrope mx-auto max-w-xl space-y-8 px-4 pb-16 md:px-0">
      <div>
        <h1 className="text-3xl font-bold text-mobile-ink md:text-4xl">
          Contact Us
        </h1>
        <p className="mt-2 text-sm text-stone-600 md:text-base">
          Send a message with your default mail app. We’ll get back to you as
          soon as we can. You can also write to{" "}
          <a
            className="font-semibold text-mobile-primary underline"
            href={`mailto:${DEFAULT_TO}`}
          >
            {DEFAULT_TO}
          </a>
          .
        </p>
      </div>
      {showMailtoFallback ? (
        <Alert tone="success">
          Your email program should open with a drafted message. If nothing
          opened, copy your text from the form below and email us manually at{" "}
          <span className="font-semibold">{DEFAULT_TO}</span>.
        </Alert>
      ) : null}
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="contact-name"
            className="text-sm font-medium text-stone-800"
          >
            Name{" "}
            <span id="contact-name-hint" className="font-normal text-stone-500">
              (optional)
            </span>
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            className={inputClass}
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={
              errors.name ? "contact-name-error" : "contact-name-hint"
            }
            {...form.register("name")}
          />
          {errors.name ? (
            <p
              id="contact-name-error"
              className="mt-1 text-sm text-red-700"
              role="alert"
            >
              {errors.name.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="text-sm font-medium text-stone-800"
          >
            Email (for reply){" "}
            <span
              id="contact-email-hint"
              className="font-normal text-stone-500"
            >
              (optional)
            </span>
          </label>
          <input
            id="contact-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={inputClass}
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={
              errors.email ? "contact-email-error" : "contact-email-hint"
            }
            {...form.register("email")}
          />
          {errors.email ? (
            <p
              id="contact-email-error"
              className="mt-1 text-sm text-red-700"
              role="alert"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="contact-message"
            className="text-sm font-medium text-stone-800"
          >
            Message <span className="text-red-600">*</span>
          </label>
          <textarea
            id="contact-message"
            rows={5}
            placeholder="How can we help?"
            className={`${inputClass} resize-y`}
            aria-required
            aria-invalid={Boolean(errors.message) || undefined}
            aria-describedby={
              errors.message ? "contact-message-error" : "contact-message-hint"
            }
            {...form.register("message")}
          />
          {!errors.message ? (
            <p
              id="contact-message-hint"
              className="mt-1 text-xs text-stone-500"
            >
              At least 10 characters before we open your mail app.
            </p>
          ) : (
            <p
              id="contact-message-error"
              className="mt-1 text-sm text-red-700"
              role="alert"
            >
              {errors.message.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-mobile-primary py-3 text-sm font-semibold text-white transition hover:bg-holidaze-blue-hover"
        >
          Open in email app
        </button>
      </form>
      <p className="text-center text-sm text-stone-500">
        <Link
          to="/"
          className="text-mobile-primary underline underline-offset-2"
        >
          ← Home
        </Link>
      </p>
    </div>
  )
}
