/**
 * Geocode an address using multiple providers for best accuracy with Chilean addresses.
 * Falls back through: structured Nominatim → free-form Nominatim → street-only search
 */
export async function geocodeAddress(address, comuna) {
  // Clean up the address
  const cleanAddress = address.trim().replace(/\s+/g, ' ')
  const cleanComuna = comuna.trim()

  // Strategy 1: Structured Nominatim search (most precise)
  try {
    const params = new URLSearchParams({
      format: 'json',
      street: cleanAddress,
      city: cleanComuna,
      country: 'Chile',
      limit: '5',
      addressdetails: '1',
    })
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': 'Rentu/1.0 (rentu.contacto@gmail.com)' },
    })
    const data = await res.json()
    const result = pickBestResult(data, cleanComuna)
    if (result) return result
  } catch { /* continue */ }

  // Strategy 2: Free-form queries with increasing specificity
  const queries = [
    `${cleanAddress}, ${cleanComuna}, Región Metropolitana, Chile`,
    `${cleanAddress}, ${cleanComuna}, Chile`,
    `${cleanAddress}, Santiago, Chile`,
  ]

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&countrycodes=cl&addressdetails=1&bounded=1&viewbox=-71.1,-33.2,-70.3,-33.7`,
        { headers: { 'User-Agent': 'Rentu/1.0 (rentu.contacto@gmail.com)' } }
      )
      const data = await res.json()
      const result = pickBestResult(data, cleanComuna)
      if (result) return result
    } catch { continue }
  }

  // Strategy 3: Search only the street name (without number) in the comuna
  const streetOnly = cleanAddress.replace(/\d+.*$/, '').trim()
  if (streetOnly && streetOnly !== cleanAddress) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${streetOnly}, ${cleanComuna}, Chile`)}&limit=10&countrycodes=cl&addressdetails=1`,
        { headers: { 'User-Agent': 'Rentu/1.0 (rentu.contacto@gmail.com)' } }
      )
      const data = await res.json()
      const result = pickBestResult(data, cleanComuna)
      if (result) return result
    } catch { /* give up */ }
  }

  return null
}

/**
 * Pick the best result from Nominatim response, prioritizing:
 * 1. Results in the correct comuna
 * 2. Results with higher importance score
 * 3. Results that are addresses (not cities or regions)
 */
function pickBestResult(data, comuna) {
  if (!data || data.length === 0) return null

  const comunaLower = comuna.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents for matching

  // Score each result
  const scored = data.map(r => {
    let score = 0
    const display = (r.display_name || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const addr = r.address || {}

    // Strong bonus for matching comuna in address details
    const addrComuna = (addr.city || addr.town || addr.suburb || addr.city_district || addr.municipality || '')
      .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (addrComuna.includes(comunaLower) || comunaLower.includes(addrComuna)) score += 50

    // Bonus for comuna appearing in display name
    if (display.includes(comunaLower)) score += 20

    // Prefer specific addresses over areas
    if (r.type === 'house' || r.type === 'residential') score += 15
    if (r.type === 'road' || r.type === 'street') score += 10
    if (r.class === 'place' && r.type === 'city') score -= 20

    // Use Nominatim's own importance ranking
    score += (r.importance || 0) * 10

    return { ...r, score }
  })

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  const best = scored[0]
  if (best.score < 5) return null // too low confidence

  return {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    displayName: best.display_name,
    confidence: best.score,
  }
}
