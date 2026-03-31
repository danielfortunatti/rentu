import { Link } from 'react-router-dom'
import { formatPrice } from '../data/properties'

export default function CompareDrawer({ properties, onRemove, onClear }) {
  if (properties.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/20 animate-slideUp">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Comparar ({properties.length}/3)
            </span>
            <button
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto">
            {properties.map(p => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg flex-shrink-0">
                {p.fotos?.[0] && (
                  <img src={p.fotos[0]} alt="" className="w-8 h-8 rounded object-cover" loading="lazy" />
                )}
                <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[120px] truncate">{p.titulo}</span>
                <button
                  onClick={() => onRemove(p.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Quitar ${p.titulo} de comparación`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>

          <Link
            to={`/comparar?ids=${properties.map(p => p.id).join(',')}`}
            className={`px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0 ${properties.length < 2 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Comparar
          </Link>
        </div>
      </div>
    </div>
  )
}
