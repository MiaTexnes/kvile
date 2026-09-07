import { zodResolver } from "@hookform/resolvers/zod"
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"
import { Alert } from "../components/Alert"
import { CuratedVenueCard } from "../components/CuratedVenueCard"
import { useAuth } from "../context/AuthContext"
import * as api from "../lib/api"
import { hostProfileHref } from "../lib/hostProfilePath"
import type { Venue } from "../lib/types"
import { useDocumentTitle } from "../lib/useDocumentTitle"
import { useFavorites } from "../lib/venueFavorites"

const urlOptional = z
  .string()
  .trim()
  .refine((s) => s === "" || z.string().url().safeParse(s).success, {
    message: "Enter a valid URL",
  })

const schema = z.object({
  bio: z.string().max(500, "Bio must be 500 characters or less"),
  avatarUrl: urlOptional,
  avatarAlt: z
    .string()
    .max(120, "Keep alt text under 120 characters")
    .optional(),
  bannerUrl: urlOptional,
  bannerAlt: z
    .string()
    .max(120, "Keep alt text under 120 characters")
    .optional(),
})

type Form = z.infer<typeof schema>

export function ProfilePage() {
  useDocumentTitle("Profile")
  const { user, logout, setSession } = useAuth()
  const queryClient = useQueryClient()
  const didSeedForm = useRef(false)
  const [becomeHostDismissed, setBecomeHostDismissed] = useState(false)
  const [brokenAvatarUrl, setBrokenAvatarUrl] = useState<string | null>(null)
  const [brokenBannerUrl, setBrokenBannerUrl] = useState<string | null>(null)

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: "",
      avatarUrl: "",
      avatarAlt: "Avatar",
      bannerUrl: "",
      bannerAlt: "Banner",
    },
  })
  const { errors, isSubmitting } = form.formState
  const watchedBio = useWatch({
    control: form.control,
    name: "bio",
    defaultValue: "",
  })
  const watchedAvatarUrl = useWatch({
    control: form.control,
    name: "avatarUrl",
    defaultValue: "",
  })
  const watchedAvatarAlt = useWatch({
    control: form.control,
    name: "avatarAlt",
    defaultValue: "Avatar",
  })
  const watchedBannerUrl = useWatch({
    control: form.control,
    name: "bannerUrl",
    defaultValue: "",
  })
  const watchedBannerAlt = useWatch({
    control: form.control,
    name: "bannerAlt",
    defaultValue: "Banner",
  })

  const avatarUrl = watchedAvatarUrl.trim()
  const bannerUrl = watchedBannerUrl.trim()
  const avatarBroken = brokenAvatarUrl === avatarUrl
  const bannerBroken = brokenBannerUrl === bannerUrl

  const profileQuery = useQuery({
    queryKey: ["profile", "me", user?.name ?? ""],
    queryFn: () => api.fetchProfile(user!.accessToken, user!.name),
    enabled: Boolean(user?.accessToken && user?.name),
  })

  useEffect(() => {
    didSeedForm.current = false
  }, [user?.name])

  useEffect(() => {
    const p = profileQuery.data
    if (!p || didSeedForm.current) return
    didSeedForm.current = true
    form.reset({
      bio: p.bio ?? "",
      avatarUrl: p.avatar?.url ?? "",
      avatarAlt: p.avatar?.alt?.trim() || "Avatar",
      bannerUrl: p.banner?.url ?? "",
      bannerAlt: p.banner?.alt?.trim() || "Banner",
    })
  }, [profileQuery.data, form])

  const profileMutation = useMutation({
    mutationFn: (values: Form) => {
      const body: {
        bio: string
        avatar?: { url: string; alt?: string }
        banner?: { url: string; alt?: string }
      } = { bio: values.bio.trim() }
      const av = values.avatarUrl.trim()
      if (av) {
        body.avatar = { url: av, alt: values.avatarAlt?.trim() || "Avatar" }
      }
      const bn = values.bannerUrl.trim()
      if (bn) {
        body.banner = { url: bn, alt: values.bannerAlt?.trim() || "Banner" }
      }
      return api.updateProfile(user!.accessToken, user!.name, body)
    },
    onSuccess: (profile) => {
      setSession({
        accessToken: user!.accessToken,
        name: profile.name,
        email: user!.email,
        profileEmail: profile.email,
        venueManager: profile.venueManager,
      })
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      void queryClient.invalidateQueries({ queryKey: ["host-venues"] })
      form.reset({
        bio: profile.bio ?? "",
        avatarUrl: profile.avatar?.url ?? "",
        avatarAlt: profile.avatar?.alt?.trim() || "Avatar",
        bannerUrl: profile.banner?.url ?? "",
        bannerAlt: profile.banner?.alt?.trim() || "Banner",
      })
      form.clearErrors("root")
      window.setTimeout(() => profileMutation.reset(), 4500)
    },
    onError: (e: Error) => form.setError("root", { message: e.message }),
  })

  const becomeHostMutation = useMutation({
    mutationFn: () =>
      api.updateProfile(user!.accessToken, user!.name, { venueManager: true }),
    onSuccess: (profile) => {
      setBecomeHostDismissed(false)
      setSession({
        accessToken: user!.accessToken,
        name: profile.name,
        email: user!.email,
        profileEmail: profile.email,
        venueManager: profile.venueManager,
      })
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      void queryClient.invalidateQueries({ queryKey: ["host-venues"] })
    },
  })

  const { favorites, toggleFavorite } = useFavorites()
  const favoriteIds = useMemo(
    () =>
      Object.keys(favorites)
        .filter((id) => favorites[id])
        .sort((a, b) => a.localeCompare(b)),
    [favorites],
  )

  const favoritesVenueQueries = useQueries({
    queries: favoriteIds.map((id) => ({
      queryKey: ["venue", id] as const,
      queryFn: () => api.fetchVenue(id),
      staleTime: 60_000,
    })),
  })

  const favoriteVenues = useMemo(() => {
    const list: Venue[] = []
    for (const q of favoritesVenueQueries) {
      if (q.data) list.push(q.data)
    }
    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [favoritesVenueQueries])

  const favoritesLoading =
    favoriteIds.length > 0 && favoritesVenueQueries.some((q) => q.isPending)
  const favoritesErrorCount = favoritesVenueQueries.filter(
    (q) => q.isError,
  ).length

  if (!user) return null

  const profile = profileQuery.data
  const profileEmailMismatch =
    user.profileEmail &&
    user.email.trim().toLowerCase() !== user.profileEmail.trim().toLowerCase()

  const hostPublicHref = hostProfileHref(user.name)
  const counts = profile?._count
  const bioLen = (watchedBio ?? "").length

  async function onSubmit(values: Form) {
    form.clearErrors("root")
    await profileMutation.mutateAsync(values).catch(() => {
      /* error shown via onError */
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <div className="shadow-elevate mx-auto w-full max-w-2xl space-y-6 rounded-[2rem] border border-stone-200/90 bg-white p-8 md:p-10">
        <div>
          <h1 className="font-display text-3xl font-semibold text-brand-950">
            Your account
          </h1>
          <p className="mt-1 text-sm text-brand-800/80">
            Signed in as <strong>{user.name}</strong>
            {user.email ? ` (${user.email})` : null}
          </p>
          {profileEmailMismatch ? (
            <p className="mt-2 text-xs text-brand-800/85" role="status">
              Your profile lists a different email:{" "}
              <strong>{user.profileEmail}</strong>. Sign-in still used the
              address you entered. Contact us if that looks wrong.
            </p>
          ) : null}
          <p className="mt-3 text-sm text-brand-800/85">
            Display name and sign-in email can&apos;t be changed here. You can
            still edit your public bio and profile images below.
          </p>
        </div>

        {profileQuery.isPending ? (
          <p
            className="rounded-xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-8 text-center text-sm text-brand-800/85"
            role="status"
            aria-live="polite"
          >
            Loading your profile...
          </p>
        ) : profileQuery.isError ? (
          <Alert
            tone="error"
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{(profileQuery.error as Error).message}</span>
            <button
              type="button"
              onClick={() => profileQuery.refetch()}
              className="shrink-0 rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-brand-950 hover:bg-stone-50"
            >
              Retry
            </button>
          </Alert>
        ) : null}

        {!profileQuery.isSuccess ? null : (
          <section
            className="rounded-2xl border border-stone-200/90 bg-stone-50/50 p-5"
            aria-labelledby="profile-overview-heading"
          >
            <h2
              id="profile-overview-heading"
              className="font-display text-base font-semibold text-brand-950"
            >
              Overview
            </h2>
            <dl className="mt-3 grid gap-2 text-sm text-brand-800/90 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-brand-700/80">
                  Venue manager
                </dt>
                <dd className="mt-0.5">{user.venueManager ? "Yes" : "No"}</dd>
              </div>
              {counts?.venues != null ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-brand-700/80">
                    Listed venues
                  </dt>
                  <dd className="mt-0.5">
                    {user.venueManager ? (
                      <Link
                        to="/manager/venues"
                        className="font-semibold text-mobile-primary underline-offset-4 hover:underline"
                      >
                        {counts.venues}
                      </Link>
                    ) : (
                      counts.venues
                    )}
                  </dd>
                </div>
              ) : null}
              {counts?.bookings != null ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-brand-700/80">
                    Bookings record
                  </dt>
                  <dd className="mt-0.5">
                    <Link
                      to="/my-bookings"
                      className="font-semibold text-mobile-primary underline-offset-4 hover:underline"
                    >
                      View trips ({counts.bookings})
                    </Link>
                  </dd>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wider text-brand-700/80">
                  Public list
                </dt>
                <dd className="mt-0.5">
                  <Link
                    to={hostPublicHref}
                    className="font-semibold text-mobile-primary underline-offset-4 hover:underline"
                  >
                    Venues attributed to &quot;{user.name}&quot; on Kvile
                  </Link>
                </dd>
              </div>
            </dl>
          </section>
        )}

        {user.venueManager ? (
          <section
            className="space-y-3 rounded-2xl border border-brand-200/90 bg-brand-50/70 p-5"
            aria-labelledby="host-dashboard-heading"
          >
            <h2
              id="host-dashboard-heading"
              className="font-display text-lg font-semibold text-brand-950"
            >
              Host dashboard
            </h2>
            <p className="text-sm text-brand-800/85">
              Add venues and manage bookings from your manager area.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                to="/manager/venues"
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand-800 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition hover:bg-brand-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 sm:flex-initial sm:min-w-[10rem]"
              >
                Your venues
              </Link>
              <Link
                to="/manager/venues/new"
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-brand-800 px-4 py-2.5 text-center text-sm font-semibold text-brand-950 transition hover:bg-brand-800/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 sm:flex-initial sm:min-w-[10rem]"
              >
                Add a venue
              </Link>
            </div>
          </section>
        ) : becomeHostDismissed ? (
          <p className="text-center text-sm text-brand-700/90">
            <button
              type="button"
              className="font-semibold text-mobile-primary underline underline-offset-4 hover:no-underline"
              onClick={() => setBecomeHostDismissed(false)}
            >
              Show venue hosting option
            </button>
          </p>
        ) : (
          <section
            className="space-y-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 p-5"
            aria-labelledby="become-host-heading"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2
                id="become-host-heading"
                className="font-display text-lg font-semibold text-brand-950"
              >
                List your own venue?
              </h2>
              <button
                type="button"
                className="text-xs font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-950"
                onClick={() => setBecomeHostDismissed(true)}
              >
                Dismiss
              </button>
            </div>
            <p className="text-sm text-brand-800/85">
              We&apos;ll turn on hosting for this account. After that,{" "}
              <strong>Host</strong> and the manager tools appear in the menu.
            </p>
            {becomeHostMutation.isError ? (
              <Alert tone="error">
                {(becomeHostMutation.error as Error).message}
              </Alert>
            ) : null}
            {becomeHostMutation.isSuccess ? (
              <Alert tone="success">
                Hosting is enabled. Open{" "}
                <Link to="/manager/venues" className="font-semibold underline">
                  your venues
                </Link>{" "}
                to get started.
              </Alert>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={() => becomeHostMutation.mutate()}
                disabled={
                  becomeHostMutation.isPending || becomeHostMutation.isSuccess
                }
                aria-disabled={
                  becomeHostMutation.isPending || becomeHostMutation.isSuccess
                }
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-initial"
              >
                {becomeHostMutation.isPending ? (
                  <span role="status" aria-live="polite">
                    Enabling...
                  </span>
                ) : becomeHostMutation.isSuccess ? (
                  "Hosting enabled"
                ) : (
                  "Become a host"
                )}
              </button>
            </div>
            <p className="text-xs text-brand-700/80">
              New account instead? Use{" "}
              <Link
                to="/register"
                className="font-medium underline underline-offset-2 hover:text-brand-950"
              >
                Register
              </Link>{" "}
              and tick &quot;Register as venue manager&quot;, or keep this
              account and use the button above.
            </p>
          </section>
        )}

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 border-t border-stone-200/80 pt-6"
          noValidate
          aria-busy={profileQuery.isPending || profileMutation.isPending}
        >
          <h2 className="font-display text-lg font-semibold text-brand-950">
            Profile details
          </h2>
          <p className="text-xs text-brand-700/85">
            Paste a public https image link. Leave a field blank to keep the
            current image. Only <strong>Bio</strong> is updated on every save.
          </p>

          <div>
            <label
              htmlFor="profile-bio"
              className="text-sm font-medium text-brand-800"
            >
              Bio{" "}
              <span className="font-normal text-brand-700/75">(public)</span>
            </label>
            <textarea
              id="profile-bio"
              rows={4}
              maxLength={500}
              aria-invalid={Boolean(errors.bio) || undefined}
              aria-describedby={
                errors.bio ? "profile-bio-error" : "profile-bio-counter"
              }
              disabled={!profileQuery.isSuccess || profileMutation.isPending}
              className="mt-1 w-full resize-y rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-red-500 disabled:opacity-60"
              {...form.register("bio")}
            />
            <p
              id="profile-bio-counter"
              className="mt-1 text-xs text-brand-700/75"
            >
              {bioLen} / 500 characters, shown where your profile appears on
              venues and host pages.
            </p>
            {errors.bio ? (
              <p
                id="profile-bio-error"
                className="mt-1 text-sm text-red-700"
                role="alert"
              >
                {errors.bio.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-brand-900">
              Banner image
            </h3>
            <label
              htmlFor="profile-banner-url"
              className="text-sm font-medium text-brand-800"
            >
              Banner URL{" "}
              <span className="font-normal text-brand-700/75">(optional)</span>
            </label>
            <input
              id="profile-banner-url"
              type="url"
              inputMode="url"
              placeholder="https://..."
              aria-invalid={Boolean(errors.bannerUrl) || undefined}
              aria-describedby={
                errors.bannerUrl
                  ? "profile-banner-url-error"
                  : "profile-banner-url-hint"
              }
              disabled={!profileQuery.isSuccess || profileMutation.isPending}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-red-500 disabled:opacity-60"
              {...form.register("bannerUrl")}
            />
            <p
              id="profile-banner-url-hint"
              className="text-xs text-brand-700/75"
            >
              Wide image for your profile header. Leave blank to keep the
              current banner.
            </p>
            {errors.bannerUrl ? (
              <p
                id="profile-banner-url-error"
                className="mt-1 text-sm text-red-700"
                role="alert"
              >
                {errors.bannerUrl.message}
              </p>
            ) : null}
            {bannerUrl ? (
              <div className="mt-3">
                {!bannerBroken ? (
                  <img
                    src={bannerUrl}
                    alt={watchedBannerAlt?.trim() || "Banner preview"}
                    className="h-28 w-full rounded-xl object-cover"
                    onError={() => setBrokenBannerUrl(bannerUrl)}
                  />
                ) : (
                  <p role="alert" className="text-sm text-red-700">
                    That image URL could not be loaded. Check it is a public
                    https link.
                  </p>
                )}
              </div>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="profile-banner-alt"
              className="text-sm font-medium text-brand-800"
            >
              Banner alt text{" "}
              <span className="font-normal text-brand-700/75">(optional)</span>
            </label>
            <input
              id="profile-banner-alt"
              aria-invalid={Boolean(errors.bannerAlt) || undefined}
              aria-describedby={
                errors.bannerAlt ? "profile-banner-alt-error" : undefined
              }
              disabled={!profileQuery.isSuccess || profileMutation.isPending}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 disabled:opacity-60"
              {...form.register("bannerAlt")}
            />
            {errors.bannerAlt ? (
              <p
                id="profile-banner-alt-error"
                className="mt-1 text-sm text-red-700"
                role="alert"
              >
                {errors.bannerAlt.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-brand-900">
              Avatar image
            </h3>
            <label
              htmlFor="profile-avatar-url"
              className="text-sm font-medium text-brand-800"
            >
              Avatar URL{" "}
              <span className="font-normal text-brand-700/75">(optional)</span>
            </label>
            <input
              id="profile-avatar-url"
              type="url"
              inputMode="url"
              placeholder="https://..."
              aria-invalid={Boolean(errors.avatarUrl) || undefined}
              aria-describedby={
                errors.avatarUrl
                  ? "profile-avatar-url-error"
                  : "profile-avatar-url-hint"
              }
              disabled={!profileQuery.isSuccess || profileMutation.isPending}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 aria-[invalid=true]:border-red-500 disabled:opacity-60"
              {...form.register("avatarUrl")}
            />
            <p
              id="profile-avatar-url-hint"
              className="text-xs text-brand-700/75"
            >
              Square images work best. Leave blank to keep your current avatar.
            </p>
            {errors.avatarUrl ? (
              <p
                id="profile-avatar-url-error"
                className="mt-1 text-sm text-red-700"
                role="alert"
              >
                {errors.avatarUrl.message}
              </p>
            ) : null}
            {avatarUrl ? (
              <div className="mt-3">
                {!avatarBroken ? (
                  <img
                    src={avatarUrl}
                    alt={watchedAvatarAlt?.trim() || "Avatar preview"}
                    className="h-24 w-24 rounded-full object-cover"
                    onError={() => setBrokenAvatarUrl(avatarUrl)}
                  />
                ) : (
                  <p role="alert" className="text-sm text-red-700">
                    That image URL could not be loaded. Check it is a public
                    https link.
                  </p>
                )}
              </div>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="profile-avatar-alt"
              className="text-sm font-medium text-brand-800"
            >
              Avatar alt text{" "}
              <span className="font-normal text-brand-700/75">(optional)</span>
            </label>
            <input
              id="profile-avatar-alt"
              aria-invalid={Boolean(errors.avatarAlt) || undefined}
              aria-describedby={
                errors.avatarAlt ? "profile-avatar-alt-error" : undefined
              }
              disabled={!profileQuery.isSuccess || profileMutation.isPending}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-4 py-2.5 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30 disabled:opacity-60"
              {...form.register("avatarAlt")}
            />
            {errors.avatarAlt ? (
              <p
                id="profile-avatar-alt-error"
                className="mt-1 text-sm text-red-700"
                role="alert"
              >
                {errors.avatarAlt.message}
              </p>
            ) : null}
          </div>

          {errors.root ? (
            <Alert tone="error">{errors.root.message}</Alert>
          ) : null}
          {profileMutation.isSuccess && !errors.root ? (
            <Alert tone="success">Profile updated.</Alert>
          ) : null}
          <button
            type="submit"
            disabled={
              !profileQuery.isSuccess ||
              isSubmitting ||
              profileMutation.isPending ||
              profileQuery.isPending
            }
            aria-disabled={
              !profileQuery.isSuccess ||
              isSubmitting ||
              profileMutation.isPending ||
              profileQuery.isPending
            }
            className="w-full rounded-full bg-brand-800 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/15 transition hover:bg-brand-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {profileMutation.isPending ? "Saving profile..." : "Save profile"}
          </button>
        </form>

        <section
          className="border-t border-stone-200/80 pt-6"
          aria-labelledby="sign-out-heading"
        >
          <h2
            id="sign-out-heading"
            className="font-display text-lg font-semibold text-brand-950"
          >
            Sign out
          </h2>
          <p className="mt-1 text-sm text-brand-800/80">
            End your session on this tab. You will need to sign in again to book
            or manage venues.
          </p>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-4 w-full rounded-full border border-stone-400 py-3 text-sm font-semibold text-brand-950 transition hover:bg-stone-50"
          >
            Log out
          </button>
        </section>
      </div>

      <section
        className="shadow-elevate w-full rounded-[2rem] border border-stone-200/90 bg-white p-6 md:p-8"
        aria-labelledby="saved-stays-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="saved-stays-heading"
            className="font-display text-lg font-semibold text-brand-950"
          >
            Saved stays
          </h2>
          {favoriteIds.length > 0 ? (
            <Link
              to="/venues?view=saved"
              className="text-sm font-semibold text-mobile-primary underline-offset-4 hover:underline"
            >
              Same list on Venues
            </Link>
          ) : null}
        </div>
        <p className="mt-2 max-w-xl text-sm text-brand-800/85">
          Favorites saved on this device with the heart on listings. You can
          open or remove them here.
        </p>
        {favoriteIds.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-8 text-center text-sm text-brand-800/85">
            No saved stays yet. Use the heart on listings on{" "}
            <Link
              to="/"
              className="font-semibold text-mobile-primary underline-offset-4 hover:underline"
            >
              Home
            </Link>{" "}
            or{" "}
            <Link
              to="/venues"
              className="font-semibold text-mobile-primary underline-offset-4 hover:underline"
            >
              Venues
            </Link>{" "}
            to add some.
          </p>
        ) : favoritesLoading ? (
          <p
            className="mt-6 rounded-2xl border border-dashed border-stone-300 py-12 text-center text-sm text-brand-800/85"
            role="status"
            aria-live="polite"
          >
            Loading saved stays...
          </p>
        ) : (
          <>
            {favoritesErrorCount > 0 ? (
              <Alert tone="warning" className="mt-4">
                {favoritesErrorCount === favoriteIds.length ? (
                  <>
                    We could not load your saved venues. They may have been
                    removed from the catalogue. Clear those hearts from the home
                    or venues list when you find them again.
                  </>
                ) : (
                  <>
                    Some saved venues could not be loaded ({favoritesErrorCount}{" "}
                    missing). The rest are listed below.
                  </>
                )}
              </Alert>
            ) : null}
            {favoriteVenues.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favoriteVenues.map((v) => (
                  <CuratedVenueCard
                    key={v.id}
                    venue={v}
                    favorited={Boolean(favorites[v.id])}
                    onToggleFav={toggleFavorite}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}
