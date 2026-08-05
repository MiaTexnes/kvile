import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function ManagerRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (!user.venueManager) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
