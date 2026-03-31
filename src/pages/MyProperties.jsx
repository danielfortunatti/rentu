import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { getMyProperties, deleteProperty } from '../lib/supabase'
import { formatPrice } from '../data/properties'
import ConfirmModal from '../components/ConfirmModal'

export default function MyProperties({ user }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [highlighting, setHighlighting] = useState(null)

  const handleDestacar = async (property) => {
    setHighlighting(property.id)
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id, userId: user.id, type: 'destacar', email: user.email }),
      })
      const data = await res.json()
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      }
    } catch (err) {
      console.error('Error al crear pago:', err)
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
      setLoading(false)
    }
    load()
  }, [user.id])

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
                    <img src={p.fotos[0]} alt={p.titulo} className="w-full h-full object-cover" />
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
                      {p.destacada && <span className="px-2 py-0.5 bg-warm-100 text-warm-700 text-[10px] font-bold rounded">Destacada</span>}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${p.activa ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.activa ? 'Activa' : 'Inactiva'}</span>
                    </div>
                  </div>
                  <p className="font-display font-bold text-lg text-gray-900 dark:text-gray-100 mt-1">{formatPrice(p.precio)}<span className="text-gray-400 dark:text-gray-500 text-sm font-normal">/mes</span></p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{p.habitaciones} dorm · {p.banos} baño{p.banos > 1 ? 's' : ''} · {p.m2 || '—'} m²</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Link to={`/editar/${p.id}`} className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-xs font-medium rounded-lg">Editar</Link>
                    <Link to={`/propiedad/${p.id}`} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg">Ver</Link>
                    {p.destacada ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        Destacada
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDestacar(p)}
                        disabled={highlighting === p.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        {highlighting === p.id ? 'Procesando...' : 'Destacar'}
                      </button>
                    )}
                    <button onClick={() => setDeleteTarget(p.id)} disabled={deleting === p.id} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg disabled:opacity-50">
                      {deleting === p.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
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
