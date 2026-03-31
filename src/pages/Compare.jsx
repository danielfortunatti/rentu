import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams, Link } from 'react-router-dom'
import { getProperty } from '../lib/supabase'
import { formatPrice } from '../data/properties'
import { amenitiesEdificio, cercaniasOptions } from '../data/comunas'

export default function Compare() {
  const [searchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const idsStr = searchParams.get('ids') || ''
      const ids = idsStr.split(',').filter(Boolean)
      if (ids.length < 2) { setLoading(false); return }

      const results = await Promise.all(
        ids.slice(0, 3).map(async (id) => {
          const { data } = await getProperty(isNaN(Number(id)) ? id : Number(id))
          if (data) {
            return {
              ...data,
              fotos: data.property_photos?.sort((a, b) => a.position - b.position).map(ph => ph.url) || [],
              gastoComun: data.gasto_comun,
            }
          }
          return null
        })
      )
      setProperties(results.filter(Boolean))
      setLoading(false)
    }
    load()
  }, [searchParams])

  const amobladoLabel = { amoblado: 'Amoblado', semi: 'Semi-amoblado', sin: 'Sin amoblar' }

  const rows = [
    { label: 'Precio', render: (p) => <span className="font-display font-bold text-lg text-brand-700 dark:text-brand-400">{formatPrice(p.precio)}/mes</span> },
    { label: 'Gasto común', render: (p) => p.gastoComun > 0 ? formatPrice(p.gastoComun) : 'No tiene' },
    { label: 'Costo total est.', render: (p) => <span className="font-semibold">{formatPrice(p.precio + (p.gastoComun || 0))}</span> },
    { label: 'Tipo', render: (p) => p.tipo },
    { label: 'Comuna', render: (p) => p.comuna },
    { label: 'Superficie', render: (p) => p.m2 ? `${p.m2} m²` : '—' },
    { label: 'Dormitorios', render: (p) => p.habitaciones },
    { label: 'Baños', render: (p) => p.banos },
    { label: 'Piso', render: (p) => p.piso || '—' },
    { label: 'Amoblado', render: (p) => amobladoLabel[p.amoblado] || 'No indica' },
    { label: 'Estado', render: (p) => p.estado || '—' },
    { label: 'Estacionamiento', render: (p) => p.estacionamiento ? <Check /> : <Cross /> },
    { label: 'Bodega', render: (p) => p.bodega ? <Check /> : <Cross /> },
    { label: 'Mascotas', render: (p) => p.mascotas ? <Check /> : <Cross /> },
    { label: 'Equipamiento', render: (p) => (
      <div className="flex flex-wrap gap-1">
        {(p.amenities || []).map(key => {
          const a = amenitiesEdificio.find(x => x.key === key)
          return a ? <span key={key} className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-[10px] rounded-md border border-brand-100 dark:border-brand-800">{a.label}</span> : null
        })}
        {(!p.amenities || p.amenities.length === 0) && <span className="text-gray-400">—</span>}
      </div>
    )},
    { label: 'Cerca de', render: (p) => (
      <div className="flex flex-wrap gap-1">
        {(p.cercanias || []).map(key => {
          const c = cercaniasOptions.find(x => x.key === key)
          return c ? <span key={key} className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] rounded-md border border-gray-100 dark:border-gray-600">{c.label}</span> : null
        })}
        {(!p.cercanias || p.cercanias.length === 0) && <span className="text-gray-400">—</span>}
      </div>
    )},
    { label: 'Precio/m²', render: (p) => p.m2 ? formatPrice(Math.round(p.precio / p.m2)) + '/m²' : '—' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (properties.length < 2) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl text-gray-800 dark:text-gray-100 mb-4">Selecciona al menos 2 propiedades para comparar</h2>
          <Link to="/buscar" className="text-brand-600 hover:text-brand-700 text-sm font-medium">Ir a buscar</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Comparar propiedades | Rentu</title>
        <meta name="description" content="Compara propiedades en arriendo lado a lado en Rentu." />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-600">Inicio</Link><span>/</span>
          <Link to="/buscar" className="hover:text-gray-600">Buscar</Link><span>/</span>
          <span className="text-gray-700 dark:text-gray-300">Comparar</span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 mb-8">Comparar propiedades</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header with photos and titles */}
            <thead>
              <tr>
                <th className="w-40 min-w-[140px]" />
                {properties.map(p => (
                  <th key={p.id} className="p-3 min-w-[200px]">
                    <Link to={`/propiedad/${p.id}`} className="block group">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
                        {p.fotos?.[0] ? (
                          <img src={p.fotos[0]} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
                          </div>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-sm text-gray-800 dark:text-gray-100 group-hover:text-brand-600 transition-colors line-clamp-2 text-left">{p.titulo}</h3>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{row.label}</td>
                  {properties.map(p => (
                    <td key={p.id} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex gap-3">
          {properties.map(p => (
            <Link
              key={p.id}
              to={`/propiedad/${p.id}`}
              className="flex-1 text-center px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Ver {p.titulo.length > 20 ? p.titulo.slice(0, 20) + '...' : p.titulo}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function Check() {
  return (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  )
}

function Cross() {
  return (
    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  )
}
