import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { getMyProperties, deleteProperty, supabase } from '../lib/supabase'
import { formatPrice } from '../data/properties'
import ConfirmModal from '../components/ConfirmModal'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMins < 1) return 'hace un momento'
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`
  if (diffDays < 7) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`
  if (diffWeeks < 5) return `hace ${diffWeeks} semana${diffWeeks !== 1 ? 's' : ''}`
  return `hace ${diffMonths} mes${diffMonths !== 1 ? 'es' : ''}`
}

export default function MyProperties({ user }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [highlighting, setHighlighting] = useState(null)
  const [destacarMenu, setDestacarMenu] = useState(null)
  const [stats, setStats] = useState({ totalActive: 0, totalViews: 0, totalContacts: 0, totalFavs: 0 })
  const [perPropertyFavs, setPerPropertyFavs] = useState({})
  const [markingRented, setMarkingRented] = useState(null)
  const [rentedSuccess, setRentedSuccess] = useState(null)
  const destacarRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (destacarRef.current && !destacarRef.current.contains(e.target)) setDestacarMenu(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const destacarOptions = [
    { type: 'destacar_7', label: '7 días', price: '$2.990' },
    { type: 'destacar_30', label: '30 días', price: '$9.990' },
    { type: 'destacar_90', label: '90 días', price: '$19.990' },
  ]

  const handleDestacar = async (property, type) => {
    setHighlighting(property.id)
    setDestacarMenu(null)
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id, userId: user.id, type, email: user.email }),
      })
      const data = await res.json()
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      }
    } catch (err) {
      alert('Error al procesar el pago. Intenta de nuevo.')
    } finally {
      setHighlighting(null)
    }
  }

  useEffect(() => {
    async function load() {
      const { data } = await getMyProperties(user.id)
      const mapped = (data || []).map(p => ({
        ...p,
        fotos: p.property_photos?.sort((a, b) => (a.position || 0) - (b.position || 0)).map(ph => ph.url) || [],
      }))
      setProperties(mapped)

      // Fetch analytics
      const myIds = mapped.map(p => p.id)
      const activeCount = mapped.filter(p => p.activa).length

      let totalViews = 0
      let totalContacts = 0
      let totalFavs = 0
      const favsMap = {}

      if (myIds.length > 0) {
        // Total favorites across all properties
        try {
          const { count } = await supabase
            .from('favorites')
            .select('*', { count: 'exact', head: true })
            .in('property_id', myIds)
          totalFavs = count || 0
        } catch { totalFavs = 0 }

        // Per-property favorites
        try {
          const { data: favRows } = await supabase
            .from('favorites')
            .select('property_id')
            .in('property_id', myIds)
          if (favRows) {
            for (const row of favRows) {
              favsMap[row.property_id] = (favsMap[row.property_id] || 0) + 1
            }
          }
        } catch { /* ignore */ }

        // Views (placeholder if table doesn't exist)
        try {
          const { count } = await supabase
            .from('property_views')
            .select('*', { count: 'exact', head: true })
            .in('property_id', myIds)
          totalViews = count || 0
        } catch { totalViews = 0 }

        // Contacts (placeholder if table doesn't exist)
        try {
          const { count } = await supabase
            .from('property_contacts')
            .select('*', { count: 'exact', head: true })
            .in('property_id', myIds)
          totalContacts = count || 0
        } catch { totalContacts = 0 }
      }

      setStats({ totalActive: activeCount, totalViews, totalContacts, totalFavs })
      setPerPropertyFavs(favsMap)
      setLoading(false)
    }
    load()
  }, [user.id])

  const handleMarkRented = async (id) => {
    setMarkingRented(id)
    try {
      const { error } = await supabase
        .from('properties')
        .update({ activa: false, estado_arriendo: 'arrendada' })
        .eq('id', id)
      if (!error) {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, activa: false, estado_arriendo: 'arrendada' } : p))
        setRentedSuccess(id)
        setTimeout(() => setRentedSuccess(null), 3000)
      }
    } catch {
      alert('Error al actualizar el estado. Intenta de nuevo.')
    } finally {
      setMarkingRented(null)
    }
  }

  const handleReactivate = async (id) => {
    setMarkingRented(id)
    try {
      const { error } = await supabase
        .from('properties')
        .update({ activa: true, estado_arriendo: null })
        .eq('id', id)
      if (!error) {
        setProperties(prev => prev.map(p => p.id === id ? { ...p, activa: true, estado_arriendo: null } : p))
        setRentedSuccess(id)
        setTimeout(() => setRentedSuccess(null), 3000)
      }
    } catch {
      alert('Error al reactivar la propiedad. Intenta de nuevo.')
    } finally {
      setMarkingRented(null)
    }
  }

  const handleDelete = async (id) => {
    setDeleteTarget(null)
    setDeleting(id)
    const { error } = await deleteProperty(id)
    if (!error) {
      setProperties(prev => prev.filter(p => p.id !== id))
    }
    setDeleting(null)
  }

  if (loading) return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Mis propiedades | Rentu</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100">Mis propiedades</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{properties.length} propiedad{properties.length !== 1 ? 'es' : ''} publicada{properties.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/publicar" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm">Publicar nueva</Link>
        </div>

        {/* Analytics Dashboard */}
        {properties.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {/* Active Properties */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 sm:p-5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <p className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100">{stats.totalActive}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Propiedades activas</p>
            </div>
            {/* Views */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 sm:p-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100">{stats.totalViews}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Visitas totales</p>
            </div>
            {/* Contacts */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 sm:p-5">
              <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <p className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100">{stats.totalContacts}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Contactos WhatsApp</p>
            </div>
            {/* Favorites */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 sm:p-5">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <p className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100">{stats.totalFavs}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Favoritos recibidos</p>
            </div>
          </div>
        )}

        {properties.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>
            <h3 className="font-display font-semibold text-lg text-gray-600 dark:text-gray-300 mb-2">No tienes propiedades publicadas</h3>
            <p className="text-sm text-gray-400 mb-4">Publica tu primera propiedad gratis y llega a miles de personas.</p>
            <Link to="/publicar" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Publicar propiedad</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {p.fotos.length > 0 ? (
                    <img src={p.fotos[0]} alt={p.titulo} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/propiedad/${p.id}`} className="font-display font-semibold text-gray-800 dark:text-gray-100 hover:text-brand-600 transition-colors line-clamp-1">{p.titulo}</Link>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.comuna} · {p.tipo}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {(() => {
                        if (p.created_at && p.activa && p.estado_arriendo !== 'arrendada') {
                          const daysSince = Math.floor((new Date() - new Date(p.created_at)) / (1000 * 60 * 60 * 24))
                          const daysRemaining = 90 - daysSince
                          if (daysSince >= 75 && daysRemaining > 0) {
                            return <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded">Expira en {daysRemaining} día{daysRemaining !== 1 ? 's' : ''}</span>
                          }
                        }
                        return null
                      })()}
                      {p.destacada && <span className="px-2 py-0.5 bg-warm-100 text-warm-700 text-[10px] font-bold rounded">Destacada</span>}
                      {p.estado_arriendo === 'arrendada' ? (
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded">Arrendada</span>
                      ) : (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${p.activa ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.activa ? 'Activa' : 'Inactiva'}</span>
                      )}
                    </div>
                  </div>
                  <p className="font-display font-bold text-lg text-gray-900 dark:text-gray-100 mt-1">{formatPrice(p.precio)}<span className="text-gray-400 dark:text-gray-500 text-sm font-normal">/mes</span></p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{p.habitaciones} dorm · {p.banos} baño{p.banos > 1 ? 's' : ''} · {p.m2 || '—'} m²</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                      {perPropertyFavs[p.id] || 0} favorito{(perPropertyFavs[p.id] || 0) !== 1 ? 's' : ''}
                    </span>
                    {p.created_at && (
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Publicada {timeAgo(p.created_at)}
                      </span>
                    )}
                  </div>
                  {rentedSuccess === p.id && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2">Estado actualizado correctamente</p>
                  )}
                  {p.estado_arriendo === 'arrendada' ? (
                    <div className="flex items-center gap-2 mt-3">
                      <Link to={`/propiedad/${p.id}`} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg">Ver</Link>
                      <button
                        onClick={() => handleReactivate(p.id)}
                        disabled={markingRented === p.id}
                        className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                      >
                        {markingRented === p.id ? 'Procesando...' : 'Reactivar'}
                      </button>
                      <button onClick={() => setDeleteTarget(p.id)} disabled={deleting === p.id} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg disabled:opacity-50">
                        {deleting === p.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Link to={`/editar/${p.id}`} className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-xs font-medium rounded-lg">Editar</Link>
                      <Link to={`/propiedad/${p.id}`} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg">Ver</Link>
                      {p.activa && (
                        <button
                          onClick={() => handleMarkRented(p.id)}
                          disabled={markingRented === p.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {markingRented === p.id ? 'Procesando...' : 'Marcar como arrendada'}
                        </button>
                      )}
                      {p.destacada ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          Destacada
                        </span>
                      ) : (
                        <div className="relative" ref={destacarRef}>
                          <button
                            onClick={() => setDestacarMenu(destacarMenu === p.id ? null : p.id)}
                            disabled={highlighting === p.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            {highlighting === p.id ? 'Procesando...' : 'Destacar'}
                            <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {destacarMenu === p.id && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
                              {destacarOptions.map(opt => (
                                <button
                                  key={opt.type}
                                  onClick={() => handleDestacar(p, opt.type)}
                                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-between"
                                >
                                  <span>{opt.label}</span>
                                  <span className="font-semibold text-amber-700 dark:text-amber-400">{opt.price}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <button onClick={() => setDeleteTarget(p.id)} disabled={deleting === p.id} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg disabled:opacity-50">
                        {deleting === p.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar propiedad"
        message="¿Estás seguro de eliminar esta propiedad? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
