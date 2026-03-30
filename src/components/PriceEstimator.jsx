import { useState } from 'react'
import { comunas, tiposPropiedad } from '../data/comunas'
import { formatPrice } from '../data/properties'

// Average rent estimates per comuna (CLP/month base for a standard 2-bedroom apartment)
const comunaBasePrice = {
  'Providencia': 650000, 'Las Condes': 850000, 'Ñuñoa': 550000, 'Santiago Centro': 420000,
  'Vitacura': 1100000, 'La Reina': 700000, 'Macul': 400000, 'San Miguel': 430000,
  'La Florida': 380000, 'Peñalolén': 400000, 'Maipú': 350000, 'Puente Alto': 300000,
  'Lo Barnechea': 950000, 'Huechuraba': 420000, 'Recoleta': 350000,
  'Independencia': 370000, 'Estación Central': 360000, 'Viña del Mar': 500000,
  'Valparaíso': 400000, 'Concón': 550000, 'Concepción': 350000, 'Temuco': 320000,
  'La Serena': 380000, 'Antofagasta': 500000, 'Puerto Montt': 350000,
}

const tipoMultiplier = {
  'Departamento': 1, 'Casa': 1.3, 'Estudio': 0.65, 'Oficina': 1.1, 'Local comercial': 1.4, 'Bodega': 0.5,
}

function estimatePrice(comuna, tipo, habitaciones, m2) {
  const base = comunaBasePrice[comuna] || 450000
  const tipoMult = tipoMultiplier[tipo] || 1
  const habMult = habitaciones <= 1 ? 0.7 : habitaciones === 2 ? 1 : habitaciones === 3 ? 1.25 : 1.5
  const m2Mult = m2 <= 30 ? 0.6 : m2 <= 50 ? 0.85 : m2 <= 70 ? 1 : m2 <= 100 ? 1.2 : 1.45

  const estimate = Math.round(base * tipoMult * habMult * m2Mult)
  const low = Math.round(estimate * 0.85)
  const high = Math.round(estimate * 1.15)
  return { estimate, low, high }
}

export default function PriceEstimator({ onClose }) {
  const [comuna, setComuna] = useState('')
  const [tipo, setTipo] = useState('Departamento')
  const [habitaciones, setHabitaciones] = useState(2)
  const [m2, setM2] = useState(60)
  const [result, setResult] = useState(null)

  const handleEstimate = () => {
    if (!comuna) return
    setResult(estimatePrice(comuna, tipo, habitaciones, m2))
  }

  const selectClass = "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 appearance-none cursor-pointer"

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6 animate-fadeIn" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Estimador de precio de arriendo">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100">Estimador de precio</h3>
            <p className="text-xs text-gray-400 mt-0.5">¿Cuánto podría rentar tu propiedad?</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Comuna</label>
            <select value={comuna} onChange={e => setComuna(e.target.value)} className={selectClass} aria-label="Seleccionar comuna">
              <option value="">Selecciona una comuna</option>
              {comunas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Tipo de propiedad</label>
            <select value={tipo} onChange={e => setTipo(e.target.value)} className={selectClass} aria-label="Tipo de propiedad">
              {tiposPropiedad.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Dormitorios</label>
              <select value={habitaciones} onChange={e => setHabitaciones(Number(e.target.value))} className={selectClass} aria-label="Dormitorios">
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Superficie (m²)</label>
              <input
                type="number"
                value={m2}
                onChange={e => setM2(Number(e.target.value))}
                min={10}
                max={500}
                className={selectClass}
                aria-label="Superficie en metros cuadrados"
              />
            </div>
          </div>

          <button
            onClick={handleEstimate}
            disabled={!comuna}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-glow text-sm"
          >
            Estimar precio
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl text-center">
            <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase tracking-wider mb-2">Estimación de arriendo mensual</p>
            <p className="font-display font-extrabold text-3xl text-brand-700 dark:text-brand-300">{formatPrice(result.estimate)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rango: {formatPrice(result.low)} — {formatPrice(result.high)}
            </p>
            <div className="mt-3 w-full bg-brand-100 dark:bg-brand-900/40 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full" style={{ width: '65%' }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-3">
              Estimación basada en datos del mercado. Los precios reales pueden variar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
