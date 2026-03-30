import { useState } from 'react'

export default function AIDescriptionGenerator({ form, onUseDescription }) {
  const [loading, setLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState('')
  const [error, setError] = useState('')

  const hasEnoughData = form.tipo && form.comuna

  const generateDescription = async () => {
    setLoading(true)
    setError('')
    setGeneratedText('')

    try {
      const payload = {
        tipo: form.tipo,
        comuna: form.comuna,
        habitaciones: form.habitaciones,
        banos: form.banos,
        m2: form.m2,
        estacionamiento: form.estacionamiento,
        mascotas: form.mascotas,
        amoblado: form.amoblado,
        amenities: form.amenities,
        cercanias: form.cercanias,
        estado: form.estado,
        piso: form.piso,
      }

      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Error al generar la descripción')
      }

      const data = await res.json()
      setGeneratedText(data.description)
    } catch (err) {
      setError('No se pudo generar la descripción. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleUse = () => {
    onUseDescription(generatedText)
    setGeneratedText('')
  }

  return (
    <div className="mt-2">
      {/* Generate button */}
      {!generatedText && !loading && (
        <button
          type="button"
          disabled={!hasEnoughData}
          onClick={generateDescription}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-200
            ${hasEnoughData
              ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:border-brand-300 dark:hover:border-brand-700'
              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
          title={hasEnoughData ? 'Generar descripcion con IA' : 'Completa al menos el tipo y la comuna para generar'}
        >
          {/* Sparkle icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
          </svg>
          Generar descripcion con IA
        </button>
      )}

      {/* Loading state with shimmer */}
      {loading && (
        <div className="mt-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
            </svg>
            <span className="text-sm font-medium text-brand-700 dark:text-brand-300">Generando descripcion...</span>
          </div>
          <div className="space-y-2.5">
            <div className="h-3.5 bg-brand-200/60 dark:bg-brand-800/40 rounded-lg w-full relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" />
            </div>
            <div className="h-3.5 bg-brand-200/60 dark:bg-brand-800/40 rounded-lg w-11/12 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" style={{ animationDelay: '0.15s' }} />
            </div>
            <div className="h-3.5 bg-brand-200/60 dark:bg-brand-800/40 rounded-lg w-4/5 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" style={{ animationDelay: '0.3s' }} />
            </div>
            <div className="h-3.5 bg-brand-200/60 dark:bg-brand-800/40 rounded-lg w-3/4 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent" style={{ animationDelay: '0.45s' }} />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Generated text preview */}
      {generatedText && (
        <div className="mt-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-brand-50 dark:bg-brand-900/20 border-b border-brand-200 dark:border-brand-800">
            <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
            </svg>
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider">Descripcion generada</span>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{generatedText}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={handleUse}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Usar esta descripcion
            </button>
            <button
              type="button"
              onClick={generateDescription}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
            >
              Regenerar
            </button>
            <button
              type="button"
              onClick={() => setGeneratedText('')}
              className="px-4 py-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm transition-colors ml-auto"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {!hasEnoughData && !loading && !generatedText && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Completa el tipo de propiedad y la comuna en el paso anterior para habilitar la generacion con IA.</p>
      )}
    </div>
  )
}
