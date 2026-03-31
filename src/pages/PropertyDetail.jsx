import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase, getProperty, deleteProperty, addFavorite, removeFavorite, isFavorite, getTenantProfile, getVerification } from '../lib/supabase'
import VerificationBadge from '../components/VerificationBadge'
import ReviewSection from '../components/ReviewSection'
import PropertyMap from '../components/PropertyMap'
import ConfirmModal from '../components/ConfirmModal'
import Lightbox from '../components/Lightbox'

import PropertyCard from '../components/PropertyCard'
import { SkeletonPropertyDetail } from '../components/SkeletonLoader'
import useToast from '../hooks/useToast'
import useRecentlyViewed from '../hooks/useRecentlyViewed'
import { formatPrice } from '../data/properties'
import { formatUf } from '../utils/ufConverter'
import { amenitiesEdificio, cercaniasOptions } from '../data/comunas'

export default function PropertyDetail({ user, onContractClick }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [fav, setFav] = useState(false)
  const [hasTenantProfile, setHasTenantProfile] = useState(false)
  const [profileCopied, setProfileCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [ownerVerification, setOwnerVerification] = useState(null)
  const [showReportMenu, setShowReportMenu] = useState(false)
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [ownerLastActive, setOwnerLastActive] = useState(null)
  const [userVerified, setUserVerified] = useState(false)
  const [similarProperties, setSimilarProperties] = useState([])
  const { toast, showToast } = useToast()
  const { addToRecentlyViewed } = useRecentlyViewed()

  const isOwner = user && property && user.id === property.user_id

  useEffect(() => {
    if (user && property) {
      isFavorite(user.id, property.id).then(setFav)
    }
  }, [user, property])

  useEffect(() => {
    if (user) {
      getTenantProfile(user.id).then(({ data }) => {
        if (data) setHasTenantProfile(true)
      })
      getVerification(user.id).then(({ data }) => {
        if (data && (data.estado === 'verificado_basico' || data.estado === 'verificado_completo')) {
          setUserVerified(true)
        }
      })
    }
  }, [user])

  useEffect(() => {
    if (property && property.user_id) {
      getVerification(property.user_id).then(({ data }) => {
        if (data && (data.estado === 'verificado_basico' || data.estado === 'verificado_completo')) {
          setOwnerVerification(data)
        }
      })
    }
  }, [property])

  useEffect(() => {
    if (property && property.user_id) {
      supabase
        .from('properties')
        .select('updated_at')
        .eq('user_id', property.user_id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data?.updated_at) setOwnerLastActive(data.updated_at)
        })
    }
  }, [property])

  const formatRelativeTime = (dateStr) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffMin = Math.floor(diffMs / 60000)
    const diffHrs = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    if (diffMin < 1) return 'hace un momento'
    if (diffMin < 60) return `hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`
    if (diffHrs < 24) return `hace ${diffHrs} hora${diffHrs !== 1 ? 's' : ''}`
    if (diffDays < 7) return `hace ${diffDays} dia${diffDays !== 1 ? 's' : ''}`
    if (diffWeeks < 5) return `hace ${diffWeeks} semana${diffWeeks !== 1 ? 's' : ''}`
    return `hace ${diffMonths} mes${diffMonths !== 1 ? 'es' : ''}`
  }

  const handleReport = async (reason) => {
    setReportSubmitting(true)
    const { error } = await supabase.from('reports').insert({
      property_id: property.id,
      reporter_id: user?.id || null,
      reason,
      created_at: new Date().toISOString()
    })
    setReportSubmitting(false)
    setShowReportMenu(false)
    if (error) {
      showToast('Error al enviar el reporte. Intenta de nuevo.', 'error')
    } else {
      showToast('Reporte enviado correctamente. Gracias por ayudarnos.', 'success')
    }
  }

  const toggleFav = async () => {
    if (!user) return
    if (fav) {
      await removeFavorite(user.id, property.id)
      setFav(false)
    } else {
      await addFavorite(user.id, property.id)
      setFav(true)
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(false)
    setDeleting(true)
    const { error } = await deleteProperty(property.id)
    setDeleting(false)
    if (error) { showToast('Error al eliminar la propiedad.', 'error'); return }
    navigate('/buscar')
  }

  useEffect(() => {
    async function load() {
      const { data } = await getProperty(isNaN(Number(id)) ? id : Number(id))
      if (data) {
        const fotos = data.property_photos?.sort((a, b) => a.position - b.position).map(ph => ph.url) || []
        const mapped = { ...data, fotos, gastoComun: data.gasto_comun, fechaPublicacion: data.created_at, amenities: data.amenities || [], cercanias: data.cercanias || [] }
        setProperty(mapped)
        addToRecentlyViewed({ id: mapped.id, titulo: mapped.titulo, comuna: mapped.comuna, precio: mapped.precio, foto: fotos[0], tipo: mapped.tipo })
      } else {
        setProperty(null)
      }
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (!property) return
    async function loadSimilar() {
      const { data } = await supabase
        .from('properties')
        .select('*, property_photos (id, url, position)')
        .eq('activa', true)
        .neq('id', property.id)
        .or(`comuna.eq.${property.comuna},tipo.eq.${property.tipo}`)
        .order('created_at', { ascending: false })
        .limit(4)
      if (data) {
        const mapped = data.map(p => ({
          ...p,
          fotos: p.property_photos?.sort((a, b) => (a.position || 0) - (b.position || 0)).map(ph => ph.url) || [],
          gastoComun: p.gasto_comun,
          fechaPublicacion: p.created_at,
        }))
        setSimilarProperties(mapped)
      }
    }
    loadSimilar()
  }, [property])

  if (loading) return <SkeletonPropertyDetail />

  if (property && property.activa === false && !(user && property.user_id === user.id)) return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        </div>
        <h2 className="font-display font-bold text-2xl text-gray-800 dark:text-gray-100 mb-3">Esta propiedad ya no esta disponible</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Es posible que haya sido desactivada o retirada por el propietario.</p>
        <Link to="/buscar" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Buscar otras propiedades</Link>
      </div>
    </div>
  )

  if (!property) return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
      <div className="text-center"><h2 className="font-display font-bold text-2xl text-gray-800 dark:text-gray-100 mb-4">Propiedad no encontrada</h2><Link to="/buscar" className="text-brand-600 hover:text-brand-700 text-sm font-medium">Volver a buscar</Link></div>
    </div>
  )

  const phone = property.telefono?.replace('+', '') || ''
  const profileUrl = user && hasTenantProfile ? `${window.location.origin}/perfil/${user.id}` : ''
  const whatsappMsg = user && hasTenantProfile
    ? `Hola, me interesa la propiedad "${property.titulo}" publicada en Rentu. Está disponible?\n\nMi perfil de arrendatario: ${profileUrl}`
    : `Hola, me interesa la propiedad "${property.titulo}" publicada en Rentu. Está disponible?`
  const whatsappUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMsg)}` : null

  const handleCopyProfile = () => {
    navigator.clipboard.writeText(profileUrl)
    setProfileCopied(true)
    setTimeout(() => setProfileCopied(false), 2000)
  }

  const amobladoLabel = { amoblado: 'Amoblado', semi: 'Semi-amoblado', sin: 'Sin amoblar' }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>{`${property.titulo} en ${property.comuna} | Rentu`}</title>
        <meta name="description" content={`${property.tipo} en ${property.comuna}, ${property.habitaciones} dormitorios, $${property.precio?.toLocaleString('es-CL')}/mes`} />
        <meta property="og:title" content={`${property.titulo} en ${property.comuna} | Rentu`} />
        <meta property="og:description" content={`${property.tipo} en ${property.comuna}, ${property.habitaciones} dorm, $${property.precio?.toLocaleString('es-CL')}/mes`} />
        <meta property="og:image" content={property.fotos?.[0] || 'https://rentu-cl.vercel.app/og-image.png'} />
        <meta property="og:url" content={`https://rentu-cl.vercel.app/propiedad/${property.id}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": property.titulo,
          "description": property.descripcion,
          "url": `https://rentu-cl.vercel.app/propiedad/${property.id}`,
          "datePosted": property.fechaPublicacion,
          "image": property.fotos?.[0] || undefined,
          "offers": {
            "@type": "Offer",
            "price": property.precio,
            "priceCurrency": "CLP",
            "availability": "https://schema.org/InStock",
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": property.direccion,
            "addressLocality": property.comuna,
            "addressCountry": "CL",
          },
          ...(property.lat && property.lng ? {
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": property.lat,
              "longitude": property.lng,
            }
          } : {}),
          "numberOfRooms": property.habitaciones,
          "floorSize": property.m2 ? { "@type": "QuantitativeValue", "value": property.m2, "unitCode": "MTK" } : undefined,
        })}</script>
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-600">Inicio</Link><span>/</span>
          <Link to="/buscar" className="hover:text-gray-600">Buscar</Link><span>/</span>
          <span className="text-gray-700 truncate">{property.titulo}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group" onClick={() => property.fotos.length > 0 && setLightboxOpen(true)}>
                {property.fotos.length > 0 ? (
                  <>
                    <img src={property.fotos[activePhoto]} alt={property.titulo} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                )}
                {property.destacada && <div className="absolute top-4 left-4 px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-lg">Destacada</div>}
                {property.fotos.length > 1 && <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg">{property.fotos.length} fotos</div>}
              </div>
              {property.fotos.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {property.fotos.map((foto, i) => (
                    <button key={i} onClick={() => setActivePhoto(i)} className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${activePhoto === i ? 'border-brand-500 shadow-lg shadow-brand-500/20' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={foto} alt={`Foto ${i + 1} de la propiedad`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100 mb-2">{property.titulo}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {property.direccion}, {property.comuna}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Superficie', value: `${property.m2 || '—'} m2` },
                  { label: 'Dormitorios', value: property.habitaciones },
                  { label: 'Baños', value: property.banos },
                  { label: 'Tipo', value: property.tipo },
                ].map(item => (
                  <div key={item.label} className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 text-center">
                    <span className="block font-display font-bold text-gray-800 text-lg">{item.value}</span>
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {property.estacionamiento && <span className="px-3 py-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium rounded-lg">Estacionamiento</span>}
                {property.bodega && <span className="px-3 py-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium rounded-lg">Bodega</span>}
                {property.mascotas && <span className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-lg">Acepta mascotas</span>}
                {property.amoblado && <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg">{amobladoLabel[property.amoblado] || property.amoblado}</span>}
                {property.estado && <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg">{property.estado}</span>}
                {property.piso && <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg">Piso {property.piso}</span>}
              </div>

              {/* Description */}
              <h3 className="font-display font-semibold text-gray-800 text-lg mb-3">Descripción</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{property.descripcion}</p>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-display font-semibold text-gray-800 text-lg mb-3">Equipamiento</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.amenities.map(key => {
                      const a = amenitiesEdificio.find(x => x.key === key)
                      return a ? (
                        <div key={key} className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                          <span className="text-lg">{a.icon}</span>
                          <span className="text-sm text-gray-600">{a.label}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Cercanias */}
              {property.cercanias && property.cercanias.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-gray-800 text-lg mb-3">Alrededores</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.cercanias.map(key => {
                      const c = cercaniasOptions.find(x => x.key === key)
                      return c ? (
                        <div key={key} className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                          <span className="text-lg">{c.icon}</span>
                          <span className="text-sm text-gray-600">{c.label}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Connectivity Score */}
              {(() => {
                function getConnectivityScore(cercanias) {
                  if (!cercanias || cercanias.length === 0) return 0
                  const transportKeys = ['metro', 'paradero']
                  const serviceKeys = ['supermercado', 'farmacia', 'hospital']
                  const lifeKeys = ['parque', 'restaurantes', 'mall', 'colegio']
                  let score = 0
                  cercanias.forEach(c => {
                    if (transportKeys.includes(c)) score += 2
                    else if (serviceKeys.includes(c)) score += 1.5
                    else if (lifeKeys.includes(c)) score += 1
                    else score += 0.5
                  })
                  return Math.min(5, Math.round(score * 10) / 10)
                }

                const score = getConnectivityScore(property.cercanias)
                if (score === 0) return null

                const barColor = score >= 4 ? 'bg-green-500' : score >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'
                const barBg = score >= 4 ? 'bg-green-100 dark:bg-green-900/20' : score >= 2.5 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20'
                const textColor = score >= 4 ? 'text-green-700 dark:text-green-400' : score >= 2.5 ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'

                const contributingItems = (property.cercanias || [])
                  .map(key => cercaniasOptions.find(x => x.key === key))
                  .filter(Boolean)
                  .map(c => c.label.toLowerCase())

                return (
                  <div className="mt-6 mb-6">
                    <h3 className="font-display font-semibold text-gray-800 dark:text-gray-100 text-lg mb-3">Score de conectividad</h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`font-display font-bold text-2xl ${textColor}`}>{score}</span>
                        <span className="text-sm text-gray-400">/5</span>
                        <div className={`flex-1 h-3 rounded-full ${barBg} overflow-hidden`}>
                          <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${(score / 5) * 100}%` }} />
                        </div>
                      </div>
                      {contributingItems.length > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cerca de {contributingItems.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Mapa de ubicación */}
              {(property.lat && property.lng) ? (
                <PropertyMap
                  lat={property.lat}
                  lng={property.lng}
                  comuna={property.comuna}
                  address={property.direccion}
                />
              ) : (property.google_maps_link || property.direccion) && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                  <h3 className="font-display font-semibold text-lg text-gray-800 dark:text-gray-100 mb-3">Ubicación</h3>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm" style={{ height: 350 }}>
                    <iframe
                      title="Ubicación de la propiedad"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.direccion + ', ' + property.comuna + ', Chile')}&z=17&output=embed`}
                      style={{ width: '100%', height: '100%', border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {property.google_maps_link ? (
                      <a href={property.google_maps_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                        <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        Ver en Google Maps
                      </a>
                    ) : (
                      <a href={`https://www.google.com/maps?q=${encodeURIComponent(property.direccion + ', ' + property.comuna + ', Chile')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                        <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        Ver en Google Maps
                      </a>
                    )}
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.direccion + ', ' + property.comuna + ', Chile')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-sm font-medium text-white transition-colors shadow-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                      Cómo llegar
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Valoraciones */}
            <ReviewSection userId={property.user_id} propertyId={property.id} currentUser={user} />

            {/* Propiedades similares */}
            {similarProperties.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900 dark:text-gray-100 mb-4">Propiedades similares</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {similarProperties.map(sp => (
                    <PropertyCard key={sp.id} property={sp} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Arriendo mensual</span>
                <div className="mt-1 mb-1">
                  <span className="font-display font-extrabold text-3xl text-gray-900 dark:text-gray-100">{formatPrice(property.precio)}</span>
                  <span className="text-gray-400 text-sm">/mes</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatUf(property.precio)} UF/mes</p>
                {property.gastoComun > 0 && <p className="text-xs text-gray-400">+ Gasto común: {formatPrice(property.gastoComun)}</p>}

                {ownerVerification && (
                  <div className="mt-3">
                    <VerificationBadge estado={ownerVerification.estado} size="md" />
                  </div>
                )}

                {/* Calculadora costo total */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 my-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Costo total estimado</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between"><span>Arriendo</span><span>{formatPrice(property.precio)}</span></div>
                    {property.gastoComun > 0 && <div className="flex justify-between"><span>Gastos comunes</span><span>{formatPrice(property.gastoComun)}</span></div>}
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-gray-800 text-sm">
                      <span>Total mensual</span>
                      <span>{formatPrice(property.precio + (property.gastoComun || 0))}</span>
                    </div>
                  </div>
                </div>

                {/* Boton favorito */}
                {user && !isOwner && (
                  <button onClick={toggleFav} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all mb-2 ${fav ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                    <svg className={`w-4 h-4 transition-transform ${fav ? 'heart-pop' : ''}`} fill={fav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {fav ? 'Guardado en favoritos' : 'Guardar en favoritos'}
                  </button>
                )}

                {/* Perfil arrendatario */}
                {user && !isOwner && hasTenantProfile && (
                  <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl p-3 my-3 space-y-2">
                    <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">Tu perfil de arrendatario</p>
                    <div className="flex gap-2">
                      <Link
                        to={`/perfil/${user.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white dark:bg-gray-800 border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-400 rounded-lg text-xs font-medium hover:bg-brand-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Ver mi perfil
                      </Link>
                      <button
                        onClick={handleCopyProfile}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors"
                      >
                        {profileCopied ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Copiado
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Compartir con dueño
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {user && !isOwner && !hasTenantProfile && (
                  <Link
                    to="/perfil-arrendatario"
                    className="block text-center text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium my-2"
                  >
                    Completa tu perfil de arrendatario para compartirlo con los dueños
                  </Link>
                )}

                <div className="space-y-3">
                  {/* Verification gate */}
                  {user && !isOwner && !userVerified && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-2">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Verifica tu identidad</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">Para contactar al propietario necesitas verificar tu identidad con tu RUT y carnet.</p>
                      <Link to="/verificacion" className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                        Verificar ahora
                      </Link>
                    </div>
                  )}
                  {(!user || isOwner || userVerified) && whatsappUrl ? (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => {
                      // Notificar al dueño (fire and forget)
                      fetch('/api/send-notification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          type: 'new-contact',
                          userId: property.user_id,
                          data: {
                            propertyTitle: property.titulo,
                            contactName: user?.user_metadata?.name || user?.email || 'Visitante',
                            contactPhone: phone || 'No proporcionado',
                          }
                        })
                      }).catch(() => {})
                    }} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all btn-glow" style={{ '--tw-shadow-color': 'rgba(22, 163, 74, 0.4)' }}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      Contactar por WhatsApp
                    </a>
                  ) : (
                    <div className="w-full text-center px-6 py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl text-sm">Teléfono no disponible</div>
                  )}
                  {property.email && (!user || isOwner || userVerified) && (
                    <a href={`mailto:${property.email}`} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all text-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Contactar por email
                    </a>
                  )}
                  <button onClick={() => onContractClick(property)} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all btn-glow">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Generar contrato
                  </button>
                </div>
              </div>

              {/* Compartir */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Compartir</p>
                <div className="flex gap-2">
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Mira este arriendo: ${property.titulo} en ${property.comuna} por ${formatPrice(property.precio)}/mes - https://rentu-cl.vercel.app/propiedad/${property.id}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.624-1.475A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.171 0-4.178-.7-5.813-1.888l-.417-.311-2.743.876.876-2.688-.342-.433A9.712 9.712 0 012.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75z"/></svg>
                    WhatsApp
                  </a>
                  <button onClick={() => { navigator.clipboard.writeText(`https://rentu-cl.vercel.app/propiedad/${property.id}`); showToast('Link copiado!', 'success') }} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copiar link
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-center shadow-sm space-y-1">
                <p className="text-xs text-gray-400 dark:text-gray-500">Publicado el {new Date(property.fechaPublicacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {ownerLastActive && (
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">Propietario activo {formatRelativeTime(ownerLastActive)}</p>
                )}
              </div>

              {isOwner && (
                <Link to={`/editar/${property.id}`} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 font-semibold rounded-xl transition-all text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Editar propiedad
                </Link>
              )}

              {isOwner && (
                <button onClick={() => setShowDeleteConfirm(true)} disabled={deleting} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold rounded-xl transition-all text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  {deleting ? 'Eliminando...' : 'Eliminar propiedad'}
                </button>
              )}

              {/* Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-[10px] text-amber-700/70 dark:text-amber-400/70 leading-relaxed">
                  Rentu es una plataforma de publicación de arriendos. No somos parte del contrato ni verificamos la identidad de los usuarios. Los contratos generados son plantillas referenciales basadas en la Ley N° 18.101. Recomendamos consultar con un abogado antes de firmar. Rentu no se responsabiliza por las transacciones entre las partes.
                </p>
              </div>

              {/* Reportar publicacion */}
              <div className="relative">
                <button
                  onClick={() => setShowReportMenu(!showReportMenu)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 rounded-xl text-xs font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                  Reportar publicacion
                </button>
                {showReportMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                    <p className="px-4 pt-3 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Motivo del reporte</p>
                    {[
                      'Informacion falsa o enganosa',
                      'Fotos no corresponden',
                      'Precio sospechoso',
                      'Posible estafa',
                      'Otro'
                    ].map(reason => (
                      <button
                        key={reason}
                        onClick={() => handleReport(reason)}
                        disabled={reportSubmitting}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        {reason}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowReportMenu(false)}
                      className="w-full text-center px-4 py-2 text-xs text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast}
      {lightboxOpen && property.fotos.length > 0 && (
        <Lightbox
          photos={property.fotos}
          initialIndex={activePhoto}
          onClose={() => setLightboxOpen(false)}
        />
      )}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Eliminar propiedad"
        message="¿Estás seguro de eliminar esta propiedad? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}
