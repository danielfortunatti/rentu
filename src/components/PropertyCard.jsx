import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../data/properties'
import { formatUf } from '../utils/ufConverter'

export default function PropertyCard({ property }) {
  const { id, titulo, tipo, precio, comuna, m2, habitaciones, banos, fotos, destacada, estacionamiento, mascotas, amoblado, gastoComun, user_id, created_at, fechaPublicacion, precio_anterior, disponible_desde } = property
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const cardRef = useRef(null)

  const handleMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setTilt({
      x: (px - 0.5) * 8,
      y: (0.5 - py) * 8,
    })
    setMousePos({ x: px * 100, y: py * 100 })
  }, [])

  const handleLeave = () => {
    setHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <Link
      ref={cardRef}
      to={`/propiedad/${id}`}
      aria-label={`Ver propiedad: ${titulo} en ${comuna}`}
      className="group block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-brand-200/50 dark:hover:border-brand-700/50 card-3d-interactive spotlight-card gradient-border"
      style={{
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
        transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: hovered ? 'transform 0.1s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
    >
      {/* Shine overlay */}
      <div
        className="card-shine"
        style={{
          '--mouse-x': `${mousePos.x}%`,
          '--mouse-y': `${mousePos.y}%`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        {fotos && fotos.length > 0 ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700">
                <div className="w-full h-full animate-shimmer" />
              </div>
            )}
            <img
              src={fotos[0]}
              alt={titulo}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Smart Badges */}
        {(() => {
          const badges = []
          if (destacada) badges.push({ label: 'Destacada', className: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 badge-glow' })
          const publishDate = created_at || fechaPublicacion
          if (publishDate && (Date.now() - new Date(publishDate).getTime()) < 3 * 24 * 60 * 60 * 1000) {
            badges.push({ label: 'Nuevo', className: 'bg-blue-500' })
          }
          if (precio_anterior && precio_anterior > precio) {
            badges.push({ label: 'Precio rebajado', className: 'bg-red-500' })
          }
          if (!disponible_desde || new Date(disponible_desde) <= new Date()) {
            badges.push({ label: 'Disponible hoy', className: 'bg-green-500' })
          }
          const visibleBadges = badges.slice(0, 2)
          return visibleBadges.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {visibleBadges.map((badge) => (
                <div key={badge.label} className={`px-2.5 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg ${badge.className}`}>
                  {badge.label}
                </div>
              ))}
            </div>
          )
        })()}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-lg shadow-sm">
          {tipo}
        </div>

        {/* Price */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <span className="font-display font-bold text-2xl text-white drop-shadow-lg">{formatPrice(precio)}</span>
            <span className="text-white/70 text-sm">/mes</span>
            <span className="text-white/50 text-[10px] ml-1">{formatUf(precio)}</span>
          </div>
          {gastoComun > 0 && (
            <span className="text-white/60 text-xs bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md">
              GC: {formatPrice(gastoComun)}
            </span>
          )}
        </div>

        {/* Photo count */}
        {fotos && fotos.length > 1 && (
          <div className="absolute bottom-12 right-3 flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-lg text-white text-xs">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
            {fotos.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative p-4">
        <h3 className="font-display font-semibold text-gray-800 dark:text-gray-100 text-sm leading-snug mb-2 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors line-clamp-1">{titulo}</h3>

        <div className="flex items-center gap-1.5 mb-3">
          <svg className="w-3.5 h-3.5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-xs text-gray-500 dark:text-gray-400">{comuna}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            {m2 || '--'} m2
          </span>
          <span className="text-gray-200 dark:text-gray-600">|</span>
          <span>{habitaciones} dorm</span>
          <span className="text-gray-200 dark:text-gray-600">|</span>
          <span>{banos} baño{banos > 1 ? 's' : ''}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {estacionamiento && <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-[10px] font-medium rounded-md border border-brand-100 dark:border-brand-800">Est.</span>}
          {mascotas && <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-medium rounded-md border border-green-100 dark:border-green-800">Mascotas</span>}
          {amoblado && amoblado !== 'sin' && <span className="px-2 py-0.5 bg-warm-100 dark:bg-warm-900/30 text-warm-700 dark:text-warm-400 text-[10px] font-medium rounded-md border border-warm-200 dark:border-warm-800">{amoblado === 'amoblado' ? 'Amoblado' : 'Semi'}</span>}
        </div>
      </div>
    </Link>
  )
}
