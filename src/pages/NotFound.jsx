import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
      <Helmet>
        <title>Página no encontrada | Rentu</title>
      </Helmet>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="font-display font-extrabold text-4xl text-gray-300 dark:text-gray-600">404</span>
        </div>
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100 mb-3">Página no encontrada</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">La página que buscas no existe o fue movida.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-brand-500/20">Ir al inicio</Link>
          <Link to="/buscar" className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm">Buscar arriendos</Link>
        </div>
      </div>
    </div>
  )
}
