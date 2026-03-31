import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default function PagoExitoso() {
  return (
    <div className="min-h-screen bg-warm-50 pt-20 flex items-center justify-center">
      <Helmet>
        <title>Pago exitoso | Rentu</title>
      </Helmet>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-3">Pago exitoso</h1>
        <p className="text-gray-500 text-sm mb-6">Tu propiedad ha sido destacada y aparecerá primero en los resultados de búsqueda. Gracias por confiar en Rentu.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/mis-propiedades" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Ver mis propiedades</Link>
          <Link to="/buscar" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Buscar arriendos</Link>
        </div>
      </div>
    </div>
  )
}
