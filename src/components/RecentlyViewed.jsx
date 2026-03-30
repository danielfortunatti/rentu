import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../data/properties'

const STORAGE_KEY = 'rentu_recently_viewed'

export default function RecentlyViewed() {
  const [items, setItems] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed.slice(0, 8))
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-10 sm:py-14 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-5">
          <p className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-1">Historial</p>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-gray-900 dark:text-gray-100">Vistos recientemente</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/propiedad/${item.id}`}
              className="flex-shrink-0 w-48 sm:w-56 group"
            >
              <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10">
                {/* Photo */}
                <div className="aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.comuna}</p>
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1.5">
                    {formatPrice(item.precio)}<span className="text-xs font-normal text-gray-400">/mes</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
