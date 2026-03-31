import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isAdmin } from '../lib/supabase'
import NotificationBell from './NotificationBell'

export default function Navbar({ user, onAuthClick, onSignOut, isDark, toggleDark }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef(null)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isActive = (path) => location.pathname === path

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setUserMenuOpen(false)
    setMenuOpen(false)
  }, [location])

  const transparent = isHome && !scrolled && !menuOpen
  const textColor = transparent ? 'text-white/90 hover:text-white' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100'
  const activeColor = transparent ? 'text-white bg-white/15' : 'text-brand-700 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/30'

  return (
    <>
    <nav aria-label="Navegación principal" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${transparent ? 'navbar-transparent' : 'navbar-solid'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/mascot-icon.svg" alt="Rentu logo" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
            <span className={`font-display font-bold text-xl tracking-tight transition-colors duration-300 ${transparent ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              Ren<span className={`transition-colors duration-300 ${transparent ? 'text-brand-300' : 'text-brand-600'}`}>tu</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { path: '/', label: 'Inicio' },
              { path: '/buscar', label: 'Buscar' },
              { path: '/publicar', label: 'Publicar' },
            ].map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(item.path) ? activeColor : textColor}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className={`p-2 rounded-xl transition-all duration-300 ${transparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-200 dark:hover:bg-gray-800'}`}
              title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell user={user} transparent={transparent} />
                <Link to="/favoritos" className={`p-2 transition-colors duration-300 ${transparent ? 'text-white/70 hover:text-red-300' : 'text-gray-400 hover:text-red-500'}`} title="Mis favoritos">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </Link>

                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="Menú de usuario" aria-expanded={userMenuOpen} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${transparent ? 'hover:bg-white/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${transparent ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'}`}>
                      {(user.user_metadata?.name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <span className={`text-sm max-w-[120px] truncate transition-colors duration-300 ${transparent ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'}`}>
                      {user.user_metadata?.name || user.email}
                    </span>
                    <svg className={`w-4 h-4 transition-all duration-300 ${userMenuOpen ? 'rotate-180' : ''} ${transparent ? 'text-white/50' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 rounded-2xl shadow-2xl shadow-black/8 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-400 dark:text-gray-500">Conectado como</p>
                        <p className="text-sm text-gray-700 dark:text-gray-200 font-medium truncate">{user.email}</p>
                      </div>

                      {[
                        { to: '/mis-propiedades', label: 'Mis propiedades', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /> },

                        { to: '/favoritos', label: 'Mis favoritos', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
                        { to: '/perfil-arrendatario', label: 'Mi perfil', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
                        { to: '/verificacion', label: 'Verificar mi identidad', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /> },
                        { to: '/publicar', label: 'Publicar propiedad', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /> },
                        { to: '/checklist-mudanza', label: 'Checklist mudanza', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
                        { to: '/mis-pagos', label: 'Mis pagos', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /> },
                      ].map(item => (
                        <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{item.icon}</svg>
                          {item.label}
                        </Link>
                      ))}

                      {isAdmin(user) && (
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-700 transition-colors font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Admin
                          </Link>
                        </div>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link to="/eliminar-cuenta" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Eliminar cuenta
                        </Link>
                        <button onClick={onSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 btn-magnetic ${
                  transparent
                    ? 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                }`}
              >
                Iniciar sesión
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} className={`md:hidden p-2 rounded-xl transition-colors ${transparent ? 'text-white/80 hover:bg-white/10' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-fadeIn">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile dark mode toggle */}
            <button onClick={toggleDark} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium">
              {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
              {isDark ? 'Modo claro' : 'Modo oscuro'}
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-800" />
            <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium">Inicio</Link>
            <Link to="/buscar" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium">Buscar</Link>
            <Link to="/publicar" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium">Publicar</Link>
            {user ? (
              <>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider">Mi cuenta</p>
                </div>
                <Link to="/mis-propiedades" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm font-medium">Mis propiedades</Link>

                <Link to="/favoritos" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm font-medium">Mis favoritos</Link>
                <Link to="/perfil-arrendatario" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm font-medium">Mi perfil</Link>
                <Link to="/verificacion" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm font-medium">Verificar mi identidad</Link>
                <Link to="/checklist-mudanza" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm font-medium">Checklist mudanza</Link>
                <Link to="/mis-pagos" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm font-medium">Mis pagos</Link>
                {isAdmin(user) && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-brand-600 hover:text-brand-700 hover:bg-brand-50 text-sm font-semibold">Admin</Link>
                )}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <Link to="/eliminar-cuenta" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 text-sm font-medium">Eliminar cuenta</Link>
                </div>
                <button onClick={() => { onSignOut(); setMenuOpen(false) }} className="w-full mt-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl">Cerrar sesión</button>
              </>
            ) : (
              <button onClick={() => { onAuthClick(); setMenuOpen(false) }} className="w-full mt-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl">Iniciar sesión</button>
            )}
          </div>
        </div>
      )}
    </nav>

      {/* Mobile bottom nav */}
      {!location.pathname.startsWith('/admin') && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Navegacion mobile">
          <div className="flex items-center justify-around h-14">
            {[
              { to: '/', label: 'Inicio', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>
              )},
              { to: '/buscar', label: 'Buscar', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              )},
              { to: '/publicar', label: 'Publicar', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )},
              { to: '/favoritos', label: 'Favoritos', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              )},
              { to: user ? '/mis-propiedades' : '#', label: 'Mi cuenta', onClick: user ? undefined : () => onAuthClick(), icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              )},
            ].map(item => {
              const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to) && item.to !== '#'
              const content = (
                <div className="flex flex-col items-center gap-0.5">
                  <span className={active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}>{item.icon}</span>
                  <span className={`text-[10px] font-medium ${active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}>{item.label}</span>
                </div>
              )
              if (item.onClick) {
                return (
                  <button key={item.label} onClick={item.onClick} className="flex-1 flex items-center justify-center py-1" aria-label={item.label}>
                    {content}
                  </button>
                )
              }
              return (
                <Link key={item.to} to={item.to} className="flex-1 flex items-center justify-center py-1" aria-label={item.label}>
                  {content}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}
