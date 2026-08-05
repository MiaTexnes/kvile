import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { VenuesPage } from "./pages/VenuesPage"

const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
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
          {/* nested pages go here as you build them */}
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
