/**
 * Fetches nearby points of interest from Overpass API (OpenStreetMap)
 * Free, no API key required
 */

const POI_CATEGORIES = {
  metro: { label: 'Metro', icon: '\u{1F687}', color: '#E53E3E' },
  bus: { label: 'Paradero de bus', icon: '\u{1F68C}', color: '#DD6B20' },
  supermarket: { label: 'Supermercado', icon: '\u{1F6D2}', color: '#38A169' },
  pharmacy: { label: 'Farmacia', icon: '\u{1F48A}', color: '#805AD5' },
  mall: { label: 'Centro comercial', icon: '\u{1F3EC}', color: '#D69E2E' },
  school: { label: 'Colegio/Universidad', icon: '\u{1F393}', color: '#3182CE' },
  hospital: { label: 'Hospital/Cl\u00ednica', icon: '\u{1F3E5}', color: '#E53E3E' },
  bank: { label: 'Banco', icon: '\u{1F3E6}', color: '#2D3748' },
  park: { label: 'Parque', icon: '\u{1F333}', color: '#48BB78' },
  restaurant: { label: 'Restaurante', icon: '\u{1F37D}\uFE0F', color: '#ED8936' },
}

export { POI_CATEGORIES }

/**
 * Haversine formula: distance between two lat/lng points in meters
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

/**
 * Format distance for display
 */
export function formatDistance(meters) {
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * Categorize raw Overpass elements into POI groups
 */
function categorizeElement(el) {
  const tags = el.tags || {}

  if (tags.railway === 'station' && tags.station === 'subway') return 'metro'
  if (tags.highway === 'bus_stop') return 'bus'
  if (tags.shop === 'supermarket') return 'supermarket'
  if (tags.amenity === 'pharmacy') return 'pharmacy'
  if (tags.shop === 'mall') return 'mall'
  if (tags.amenity === 'school' || tags.amenity === 'university') return 'school'
  if (tags.amenity === 'hospital' || tags.amenity === 'clinic') return 'hospital'
  if (tags.amenity === 'bank') return 'bank'
  if (tags.leisure === 'park') return 'park'
  if (tags.amenity === 'restaurant') return 'restaurant'
  return null
}

function categorizeResults(elements, propLat, propLng) {
  const groups = {}
  Object.keys(POI_CATEGORIES).forEach(key => { groups[key] = [] })

  for (const el of elements) {
    if (!el.lat || !el.lon) continue
    const category = categorizeElement(el)
    if (!category) continue

    const distance = haversineDistance(propLat, propLng, el.lat, el.lon)
    const name = el.tags?.name || POI_CATEGORIES[category]?.label || 'Sin nombre'

    groups[category].push({
      id: el.id,
      name,
      lat: el.lat,
      lng: el.lon,
      distance,
      category,
    })
  }

  // Sort each category by distance
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => a.distance - b.distance)
  })

  return groups
}

/**
 * Fetch nearby POIs from Overpass API
 */
export async function fetchNearbyPOIs(lat, lng, radius = 1000) {
  const query = `
    [out:json][timeout:10];
    (
      node["railway"="station"]["station"="subway"](around:${radius},${lat},${lng});
      node["highway"="bus_stop"](around:${radius},${lat},${lng});
      node["shop"="supermarket"](around:${radius},${lat},${lng});
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
      node["shop"="mall"](around:${radius},${lat},${lng});
      node["amenity"="school"](around:${radius},${lat},${lng});
      node["amenity"="university"](around:${radius},${lat},${lng});
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      node["amenity"="bank"](around:${radius},${lat},${lng});
      node["leisure"="park"](around:${radius},${lat},${lng});
      node["amenity"="restaurant"](around:${radius},${lat},${lng});
    );
    out body;
  `

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`)
  }

  const data = await response.json()
  return categorizeResults(data.elements || [], lat, lng)
}
