import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import {
  isAdmin,
  getAdminStats,
  getAllProperties,
  togglePropertyActive,
  togglePropertyFeatured,
  deletePropertyAdmin,
  getAllPayments,
  supabase
} from '../lib/supabase'

const TABS = [
  { id: 'stats', label: 'Estadísticas' },
  { id: 'properties', label: 'Propiedades' },
  { id: 'users', label: 'Usuarios' },
  { id: 'payments', label: 'Pagos' },
  { id: 'verifications', label: 'Verificaciones' },
  { id: 'reports', label: 'Reportes' },
]

// ─── Stat Card ───
function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-display font-bold text-gray-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

// ─── Stats Tab ───
function StatsTab({ stats, loading }) {
  if (loading) return <LoadingSkeleton />

  const fmt = (n) => new Intl.NumberFormat('es-CL').format(n)
  const fmtMoney = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" /></svg>}
        label="Propiedades activas"
        value={fmt(stats.totalActive)}
        sub={`${fmt(stats.totalProperties)} total`}
      />
      <StatCard
        icon={<svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
        label="Usuarios registrados"
        value={fmt(stats.uniqueUsers)}
      />
      <StatCard
        icon={<svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
        label="Publicadas hoy"
        value={fmt(stats.todayCount)}
        sub={`${fmt(stats.weekCount)} esta semana / ${fmt(stats.monthCount)} este mes`}
      />
      <StatCard
        icon={<svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>}
        label="Pagos completados"
        value={fmtMoney(stats.totalRevenue)}
        sub={`${fmt(stats.totalPayments)} transacciones`}
      />
    </div>
  )
}

// ─── Properties Tab ───
function PropertiesTab() {
  const [properties, setProperties] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { type, id, titulo, current }
  const pageSize = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, count } = await getAllProperties(page, pageSize, search)
    setProperties(data)
    setCount(count)
    setLoading(false)
  }, [page, search])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(count / pageSize)

  const handleToggleActive = async (id, current) => {
    setActionLoading(id)
    await togglePropertyActive(id, !current)
    await load()
    setActionLoading(null)
  }

  const handleToggleFeatured = async (id, current) => {
    setActionLoading(id)
    await togglePropertyFeatured(id, !current)
    await load()
    setActionLoading(null)
  }

  const handleDelete = async (id) => {
    setConfirmAction(null)
    setActionLoading(id)
    await deletePropertyAdmin(id)
    await load()
    setActionLoading(null)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

  return (
    <div>
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors">
          Buscar
        </button>
        {search && (
          <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-xl transition-colors">
            Limpiar
          </button>
        )}
      </form>

      <p className="text-sm text-gray-500 mb-4">{count} propiedad{count !== 1 ? 'es' : ''} encontrada{count !== 1 ? 's' : ''}</p>

      {loading ? <LoadingSkeleton /> : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 font-medium">
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Comuna</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Usuario</th>
                  <th className="px-4 py-3 text-center">Activa</th>
                  <th className="px-4 py-3 text-center">Destacada</th>
                  <th className="px-4 py-3 hidden md:table-cell">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((p, i) => (
                  <tr key={p.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-brand-50/30 transition-colors`}>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{p.titulo}</td>
                    <td className="px-4 py-3 text-gray-600">{p.comuna}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{fmtPrice(p.precio)}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs font-mono truncate max-w-[120px]">{p.user_id?.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${p.activa ? 'bg-green-400' : 'bg-red-400'}`} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.destacada ? (
                        <svg className="w-5 h-5 text-yellow-400 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{fmtDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(p.id, p.activa)}
                          disabled={actionLoading === p.id}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${p.activa ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={p.activa ? 'Desactivar' : 'Activar'}
                        >
                          {p.activa ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(p.id, p.destacada)}
                          disabled={actionLoading === p.id}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${p.destacada ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={p.destacada ? 'Quitar destacada' : 'Destacar'}
                        >
                          <svg className="w-4 h-4" fill={p.destacada ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: 'delete', id: p.id, titulo: p.titulo })}
                          disabled={actionLoading === p.id}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {properties.length === 0 && (
                  <tr><td colSpan="8" className="px-4 py-12 text-center text-gray-400">No se encontraron propiedades</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.type === 'delete' ? 'Eliminar propiedad' : 'Confirmar acción'}
        message={confirmAction?.type === 'delete' ? `¿Eliminar "${confirmAction?.titulo}"? Esta acción no se puede deshacer.` : '¿Estás seguro?'}
        confirmText={confirmAction?.type === 'delete' ? 'Eliminar' : 'Confirmar'}
        cancelText="Cancelar"
        danger={confirmAction?.type === 'delete'}
        onConfirm={() => {
          if (confirmAction?.type === 'delete') handleDelete(confirmAction.id)
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}

// ─── Users Tab ───
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userProperties, setUserProperties] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('properties')
        .select('user_id, user_email, created_at')
        .order('created_at', { ascending: false })

      if (data) {
        const map = new Map()
        data.forEach(p => {
          if (!map.has(p.user_id)) {
            map.set(p.user_id, {
              user_id: p.user_id,
              email: p.user_email || p.user_id?.slice(0, 8) + '...',
              count: 0,
              firstSeen: p.created_at
            })
          }
          const u = map.get(p.user_id)
          u.count++
          if (new Date(p.created_at) < new Date(u.firstSeen)) {
            u.firstSeen = p.created_at
          }
        })
        setUsers(Array.from(map.values()).sort((a, b) => b.count - a.count))
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleViewProperties = async (userId) => {
    if (selectedUser === userId) {
      setSelectedUser(null)
      setUserProperties([])
      return
    }
    setSelectedUser(userId)
    const { data } = await supabase
      .from('properties')
      .select('id, titulo, comuna, precio, activa, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setUserProperties(data || [])
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtPrice = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

  if (loading) return <LoadingSkeleton />

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{users.length} usuario{users.length !== 1 ? 's' : ''} con propiedades publicadas</p>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 font-medium">
              <th className="px-4 py-3">Email / ID</th>
              <th className="px-4 py-3 text-center">Propiedades</th>
              <th className="px-4 py-3">Primera publicación</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u, i) => (
              <>
                <tr key={u.user_id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-brand-50/30 transition-colors`}>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-brand-50 text-brand-700 font-bold rounded-full text-xs">{u.count}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(u.firstSeen)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewProperties(u.user_id)}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                      {selectedUser === u.user_id ? 'Ocultar' : 'Ver propiedades'}
                    </button>
                  </td>
                </tr>
                {selectedUser === u.user_id && (
                  <tr key={u.user_id + '-props'}>
                    <td colSpan="4" className="px-4 py-3 bg-brand-50/30">
                      <div className="space-y-2">
                        {userProperties.map(p => (
                          <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-gray-100">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{p.titulo}</p>
                              <p className="text-xs text-gray-500">{p.comuna} - {fmtPrice(p.precio)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${p.activa ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                {p.activa ? 'Activa' : 'Inactiva'}
                              </span>
                              <span className="text-xs text-gray-400">{fmtDate(p.created_at)}</span>
                            </div>
                          </div>
                        ))}
                        {userProperties.length === 0 && (
                          <p className="text-xs text-gray-400 py-2">Sin propiedades</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="4" className="px-4 py-12 text-center text-gray-400">No hay usuarios registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Payments Tab ───
function PaymentsTab() {
  const [payments, setPayments] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [estado, setEstado] = useState('')
  const [loading, setLoading] = useState(true)
  const pageSize = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, count } = await getAllPayments(page, pageSize, estado)
    setPayments(data)
    setCount(count)
    setLoading(false)
  }, [page, estado])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(count / pageSize)

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtMoney = (n) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

  const estadoColors = {
    completado: 'bg-green-50 text-green-600',
    pendiente: 'bg-yellow-50 text-yellow-600',
    fallido: 'bg-red-50 text-red-500',
    reembolsado: 'bg-blue-50 text-blue-600',
  }

  return (
    <div>
      {/* Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['', 'completado', 'pendiente', 'fallido', 'reembolsado'].map(e => (
          <button
            key={e}
            onClick={() => { setEstado(e); setPage(1) }}
            className={`px-4 py-2 text-sm rounded-xl border transition-colors ${estado === e ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {e === '' ? 'Todos' : e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">{count} pago{count !== 1 ? 's' : ''}</p>

      {loading ? <LoadingSkeleton /> : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 font-medium">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Propiedad</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p, i) => (
                  <tr key={p.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-brand-50/30 transition-colors`}>
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono truncate max-w-[120px]">{p.user_id?.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-gray-800 font-medium max-w-[200px] truncate">{p.properties?.titulo || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{fmtMoney(p.monto)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${estadoColors[p.estado] || 'bg-gray-100 text-gray-600'}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{fmtDate(p.created_at)}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan="5" className="px-4 py-12 text-center text-gray-400">No se encontraron pagos</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">Página {page} de {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Anterior</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Siguiente</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Reports Tab ───
function ReportsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Reportes</h3>
      <p className="text-gray-500 text-sm">Próximamente. Esta sección está en desarrollo.</p>
    </div>
  )
}

// ─── Loading ───
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
      ))}
    </div>
  )
}

// ─── Main Admin Component ───
export default function Admin({ user }) {
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const navigate = useNavigate()

  // Auth check
  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  // Load stats
  useEffect(() => {
    async function load() {
      setStatsLoading(true)
      const data = await getAdminStats()
      setStats(data)
      setStatsLoading(false)
    }
    load()
  }, [])

  if (!user || !isAdmin(user)) return null

  return (
    <div className="min-h-screen bg-warm-50 pt-24 pb-16">
      <Helmet>
        <title>Panel de administración | Rentu</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-gray-800">Panel de Administración</h1>
          <p className="text-gray-500 mt-1">Gestiona propiedades, usuarios y pagos de Rentu</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all relative ${
                tab === t.id
                  ? 'text-brand-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'stats' && <StatsTab stats={stats || {}} loading={statsLoading} />}
        {tab === 'properties' && <PropertiesTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'payments' && <PaymentsTab />}
        {tab === 'verifications' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            </div>
            <h3 className="font-display font-bold text-xl text-gray-800 mb-2">Verificaciones</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Próximamente podrás revisar y aprobar las verificaciones de identidad de los usuarios, incluyendo documentos, referencias y reportes Dicom.
            </p>
          </div>
        )}
        {tab === 'reports' && <ReportsTab />}
      </div>
    </div>
  )
}
