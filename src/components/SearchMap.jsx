import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'

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
    width: 32px; height: 32px;
    background: #049e8d;
    border: 3px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 12px rgba(4,158,141,0.4);
    display: flex; align-items: center; justify-content: center;
  ">
    <svg style="transform: rotate(45deg); width: 14px; height: 14px;" viewBox="0 0 24 24" fill="white">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

function formatPrice(precio) {
  if (!precio) return ''
  return `$${Number(precio).toLocaleString('es-CL')}`
}

export default function SearchMap({ properties = [] }) {
  // Filter properties that have valid lat/lng
  const validProperties = useMemo(() =>
    properties.filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng)),
    [properties]
  )

  // Calculate center from properties, default to Santiago, Chile
  const center = useMemo(() => {
    if (validProperties.length === 0) return [-33.45, -70.65]
    const avgLat = validProperties.reduce((sum, p) => sum + Number(p.lat), 0) / validProperties.length
    const avgLng = validProperties.reduce((sum, p) => sum + Number(p.lng), 0) / validProperties.length
    return [avgLat, avgLng]
  }, [validProperties])

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
      style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}
    >
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validProperties.map(property => (
          <Marker
            key={property.id}
            position={[Number(property.lat), Number(property.lng)]}
            icon={propertyIcon}
          >
            <Popup>
              <div className="min-w-[200px] max-w-[240px]">
                {property.fotos && property.fotos.length > 0 && (
                  <img
                    src={property.fotos[0]}
                    alt={property.titulo || 'Propiedad'}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                    loading="lazy"
                  />
                )}
                <p className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
                  {property.titulo}
                </p>
                <p className="text-brand-600 font-bold text-sm mb-1">
                  {formatPrice(property.precio)}/mes
                </p>
                {property.comuna && (
                  <p className="text-gray-500 text-xs mb-2">{property.comuna}</p>
                )}
                <Link
                  to={`/propiedad/${property.id}`}
                  className="inline-block text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Ver detalle
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {validProperties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 dark:bg-gray-800/80 pointer-events-none">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay propiedades con ubicación disponible
          </p>
        </div>
      )}
    </div>
  )
}
