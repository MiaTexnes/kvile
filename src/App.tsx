import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { VenuesPage } from "./pages/VenuesPage"

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

const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
)

const ProtectedRoute = lazy(() =>
  import("./components/ProtectedRoute").then((m) => ({
    default: m.ProtectedRoute,
  })),
)

const ManagerRoute = lazy(() =>
  import("./components/ManagerRoute").then((m) => ({
    default: m.ManagerRoute,
  })),
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
          <Route path="venues/:id" element={<VenueDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            element={
              <Suspense fallback={routeFallback}>
                <ProtectedRoute />
              </Suspense>
            }
          >
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route
            element={
              <Suspense fallback={routeFallback}>
                <ManagerRoute />
              </Suspense>
            }
          >
            <Route path="manager/venues" element={<ManagerVenuesPage />} />
            <Route
              path="manager/venues/new"
              element={<ManagerVenueFormPage mode="create" />}
            />
            {/* Task 36: host edits an existing venue */}
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
