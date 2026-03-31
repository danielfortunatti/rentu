import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const tips = [
  {
    title: 'Nunca pagues sin visitar la propiedad',
    desc: 'Siempre visita el inmueble en persona antes de hacer cualquier pago. Si el arrendador no te deja visitarla o te presiona para pagar rápido, es una señal de alerta.',
    icon: '🏠',
  },
  {
    title: 'Verifica la identidad del arrendador',
    desc: 'Pide el RUT del arrendador y verifícalo. Puedes buscar en el SII (sii.cl) si la persona tiene inicio de actividades. También puedes pedir un certificado de dominio vigente del Conservador de Bienes Raíces para confirmar que es el dueño.',
    icon: '🪪',
  },
  {
    title: 'Firma siempre un contrato escrito',
    desc: 'Aunque un contrato verbal es legal en Chile, un contrato escrito te protege ante cualquier problema. Rentu te permite generar un contrato basado en la Ley 18.101 de forma gratuita.',
    icon: '📄',
  },
  {
    title: 'Haz un inventario fotográfico',
    desc: 'Antes de mudarte, fotografía el estado de cada habitación, muros, pisos, artefactos y muebles. Esto te protege al momento de devolver la propiedad para que no te descuenten de la garantía por daños preexistentes.',
    icon: '📸',
  },
  {
    title: 'Pide recibo de todos los pagos',
    desc: 'Cada vez que pagues arriendo, garantía o cualquier monto, exige un recibo firmado o comprobante de transferencia. Guárdalo por al menos 3 años.',
    icon: '🧾',
  },
  {
    title: 'Lee el contrato completo antes de firmar',
    desc: 'No firmes nada sin leer. Presta atención a: monto de la renta, plazo, condiciones de término anticipado, multas por atraso, y qué incluye (estacionamiento, bodega, gastos comunes).',
    icon: '📖',
  },
  {
    title: 'Desconfía de precios demasiado bajos',
    desc: 'Si un arriendo está muy por debajo del precio de mercado para esa comuna, probablemente es una estafa. Compara precios en Rentu para tener una referencia real.',
    icon: '⚠️',
  },
  {
    title: 'No envíes dinero al extranjero',
    desc: 'Si el supuesto arrendador dice estar fuera del país y te pide transferencias internacionales, es casi seguro una estafa. Los arrendadores reales están disponibles para mostrar la propiedad.',
    icon: '🚫',
  },
  {
    title: 'Revisa los gastos comunes',
    desc: 'Pregunta cuánto son los gastos comunes y qué incluyen. Pide ver las últimas 3 boletas. Los gastos comunes pueden variar mucho y afectar tu presupuesto real.',
    icon: '💰',
  },
  {
    title: 'Conoce tus derechos como arrendatario',
    desc: 'La Ley 18.101 te protege. El arrendador no puede subir la renta antes de lo acordado, no puede entrar a tu propiedad sin aviso, y debe devolverte la garantía si entregas el inmueble en buen estado.',
    icon: '⚖️',
  },
  {
    title: 'Transfiere los servicios a tu nombre',
    desc: 'Al mudarte, transfiere luz, agua, gas e internet a tu nombre. Así evitas que te cobren consumos que no son tuyos y te aseguras de que los servicios no se corten.',
    icon: '💡',
  },
  {
    title: 'Guarda copia de todo',
    desc: 'Contrato firmado, recibos de pago, fotos del inventario, correos con el arrendador. Todo puede servir como evidencia si hay un problema legal.',
    icon: '📁',
  },
]

export default function TipsSeguridad() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Tips de seguridad para arrendar | Rentu</title>
        <meta name="description" content="Consejos de seguridad para arrendar en Chile. Verifica propiedades, contratos y evita estafas." />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">Inicio</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300">Tips de seguridad</span>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">Tips de seguridad para arrendar</h1>
        <p className="text-gray-500 text-sm mb-8">Guía para arrendar de forma segura en Chile y evitar estafas.</p>

        <div className="space-y-4">
          {tips.map((tip, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                <div>
                  <h3 className="font-display font-semibold text-gray-800 mb-1">{tip.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-brand-50 border border-brand-200 rounded-2xl p-6 text-center">
          <h3 className="font-display font-bold text-brand-800 text-lg mb-2">Arrienda con confianza</h3>
          <p className="text-sm text-brand-700/70 mb-4">Rentu te permite generar modelos de contrato gratuitos, contactar directamente a los arrendadores y verificar toda la información antes de comprometerte.</p>
          <Link to="/buscar" className="inline-block px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Buscar arriendos seguros</Link>
        </div>
      </div>
    </div>
  )
}
