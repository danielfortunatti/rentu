import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const stepsArrendatario = [
  { step: 1, title: 'Busca tu arriendo', desc: 'Filtra por comuna, precio, dormitorios, mascotas y más. Encuentra exactamente lo que necesitas.', icon: '🔍' },
  { step: 2, title: 'Contacta al arrendador', desc: 'Envíale un mensaje directo por WhatsApp. Sin intermediarios, sin esperas.', icon: '💬' },
  { step: 3, title: 'Visita la propiedad', desc: 'Coordina una visita, revisa el estado del inmueble y haz todas las preguntas que necesites.', icon: '🏠' },
  { step: 4, title: 'Genera tu contrato', desc: 'Usa nuestro generador gratuito de contratos basado en la Ley 18.101. Descárgalo en PDF listo para firmar.', icon: '📄' },
  { step: 5, title: 'Mudanza lista', desc: 'Usa nuestro checklist de mudanza para no olvidar nada: servicios, llaves, inventario y más.', icon: '📦' },
]

const stepsArrendador = [
  { step: 1, title: 'Crea tu cuenta gratis', desc: 'Regístrate con email o Google en menos de 1 minuto.', icon: '👤' },
  { step: 2, title: 'Publica tu propiedad', desc: 'Sube fotos, agrega las características, precio y tu número de WhatsApp. Es 100% gratis.', icon: '📸' },
  { step: 3, title: 'Recibe interesados', desc: 'Los arrendatarios te contactan directo por WhatsApp. Tú decides con quién arrendar.', icon: '📱' },
  { step: 4, title: 'Destaca tu publicación', desc: '¿Quieres más visibilidad? Por solo $2.990/mes (IVA incluido) tu propiedad aparece primero en los resultados.', icon: '⭐' },
  { step: 5, title: 'Genera el contrato', desc: 'Cuando encuentres a tu arrendatario, genera el modelo de contrato directamente desde la plataforma.', icon: '✅' },
]

const ventajas = [
  { title: 'Sin comisiones', desc: 'No cobramos porcentaje del arriendo. Publicar es gratis.', icon: '💰' },
  { title: 'Sin intermediarios', desc: 'Contacto directo entre arrendador y arrendatario por WhatsApp.', icon: '🤝' },
  { title: 'Contrato de referencia gratis', desc: 'Genera un modelo de contrato de referencia basado en la Ley 18.101 en PDF.', icon: '📋' },
  { title: 'Filtros avanzados', desc: 'Busca por comuna, precio, mascotas, estacionamiento, equipamiento y más.', icon: '🎯' },
  { title: '100% online', desc: 'Publica, busca y genera contratos desde tu celular o computador.', icon: '🌐' },
  { title: 'Seguro y confiable', desc: 'Tips de seguridad, verificación de identidad y valoraciones mutuas.', icon: '🛡️' },
]

export default function ComoFunciona() {
  return (
    <div className="min-h-screen bg-warm-50 pt-20">
      <Helmet>
        <title>Cómo funciona Rentu | Arriendos sin comisiones</title>
        <meta name="description" content="Aprende cómo publicar y buscar arriendos en Rentu. Sin intermediarios, contacto directo." />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">Inicio</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300">Cómo funciona</span>
        </div>
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-gray-900 mb-3">Cómo funciona Rentu</h1>
          <p className="text-gray-500 text-lg">Una forma simple de arrendar en Chile</p>
        </div>

        {/* Para arrendatarios */}
        <div className="mb-16">
          <h2 className="font-display font-bold text-xl text-gray-800 mb-6 text-center">Si buscas arriendo</h2>
          <div className="space-y-4">
            {stepsArrendatario.map(s => (
              <div key={s.step} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="w-10 h-10 bg-brand-50 border border-brand-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-brand-600 text-sm">{s.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-gray-800 mb-1">{s.icon} {s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/buscar" className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Buscar arriendos</Link>
          </div>
        </div>

        {/* Para arrendadores */}
        <div className="mb-16">
          <h2 className="font-display font-bold text-xl text-gray-800 mb-6 text-center">Si quieres publicar tu propiedad</h2>
          <div className="space-y-4">
            {stepsArrendador.map(s => (
              <div key={s.step} className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="w-10 h-10 bg-warm-100 border border-warm-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-warm-700 text-sm">{s.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-gray-800 mb-1">{s.icon} {s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/publicar" className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Publicar gratis</Link>
          </div>
        </div>

        {/* Ventajas */}
        <div>
          <h2 className="font-display font-bold text-xl text-gray-800 mb-6 text-center">Por qué elegir Rentu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ventajas.map((v, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm text-center">
                <span className="text-3xl mb-3 block">{v.icon}</span>
                <h3 className="font-display font-semibold text-gray-800 mb-1">{v.title}</h3>
                <p className="text-xs text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
