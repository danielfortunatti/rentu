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
    <div className="min-h-screen bg-warm-50 pt-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-warm-50 pt-20">
      <Helmet>
        <title>Mis propiedades | Rentu</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Mis propiedades</h1>
            <p className="text-gray-500 text-sm mt-1">{properties.length} propiedad{properties.length !== 1 ? 'es' : ''} publicada{properties.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/publicar" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm">Publicar nueva</Link>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>
            <h3 className="font-display font-semibold text-lg text-gray-600 mb-2">No tienes propiedades publicadas</h3>
            <p className="text-sm text-gray-400 mb-4">Publica tu primera propiedad gratis y llega a miles de personas.</p>
            <Link to="/publicar" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Publicar propiedad</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map(p => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
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
                      <Link to={`/propiedad/${p.id}`} className="font-display font-semibold text-gray-800 hover:text-brand-600 transition-colors line-clamp-1">{p.titulo}</Link>
                      <p className="text-xs text-gray-400 mt-0.5">{p.comuna} · {p.tipo}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {p.destacada && <span className="px-2 py-0.5 bg-warm-100 text-warm-700 text-[10px] font-bold rounded">Destacada</span>}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${p.activa ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.activa ? 'Activa' : 'Inactiva'}</span>
                    </div>
                  </div>
                  <p className="font-display font-bold text-lg text-gray-900 mt-1">{formatPrice(p.precio)}<span className="text-gray-400 text-sm font-normal">/mes</span></p>
                  <p className="text-xs text-gray-400 mt-1">{p.habitaciones} dorm · {p.banos} baño{p.banos > 1 ? 's' : ''} · {p.m2 || '—'} m²</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Link to={`/editar/${p.id}`} className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 text-xs font-medium rounded-lg">Editar</Link>
                    <Link to={`/propiedad/${p.id}`} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg">Ver</Link>
                    <button onClick={() => setDeleteTarget(p.id)} disabled={deleting === p.id} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-medium rounded-lg disabled:opacity-50">
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
