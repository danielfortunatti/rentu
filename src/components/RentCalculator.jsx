import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const formatCLP = (value) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value)

const MIN_INCOME = 200000
const MAX_INCOME = 5000000
const STEP = 50000

export default function RentCalculator() {
  const navigate = useNavigate()
  const [monthlyIncome, setMonthlyIncome] = useState(800000)

  const recommended = useMemo(() => Math.round(monthlyIncome * 0.3), [monthlyIncome])
  const comfortable = useMemo(() => Math.round(monthlyIncome * 0.25), [monthlyIncome])
  const percentage = useMemo(() => ((monthlyIncome - MIN_INCOME) / (MAX_INCOME - MIN_INCOME)) * 100, [monthlyIncome])

  const handleSliderChange = (e) => {
    setMonthlyIncome(Number(e.target.value))
  }

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    const value = Number(raw)
    if (value >= 0 && value <= 20000000) {
      setMonthlyIncome(value)
    }
  }

  const handleSearch = () => {
    navigate(`/buscar?precioMax=${recommended}`)
  }

  // Gauge segments: green (0-25%), yellow (25-30%), red (30%+)
  const gaugeSegments = [
    { label: 'Holgado', range: '< 25%', color: 'bg-green-500', darkColor: 'dark:bg-green-400', width: '41.67%' }, // 25/60 of gauge
    { label: 'Recomendado', range: '25-30%', color: 'bg-yellow-500', darkColor: 'dark:bg-yellow-400', width: '8.33%' }, // 5/60 of gauge
    { label: 'Excesivo', range: '> 30%', color: 'bg-red-500', darkColor: 'dark:bg-red-400', width: '50%' }, // 30/60 of gauge
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-10 shadow-sm">

        {/* Income input */}
        <div className="mb-8">
          <label htmlFor="rent-calc-income" className="block font-display font-semibold text-gray-900 dark:text-gray-100 text-base mb-4">
            ¿Cuánto ganas al mes? (ingreso líquido)
          </label>

          <div className="relative mb-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium pointer-events-none" aria-hidden="true">$</span>
            <input
              id="rent-calc-income"
              type="text"
              inputMode="numeric"
              value={monthlyIncome.toLocaleString('es-CL')}
              onChange={handleInputChange}
              className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 font-display font-bold text-xl text-center focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
              aria-label="Ingreso mensual en pesos chilenos"
            />
          </div>

          {/* Slider */}
          <div className="relative mt-4">
            <input
              type="range"
              min={MIN_INCOME}
              max={MAX_INCOME}
              step={STEP}
              value={Math.min(Math.max(monthlyIncome, MIN_INCOME), MAX_INCOME)}
              onChange={handleSliderChange}
              className="rent-calc-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-600"
              aria-label="Desliza para ajustar tu ingreso mensual"
              style={{
                background: `linear-gradient(to right, #049e8d ${percentage}%, #e5e7eb ${percentage}%)`,
              }}
            />
            <div className="flex justify-between mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
              <span>{formatCLP(MIN_INCOME)}</span>
              <span>{formatCLP(MAX_INCOME)}</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 sm:p-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4">Tu rango recomendado</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Ideal (25%)</p>
              <p className="font-display font-extrabold text-xl sm:text-2xl text-green-600 dark:text-green-400">{formatCLP(comfortable)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-yellow-100 dark:border-yellow-900/30">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Máximo (30%)</p>
              <p className="font-display font-extrabold text-xl sm:text-2xl text-yellow-600 dark:text-yellow-400">{formatCLP(recommended)}</p>
            </div>
          </div>

          {/* Visual gauge bar */}
          <div className="mb-3">
            <div className="flex rounded-full overflow-hidden h-3" role="img" aria-label={`Barra de asequibilidad: hasta ${formatCLP(comfortable)} es holgado, entre ${formatCLP(comfortable)} y ${formatCLP(recommended)} es recomendado, sobre ${formatCLP(recommended)} es excesivo`}>
              <div className="bg-green-500 dark:bg-green-400 transition-all duration-300" style={{ width: gaugeSegments[0].width }} />
              <div className="bg-yellow-500 dark:bg-yellow-400 transition-all duration-300" style={{ width: gaugeSegments[1].width }} />
              <div className="bg-red-500 dark:bg-red-400 transition-all duration-300" style={{ width: gaugeSegments[2].width }} />
            </div>
            <div className="flex justify-between mt-2">
              {gaugeSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${seg.color} ${seg.darkColor}`} aria-hidden="true" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">{seg.label} <span className="text-gray-300 dark:text-gray-600">({seg.range})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="flex gap-3 items-start bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/30 rounded-xl p-4 mb-6">
          <svg className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            La regla del 30% sugiere que tu arriendo no debería superar el 30% de tu ingreso mensual líquido. Esto te deja margen para gastos comunes, servicios básicos y ahorro.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleSearch}
          className="w-full bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-semibold rounded-xl px-6 py-4 text-sm transition-all btn-glow flex items-center justify-center gap-2 group"
          aria-label={`Buscar arriendos con precio máximo de ${formatCLP(recommended)}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Buscar en mi rango (hasta {formatCLP(recommended)})
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
