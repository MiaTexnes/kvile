import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate, type Location } from "react-router-dom"
import { Alert } from "../components/Alert"
import { useAuth } from "../context/AuthContext"
import { registerFormSchema, type RegisterFormValues } from "../lib/authSchemas"
import { useDocumentTitle } from "../lib/useDocumentTitle"

export function RegisterPage() {
  useDocumentTitle("Register")
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectState = location.state as { from?: Location } | undefined
  const returnTo = redirectState?.from
    ? `${redirectState.from.pathname}${redirectState.from.search}${redirectState.from.hash}`
    : null
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      venueManager: false,
    },
  })
  const { errors, isSubmitting } = form.formState

  async function onSubmit(values: RegisterFormValues) {
    try {
      await registerUser(values)
      if (values.venueManager) {
        navigate("/manager/venues", { replace: true })
      } else {
        navigate(returnTo ?? "/", { replace: true })
      }
    } catch (e) {
      form.setError("root", { message: (e as Error).message })
    }
  }

  return (
    <div className="shadow-elevate mx-auto max-w-md rounded-[2rem] border border-stone-200/90 bg-white p-8 md:p-10">
      <h1 className="font-display text-3xl font-semibold text-brand-950">
        Join Kvile
      </h1>
      <p className="mt-2 text-sm text-brand-800/80">
        Register with your <strong>stud.noroff.no</strong> email to book or host
        stays.
      </p>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
        noValidate
      >
        <div>
          <label
            htmlFor="register-name"
            className="text-sm font-medium text-brand-800"
          >
            Display name
          </label>
          <input
            id="register-name"
            autoComplete="username"
            required
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={
              errors.name ? "register-name-error" : "register-name-hint"
            }
            className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/30"
            {...form.register("name")}
          />
          <p id="register-name-hint" className="mt-1 text-xs text-brand-700/70">
            Letters, numbers or underscores. No spaces.
          </p>
          {errors.name ? (
            <p
              id="register-name-error"
              className="mt-1 text-sm text-red-700"
              role="alert"
            >
              {errors.name.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="register-email"
            className="text-sm font-medium text-brand-800"
          >
            Email
          </label>
          <input
            id="register-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={
              errors.email ? "register-email-error" : "register-email-hint"
            }
            className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/30"
            {...form.register("email")}
          />
          <p
            id="register-email-hint"
            className="mt-1 text-xs text-brand-700/70"
          >
            Must end in{" "}
            <code className="rounded bg-stone-100 px-1 text-xs">
              @stud.noroff.no
            </code>
            .
          </p>
          {errors.email ? (
            <p
              id="register-email-error"
              className="mt-1 text-sm text-red-700"
              role="alert"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="text-sm font-medium text-brand-800"
          >
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={Boolean(errors.password) || undefined}
            aria-describedby={
              errors.password
                ? "register-password-error"
                : "register-password-hint"
            }
            className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/30"
            {...form.register("password")}
          />
          <p
            id="register-password-hint"
            className="mt-1 text-xs text-brand-700/70"
          >
            At least 8 characters.
          </p>
          {errors.password ? (
            <p
              id="register-password-error"
              className="mt-1 text-sm text-red-700"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>
        <label
          htmlFor="register-manager"
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3 text-sm text-brand-800"
        >
          <input
            id="register-manager"
            type="checkbox"
            className="mt-0.5 size-4 rounded border-brand-300"
            {...form.register("venueManager")}
          />
          <span>
            <span className="font-semibold">Register as venue manager</span>
            <span className="mt-1 block text-xs text-brand-700/70">
              Enables the Host dashboard: create, edit and view bookings for
              your venues.
            </span>
          </span>
        </label>
        {errors.root ? <Alert tone="error">{errors.root.message}</Alert> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          className="w-full rounded-full bg-brand-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/15 transition hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-brand-800/80">
        Already registered?{" "}
        <Link
          to="/login"
          state={location.state}
          className="font-medium text-brand-700 underline"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
