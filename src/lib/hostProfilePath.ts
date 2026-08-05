export function hostProfileHref(profileName: string): string {
  return `/hosts/${encodeURIComponent(profileName.trim())}`
}
