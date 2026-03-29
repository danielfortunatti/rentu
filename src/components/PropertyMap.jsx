import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { fetchNearbyPOIs, POI_CATEGORIES, formatDistance } from '../utils/overpassApi'

// Fix Leaflet default marker icon issue with Vite bundler
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Custom property marker (branded teal)
const propertyIcon = L.divIcon({
  className: 'property-marker',
  html: `<div style="
    width: 36px; height: 36px;
    background: #049e8d;
    border: 3px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 12px rgba(4,158,141,0.4);
    display: flex; align-items: center; justify-content: center;
  ">
    <svg style="transform: rotate(45deg); width: 16px; height: 16px;" viewBox="0 0 24 24" fill="white">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
})

// POI circle marker factory
function createPOIIcon(color) {
  return L.divIcon({
    className: 'poi-marker',
    html: `<div style="
      width: 14px; height: 14px;
      background: ${color};
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}

// Recenter map helper
function RecenterMap({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 15)
  }, [lat, lng, map])
  return null
}

export default function PropertyMap({ lat, lng, comuna, address }) {
  const [pois, setPois] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeCategories, setActiveCategories] = useState(() => {
    const initial = {}
    Object.keys(POI_CATEGORIES).forEach(key => {
      initial[key] = key !== 'restaurant' // restaurants off by default
    })
    return initial
  })

  useEffect(() => {
    if (!lat || !lng) return
    setLoading(true)
    setError(false)
    fetchNearbyPOIs(lat, lng, 1000)
      .then(data => {
        setPois(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [lat, lng])

  const toggleCategory = (key) => {
    setActiveCategories(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Flatten visible POIs for rendering
  const visiblePOIs = useMemo(() => {
    if (!pois) return []
    const result = []
    Object.entries(pois).forEach(([category, items]) => {
      if (activeCategories[category]) {
        items.forEach(poi => result.push(poi))
      }
    })
    return result
  }, [pois, activeCategories])

  // Closest POI per category for the summary
  const closestByCategory = useMemo(() => {
    if (!pois) return {}
    const result = {}
    Object.entries(pois).forEach(([category, items]) => {
      if (items.length > 0) {
        result[category] = items[0] // already sorted by distance
      }
    })
    return result
  }, [pois])

  // POI icon cache
  const poiIcons = useMemo(() => {
    const icons = {}
    Object.entries(POI_CATEGORIES).forEach(([key, cat]) => {
      icons[key] = createPOIIcon(cat.color)
    })
    return icons
  }, [])

  if (!lat || !lng) return null

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-gray-800 dark:text-gray-100 text-lg">
        Ubicaci\u00f3n y alrededores
      </h3>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm" style={{ height: '400px' }}>
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <RecenterMap lat={lat} lng={lng} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Search radius circle */}
          <Circle
            center={[lat, lng]}
            radius={1000}
            pathOptions={{
              color: '#049e8d',
              fillColor: '#049e8d',
              fillOpacity: 0.05,
              weight: 1,
              dashArray: '6 4',
            }}
          />

          {/* Property marker */}
          <Marker position={[lat, lng]} icon={propertyIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{address}</p>
                <p className="text-gray-500">{comuna}</p>
              </div>
            </Popup>
          </Marker>

          {/* POI markers */}
          {visiblePOIs.map(poi => (
            <Marker
              key={`${poi.category}-${poi.id}`}
              position={[poi.lat, poi.lng]}
              icon={poiIcons[poi.category]}
            >
              <Popup>
                <div className="text-sm min-w-[140px]">
                  <p className="font-semibold text-gray-800">
                    {POI_CATEGORIES[poi.category]?.icon} {poi.name}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {POI_CATEGORIES[poi.category]?.label}
                  </p>
                  <p className="text-brand-600 font-medium text-xs mt-1">
                    {formatDistance(poi.distance)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend / Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(POI_CATEGORIES).map(([key, cat]) => {
          const count = pois?.[key]?.length || 0
          return (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeCategories[key]
                  ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  background: activeCategories[key] ? cat.color : '#d1d5db',
                }}
              />
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {count > 0 && (
                <span className={`ml-0.5 ${activeCategories[key] ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          Buscando lugares cercanos...
        </div>
      )}

      {/* Error state */}
      {error && (
        <p className="text-sm text-gray-400">
          No se pudieron cargar los puntos de inter\u00e9s cercanos.
        </p>
      )}

      {/* Summary: closest POI per category */}
      {!loading && !error && pois && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(closestByCategory).map(([category, poi]) => {
            const cat = POI_CATEGORIES[category]
            return (
              <div
                key={category}
                className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl"
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${cat.color}15` }}
                >
                  {cat.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {cat.label} m\u00e1s cercano
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                    {poi.name}
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 whitespace-nowrap">
                  {formatDistance(poi.distance)}
                </span>
              </div>
            )
          })}
          {Object.keys(closestByCategory).length === 0 && (
            <p className="text-sm text-gray-400 col-span-2">
              No se encontraron puntos de inter\u00e9s en un radio de 1 km.
            </p>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500">
        {address}, {comuna} \u2014 Radio de b\u00fasqueda: 1 km
      </p>
    </div>
  )
}
