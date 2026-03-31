import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Particular',
    price: 'Gratis',
    priceDetail: 'Para siempre',
    desc: 'Ideal para dueños que arriendan su propiedad directamente.',
    features: [
      'Publicar propiedades gratis',
      'Hasta 10 fotos por propiedad',
      'Contacto directo por WhatsApp',
      'Contrato de referencia en PDF',
      'Perfil verificado con carnet',
    ],
    notIncluded: [
      'Propiedades destacadas',
      'Estadísticas de visitas',
      'Badge "Pro" en perfil',
    ],
    cta: 'Publicar gratis',
    ctaLink: '/publicar',
    popular: false,
    color: 'gray',
  },
  {
    name: 'Destacar',
    price: 'Desde $2.990',
    priceDetail: 'por propiedad',
    desc: 'Haz que tu propiedad aparezca primero y llegue a más personas.',
    tiers: [
      { label: '7 días', price: '$2.990' },
      { label: '30 días', price: '$9.990' },
      { label: '90 días', price: '$19.990' },
    ],
    features: [
      'Todo lo del plan Gratis',
      'Propiedad aparece primero en búsqueda',
      'Badge "Destacada" visible',
      'Alertas a arrendatarios que buscan algo similar',
      'Más visibilidad = arriendas más rápido',
    ],
    notIncluded: [],
    cta: 'Destacar propiedad',
    ctaLink: '/mis-propiedades',
    popular: true,
    color: 'brand',
  },
  {
    name: 'Corredor',
    price: '$5.990',
    priceDetail: 'por publicación',
    desc: 'Para corredores de propiedades y administradores de arriendos.',
    features: [
      'Publicar como corredor profesional',
      'Badge "Corredor verificado"',
      'Propiedad destacada incluida',
      'Hasta 20 fotos por propiedad',
      'Alertas de interesados por email',
      'Estadísticas de cada publicación',
    ],
    notIncluded: [],
    cta: 'Publicar como corredor',
    ctaLink: '/publicar',
    popular: false,
    color: 'indigo',
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Planes y Precios | Rentu</title>
        <meta name="description" content="Planes de publicación en Rentu. Publica gratis o destaca tu propiedad para arrendar más rápido." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-600 dark:hover:text-gray-300">Inicio</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300">Planes y precios</span>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 sm:py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-semibold tracking-wider uppercase mb-4">
            Planes
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-gray-100 mb-4">
            Publica gratis,{' '}
            <span className="text-gradient-animated">destaca si quieres más</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Publicar es siempre gratis para particulares. Los corredores pagan por publicación. IVA incluido en todos los precios.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20 sm:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl border ${
                  plan.popular
                    ? 'border-brand-300 dark:border-brand-600 shadow-xl shadow-brand-500/10'
                    : 'border-gray-200 dark:border-gray-700'
                } p-6 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Más popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`font-display font-bold text-lg mb-1 ${
                    plan.color === 'brand' ? 'text-brand-700 dark:text-brand-400' :
                    plan.color === 'indigo' ? 'text-indigo-700 dark:text-indigo-400' :
                    'text-gray-800 dark:text-gray-200'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{plan.desc}</p>
                </div>

                <div className="mb-6">
                  <span className="font-display font-extrabold text-4xl text-gray-900 dark:text-gray-100">{plan.price}</span>
                  <span className="text-sm text-gray-400 ml-1">/{plan.priceDetail}</span>
                </div>

                {plan.tiers && (
                  <div className="mb-6 space-y-2">
                    {plan.tiers.map((tier) => (
                      <div key={tier.label} className="flex items-center justify-between px-3 py-2 bg-brand-50/50 dark:bg-brand-900/20 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{tier.label}</span>
                        <span className="text-sm font-bold text-brand-700 dark:text-brand-400">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400 dark:text-gray-600">
                      <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaLink}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 btn-glow'
                      : plan.color === 'indigo'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-xl text-gray-900 dark:text-gray-100 text-center mb-8">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {[
                { q: '¿Puedo publicar gratis?', a: 'Sí, siempre. Los particulares publican gratis sin límite de propiedades. Solo los corredores de propiedades pagan por publicación.' },
                { q: '¿Qué hace "Destacar" exactamente?', a: 'Tu propiedad aparece primero en los resultados de búsqueda, tiene un badge visible de "Destacada", y enviamos alertas por email a arrendatarios que buscan algo similar a tu propiedad.' },
                { q: '¿Cómo pago?', a: 'Los pagos se procesan de forma segura a través de Flow.cl con tarjeta de débito o crédito.' },
                { q: '¿Puedo cancelar en cualquier momento?', a: 'Los pagos son por publicación o por propiedad, no hay suscripción mensual obligatoria. Pagas solo cuando quieres destacar.' },
                { q: '¿Qué es un corredor?', a: 'Un corredor de propiedades es alguien que administra arriendos de terceros profesionalmente. Si eres dueño directo de tu propiedad, eres particular y publicas gratis.' },
                { q: '¿El IVA está incluido?', a: 'Sí, todos los precios mostrados incluyen IVA.' },
              ].map((faq) => (
                <details key={faq.q} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {faq.q}
                    <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
