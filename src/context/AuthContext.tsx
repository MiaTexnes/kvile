import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"
import * as api from "../lib/api"

const TOKEN_KEY = "holidaze_access_token"
const NAME_KEY = "holidaze_profile_name"
const EMAIL_KEY = "holidaze_profile_email"
const PROFILE_EMAIL_KEY = "holidaze_profile_record_email"
const MANAGER_KEY = "holidaze_venue_manager"

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
  setSession: (data: NonNullable<AuthState>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStored(): AuthState {
  const accessToken = sessionStorage.getItem(TOKEN_KEY)
  const name = sessionStorage.getItem(NAME_KEY)
  const email = sessionStorage.getItem(EMAIL_KEY) ?? ""
  const vm = sessionStorage.getItem(MANAGER_KEY)
  if (!accessToken || !name) return null
  const profileEmail = sessionStorage.getItem(PROFILE_EMAIL_KEY) ?? undefined
  return {
    accessToken,
    name,
    email,
    profileEmail: profileEmail || undefined,
    venueManager: vm === "true",
  }
}

function persistSession(data: NonNullable<AuthState>) {
  sessionStorage.setItem(TOKEN_KEY, data.accessToken)
  sessionStorage.setItem(NAME_KEY, data.name)
  sessionStorage.setItem(EMAIL_KEY, data.email)
  if (data.profileEmail?.trim()) {
    sessionStorage.setItem(PROFILE_EMAIL_KEY, data.profileEmail.trim())
  } else {
    sessionStorage.removeItem(PROFILE_EMAIL_KEY)
  }
  sessionStorage.setItem(MANAGER_KEY, String(data.venueManager))
}

function clearStorage() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(NAME_KEY)
  sessionStorage.removeItem(EMAIL_KEY)
  sessionStorage.removeItem(PROFILE_EMAIL_KEY)
  sessionStorage.removeItem(MANAGER_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthState>(() => readStored())

  const logout = useCallback(() => {
    clearStorage()
    setUser(null)
    navigate("/login")
  }, [navigate])

  useEffect(() => {
    api.setUnauthorizedHandler(() => {
      clearStorage()
      setUser(null)
      navigate("/login")
    })
    return () => api.setUnauthorizedHandler(null)
  }, [navigate])

  useEffect(() => {
    if (!user?.accessToken) return
    let cancelled = false
    void api
      .fetchProfile(user.accessToken, user.name)
      .then((profile) => {
        if (cancelled) return
        setUser((prev) => {
          if (!prev) return prev
          const next = {
            ...prev,
            name: profile.name,
            profileEmail: profile.email,
            venueManager: profile.venueManager,
          }
          if (
            next.name === prev.name &&
            next.profileEmail === prev.profileEmail &&
            next.venueManager === prev.venueManager
          ) {
            return prev
          }
          persistSession(next)
          return next
        })
      })
      .catch(() => {
        /* Couldn’t refresh the profile (offline / API). Keep the session we already have. */
      })
    return () => {
      cancelled = true
    }
  }, [user?.accessToken, user?.name])

  const login = useCallback(async (email: string, password: string) => {
    const signInEmail = email.trim()
    const data = await api.loginUser(signInEmail, password)
    let venueManager = data.venueManager
    let name = data.name
    let profileEmail: string | undefined
    try {
      const profile = await api.fetchProfile(data.accessToken, data.name)
      venueManager = profile.venueManager
      name = profile.name
      profileEmail = profile.email
    } catch {
      /* Login succeeded; skip extra profile fields if that request fails. */
    }
    const session = {
      accessToken: data.accessToken,
      name,
      email: signInEmail,
      profileEmail,
      venueManager,
    }
    persistSession(session)
    setUser(session)
  }, [])

  const register = useCallback(
    async (params: {
      name: string
      email: string
      password: string
      venueManager: boolean
    }) => {
      const created = await api.registerUser({
        name: params.name,
        email: params.email,
        password: params.password,
        venueManager: params.venueManager,
      })
      await login(params.email, params.password)
      if (created.venueManager) {
        setUser((current) => {
          if (!current) return current
          const merged = {
            ...current,
            venueManager: current.venueManager || created.venueManager,
          }
          persistSession(merged)
          return merged
        })
      }
    },
    [login],
  )

  const setSession = useCallback((data: NonNullable<AuthState>) => {
    persistSession(data)
    setUser(data)
  }, [])

  const value = useMemo(
    () => ({ user, login, register, logout, setSession }),
    [user, login, register, logout, setSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- useAuth lives next to AuthProvider so I don't have to split this into two files
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
