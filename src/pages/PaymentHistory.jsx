import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { getMyPayments } from '../lib/supabase'

const statusConfig = {
  completado: { label: 'Completado', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  pendiente: { label: 'Pendiente', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  fallido: { label: 'Fallido', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
}

const tipoLabels = {
  destacar: 'Destacar propiedad',
  contrato: 'Contrato de arriendo',
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMoney(amount) {
  if (!amount && amount !== 0) return '-'
  return `$${Number(amount).toLocaleString('es-CL')}`
}

export default function PaymentHistory({ user }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await getMyPayments(user.id)
      setPayments(data)
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Mis pagos | Rentu</title>
        <meta name="description" content="Revisa el historial de todos tus pagos realizados en Rentu." />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 mb-2">Mis pagos</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Historial de todos tus pagos en la plataforma.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-gray-700 dark:text-gray-300 text-lg mb-2">No tienes pagos registrados</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Cuando realices un pago en la plataforma aparecerá aquí.</p>
            <Link to="/buscar" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Explorar propiedades</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Desktop table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <div className="col-span-2">Fecha</div>
              <div className="col-span-4">Propiedad</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2 text-right">Monto</div>
              <div className="col-span-2 text-center">Estado</div>
            </div>

            {payments.map(payment => {
              const status = statusConfig[payment.estado] || statusConfig.pendiente
              return (
                <div key={payment.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  {/* Desktop row */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 items-center px-5 py-4">
                    <div className="col-span-2 text-sm text-gray-600">{formatDate(payment.created_at)}</div>
                    <div className="col-span-4">
                      <p className="text-sm font-medium text-gray-800 truncate">{payment.properties?.titulo || 'Propiedad eliminada'}</p>
                      <p className="text-xs text-gray-400">{payment.properties?.comuna || ''}</p>
                    </div>
                    <div className="col-span-2 text-sm text-gray-600">{tipoLabels[payment.tipo] || payment.tipo}</div>
                    <div className="col-span-2 text-sm font-semibold text-gray-800 text-right">{formatMoney(payment.monto)}</div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="sm:hidden p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{payment.properties?.titulo || 'Propiedad eliminada'}</p>
                        <p className="text-xs text-gray-400">{payment.properties?.comuna || ''}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{formatDate(payment.created_at)} &middot; {tipoLabels[payment.tipo] || payment.tipo}</span>
                      <span className="font-semibold text-gray-800">{formatMoney(payment.monto)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
