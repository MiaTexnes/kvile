import { Link, Navigate, Outlet, useLocation } from "react-router-dom"
import { Alert } from "./Alert"
import { useAuth } from "../context/AuthContext"

export function ManagerRoute() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (!user.venueManager) {
    return (
      <Alert tone="info">
        Host tools are for venue managers. Enable hosting on your{" "}
        <Link to="/profile" className="font-semibold underline">
          profile
        </Link>
        , or{" "}
        <Link to="/register" className="font-semibold underline">
          register
        </Link>{" "}
        with “Register as venue manager” ticked.
      </Alert>
    )
  }
  return <Outlet />
}
