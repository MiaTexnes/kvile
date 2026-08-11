export interface ApiMeta {
  isFirstPage?: boolean
  isLastPage?: boolean
  currentPage?: number
  previousPage?: number | null
  nextPage?: number | null
  pageCount?: number
  totalCount?: number
}

export interface ApiListResponse<T> {
  data: T[]
  meta: ApiMeta
}

export interface ApiResponse<T> {
  data: T
  meta: Record<string, unknown>
}

export interface MediaItem {
  url: string
  alt?: string
}

export interface VenueMeta {
  wifi?: boolean
  parking?: boolean
  breakfast?: boolean
  pets?: boolean
}

export interface VenueLocation {
  address?: string | null
  city?: string | null
  zip?: string | null
  country?: string | null
  continent?: string | null
  lat?: number
  lng?: number
}

export interface ProfileSnippet {
  name: string
  email: string
  bio?: string | null
  avatar?: MediaItem | null
  banner?: MediaItem | null
}

export interface Booking {
  id: string
  dateFrom: string
  dateTo: string
  guests: number
  created?: string
  updated?: string
  venue?: Venue
  customer?: ProfileSnippet
}

export interface Venue {
  id: string
  name: string
  description: string
  media: MediaItem[]
  price: number
  maxGuests: number
  rating?: number
  created?: string
  updated?: string
  meta?: VenueMeta
  location?: VenueLocation
  owner?: ProfileSnippet
  bookings?: Booking[]
}

// Noroff /profiles payload
export interface HolidazeProfile {
  name: string
  email: string
  bio?: string | null
  avatar?: MediaItem | null
  banner?: MediaItem | null
  venueManager: boolean
  _count?: { venues?: number; bookings?: number }
  venues?: Venue[]
  bookings?: Booking[]
}

export interface LoginResponseData extends ProfileSnippet {
  venueManager: boolean
  accessToken: string
}

export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  bio?: string
  avatar?: MediaItem
  banner?: MediaItem
  venueManager: boolean
}
