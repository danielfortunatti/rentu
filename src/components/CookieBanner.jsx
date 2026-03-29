import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookies-accepted')
    if (!accepted) setShow(true)
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookies-accepted', 'true')
    setShow(false)
  }

  const acceptEssential = () => {
    localStorage.setItem('cookies-accepted', 'essential')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] p-4" role="dialog" aria-label="Aviso de cookies">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-700 font-medium mb-1">Este sitio usa cookies</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Utilizamos cookies esenciales para el funcionamiento de Rentu (autenticación y sesión). No usamos cookies publicitarias. Al continuar navegando, aceptas nuestra <a href="/privacidad" className="text-brand-600 hover:underline">Política de Privacidad</a>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={acceptEssential} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl whitespace-nowrap transition-all">
            Solo esenciales
          </button>
          <button onClick={acceptAll} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl whitespace-nowrap shadow-md shadow-brand-500/20 transition-all">
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  )
}
