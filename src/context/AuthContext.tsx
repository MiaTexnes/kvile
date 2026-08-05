import { createContext, useContext, type ReactNode } from "react"

/** Shape nav expects; real session logic comes in later auth issues. */
export type AuthState = {
  accessToken: string
  name: string
  email: string
  profileEmail?: string
  venueManager: boolean
} | null

type AuthContextValue = {
  user: AuthState
  login: (email: string, password: string) => Promise<void>
  register: (params: {
    name: string
    email: string
    password: string
    venueManager: boolean
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Temporary stub for Task 10 — guest only, no API / storage. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthContextValue = {
    user: null,
    login: async () => {},
    register: async () => {},
    logout: () => {},
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- useAuth paired with provider
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
