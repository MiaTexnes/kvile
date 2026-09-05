import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate, type Location } from "react-router-dom"
import { Alert } from "../components/Alert"
import { useAuth } from "../context/AuthContext"
import { loginFormSchema, type LoginFormValues } from "../lib/authSchemas"
import { useDocumentTitle } from "../lib/useDocumentTitle"

export function LoginPage() {
  useDocumentTitle("Login")
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectState = location.state as { from?: Location } | undefined
  const from = redirectState?.from
    ? `${redirectState.from.pathname}${redirectState.from.search}${redirectState.from.hash}`
    : "/"

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  })
  const { errors, isSubmitting } = form.formState

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.email, values.password)
      navigate(from, { replace: true })
    } catch (e) {
      form.setError("root", { message: (e as Error).message })
    }
  }

  return (
    <div className="shadow-elevate mx-auto max-w-md rounded-[2rem] border border-stone-200/90 bg-white p-8 md:p-10">
      <h1 className="font-display text-3xl font-semibold text-brand-950">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-brand-800/80">
        Sign in to your noroff account to book stays and manage your listings.
      </p>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 space-y-4"
        noValidate
      >
        <div>
          <label
            htmlFor="login-email"
            className="text-sm font-medium text-brand-800"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/30"
            {...form.register("email")}
          />
          {errors.email ? (
            <p
              id="login-email-error"
              className="mt-1 text-sm text-red-700"
              role="alert"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-brand-800"
          >
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(errors.password) || undefined}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
            className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/30"
            {...form.register("password")}
          />
          {errors.password ? (
            <p
              id="login-password-error"
              className="mt-1 text-sm text-red-700"
              role="alert"
            >
              {errors.password.message}
            </p>
          ) : null}
        </div>
        {errors.root ? <Alert tone="error">{errors.root.message}</Alert> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          className="w-full rounded-full bg-brand-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/15 transition hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-brand-800/80">
        No account?{" "}
        <Link
          to="/register"
          state={location.state}
          className="font-medium text-brand-700 underline"
        >
          Register
        </Link>
      </p>
    </div>
  )
}
