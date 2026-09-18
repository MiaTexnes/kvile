import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { VenuesPage } from "./pages/VenuesPage"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { ManagerRoute } from "./components/ManagerRoute"
import { NotFoundPage } from "./pages/NotFoundPage"

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
)

const MyBookingsPage = lazy(() =>
  import("./pages/MyBookingsPage").then((m) => ({
    default: m.MyBookingsPage,
  })),
)

const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
)

const VenueDetailPage = lazy(() =>
  import("./pages/VenueDetailPage").then((m) => ({
    default: m.VenueDetailPage,
  })),
)

const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({
    default: m.RegisterPage,
  })),
)

const ManagerVenuesPage = lazy(() =>
  import("./pages/Manager/ManagerVenuesPage").then((m) => ({
    default: m.ManagerVenuesPage,
  })),
)

const ManagerVenueFormPage = lazy(() =>
  import("./pages/Manager/ManagerVenueFormPage").then((m) => ({
    default: m.ManagerVenueFormPage,
  })),
)

const ManagerVenueBookingsPage = lazy(() =>
  import("./pages/Manager/ManagerVenueBookingsPage").then((m) => ({
    default: m.ManagerVenueBookingsPage,
  })),
)

const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })),
)

const HostVenuesPage = lazy(() =>
  import("./pages/HostVenuesPage").then((m) => ({
    default: m.HostVenuesPage,
  })),
)

const PrivacyPolicyPage = lazy(() =>
  import("./pages/PrivacyPolicyPage").then((m) => ({
    default: m.PrivacyPolicyPage,
  })),
)

const TermsOfServicePage = lazy(() =>
  import("./pages/TermsOfServicePage").then((m) => ({
    default: m.TermsOfServicePage,
  })),
)

const routeFallback = (
  <p role="status" aria-live="polite" className="text-brand-800">
    Loading…
  </p>
)

export default function App() {
  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="venues" element={<VenuesPage />} />
          <Route path="hosts/:hostName" element={<HostVenuesPage />} />
          <Route path="venues/:id" element={<VenueDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsOfServicePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route element={<ManagerRoute />}>
            <Route path="manager/venues" element={<ManagerVenuesPage />} />
            <Route
              path="manager/venues/new"
              element={<ManagerVenueFormPage mode="create" />}
            />
            <Route
              path="manager/venues/:id/bookings"
              element={<ManagerVenueBookingsPage />}
            />
            <Route
              path="manager/venues/:id/edit"
              element={<ManagerVenueFormPage mode="edit" />}
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
