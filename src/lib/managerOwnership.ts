export function isCurrentUserVenueOwner(
  ownerName: string | undefined | null,
  profileName: string | undefined | null,
): boolean {
  const owner = ownerName?.trim().toLowerCase()
  const me = profileName?.trim().toLowerCase()
  if (!owner || !me) return false
  return owner === me
}
