/**
 * Extract coordinates from a Google Maps URL.
 * Supports multiple URL formats:
 * - https://www.google.com/maps/place/.../@-33.5228,-70.5888,17z/...
 * - https://www.google.com/maps?q=-33.5228,-70.5888
 * - https://maps.google.com/?q=-33.5228,-70.5888
 * - https://www.google.com/maps/@-33.5228,-70.5888,17z
 * - https://maps.app.goo.gl/... (short links — need redirect)
 * - https://goo.gl/maps/... (short links — need redirect)
 */
export function extractCoordsFromGoogleMapsUrl(url) {
  if (!url) return null

  try {
    // Pattern 1: /@lat,lng,zoom
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (atMatch) {
      return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) }
    }

    // Pattern 2: ?q=lat,lng or &q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (qMatch) {
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) }
    }

    // Pattern 3: /place/lat,lng
    const placeMatch = url.match(/\/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (placeMatch) {
      return { lat: parseFloat(placeMatch[1]), lng: parseFloat(placeMatch[2]) }
    }

    // Pattern 4: ll=lat,lng
    const llMatch = url.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (llMatch) {
      return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) }
    }
  } catch {
    return null
  }

  return null
}

/**
 * Validate that a URL is a Google Maps link
 */
export function isGoogleMapsUrl(url) {
  if (!url) return false
  return /^https?:\/\/(www\.)?(google\.(com|cl|[a-z]{2,3})\/maps|maps\.google\.(com|cl|[a-z]{2,3})|maps\.app\.goo\.gl|goo\.gl\/maps)/.test(url)
}

/**
 * Generate a Google Maps directions URL from coordinates
 */
export function getGoogleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

/**
 * Generate a Google Maps URL from coordinates (for viewing)
 */
export function getGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`
}
