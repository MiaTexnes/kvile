import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import { ProtectedRoute } from "./ProtectedRoute"

const useAuthMock = vi.fn()

vi.mock("../context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}))

function renderProtected(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/my-bookings" element={<p>Trips content</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ProtectedRoute", () => {
  it("redirects guests to login", () => {
    useAuthMock.mockReturnValue({ user: null })
    renderProtected("/my-bookings")
    expect(screen.getByText("Login page")).toBeInTheDocument()
  })

  it("renders child routes for signed-in users", () => {
    useAuthMock.mockReturnValue({
      user: { accessToken: "jwt", name: "Test", email: "t@stud.noroff.no" },
    })
    renderProtected("/my-bookings")
    expect(screen.getByText("Trips content")).toBeInTheDocument()
  })
})
