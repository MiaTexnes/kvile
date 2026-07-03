import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const routeFallback = (
  <p role="status" aria-live="polite" className="text-brand-800">Loading...</p>
);

export default function App() {
  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route path="*" element={ <NotFoundPage />}/>
      </Routes>
    </Suspense>
  );
}