import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import CookieBanner from './components/CookieBanner'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import TenantProfile from './pages/TenantProfile'
import MoveChecklist from './pages/MoveChecklist'
import TipsSeguridad from './pages/TipsSeguridad'
import ComoFunciona from './pages/ComoFunciona'
import Terminos from './pages/Terminos'
import Privacidad from './pages/Privacidad'
import NotFound from './pages/NotFound'
import PagoExitoso from './pages/PagoExitoso'
import MyProperties from './pages/MyProperties'
import PaymentHistory from './pages/PaymentHistory'
import DeleteAccount from './pages/DeleteAccount'
import PublicTenantProfile from './pages/PublicTenantProfile'
import useDarkMode from './hooks/useDarkMode'

// Lazy-loaded heavy pages
const Search = lazy(() => import('./pages/Search'))
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const PublishProperty = lazy(() => import('./pages/PublishProperty'))
const EditProperty = lazy(() => import('./pages/EditProperty'))
const Admin = lazy(() => import('./pages/Admin'))
const ContractGenerator = lazy(() => import('./components/ContractGenerator'))
const Verification = lazy(() => import('./pages/Verification'))
const Compare = lazy(() => import('./pages/Compare'))
const ComunaLanding = lazy(() => import('./pages/ComunaLanding'))
const Messages = lazy(() => import('./pages/Messages'))

function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [contractOpen, setContractOpen] = useState(false)
  const [contractProperty, setContractProperty] = useState(null)
  const [isDark, toggleDark] = useDarkMode()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleContractClick = (property) => {
    if (!user) {
      setAuthOpen(true)
      return
    }
    setContractProperty(property)
    setContractOpen(true)
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-body">
        <Navbar user={user} onAuthClick={() => setAuthOpen(true)} onSignOut={() => supabase.auth.signOut()} isDark={isDark} toggleDark={toggleDark} />
        <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Search user={user} />} />
          <Route path="/propiedad/:id" element={<PropertyDetail user={user} onContractClick={handleContractClick} />} />
          <Route path="/publicar" element={
            user ? <PublishProperty user={user} />
              : <div className="min-h-screen bg-warm-50 pt-20 flex items-center justify-center">
                  <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">Inicia sesión para publicar</h2>
                    <p className="text-gray-500 text-sm mb-6">Necesitas una cuenta para publicar tu propiedad</p>
                    <button onClick={() => setAuthOpen(true)} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20">Iniciar sesión</button>
                  </div>
                </div>
          } />
          <Route path="/editar/:id" element={user ? <EditProperty user={user} /> : <NotFound />} />
          <Route path="/favoritos" element={user ? <Favorites user={user} /> : <NotFound />} />
          <Route path="/perfil-arrendatario" element={user ? <TenantProfile user={user} /> : <NotFound />} />
          <Route path="/verificacion" element={user ? <Verification user={user} /> : <NotFound />} />
          <Route path="/checklist-mudanza" element={<MoveChecklist />} />
          <Route path="/tips-seguridad" element={<TipsSeguridad />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
          <Route path="/mis-propiedades" element={user ? <MyProperties user={user} /> : <NotFound />} />
          <Route path="/mis-pagos" element={user ? <PaymentHistory user={user} /> : <NotFound />} />
          <Route path="/eliminar-cuenta" element={user ? <DeleteAccount user={user} /> : <NotFound />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/perfil/:userId" element={<PublicTenantProfile />} />
          <Route path="/comparar" element={<Compare />} />
          <Route path="/arriendos/:slug" element={<ComunaLanding />} />
          <Route path="/mensajes" element={user ? <Messages user={user} /> : <NotFound />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
        <Footer />
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onAuth={setUser} />
        <Suspense fallback={null}>
          {contractOpen && <ContractGenerator isOpen={contractOpen} onClose={() => { setContractOpen(false); setContractProperty(null) }} property={contractProperty} />}
        </Suspense>
        <CookieBanner />
      </div>
    </BrowserRouter>
  )
}
