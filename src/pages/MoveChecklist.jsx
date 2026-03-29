import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

const defaultChecklist = [
  // Antes de firmar
  { id: 1, category: 'Antes de firmar', task: 'Visitar la propiedad en persona (nunca pagues sin visitarla)', done: false },
  { id: 2, category: 'Antes de firmar', task: 'Verificar estado de muros, pisos, ventanas, puertas y cerraduras', done: false },
  { id: 3, category: 'Antes de firmar', task: 'Revisar presión de agua, funcionamiento de baño, cocina y calefont', done: false },
  { id: 4, category: 'Antes de firmar', task: 'Probar enchufes, interruptores y tablero eléctrico', done: false },
  { id: 5, category: 'Antes de firmar', task: 'Preguntar monto exacto de gastos comunes y qué incluyen', done: false },
  { id: 6, category: 'Antes de firmar', task: 'Pedir ver el reglamento de copropiedad (si es edificio/condominio)', done: false },
  { id: 7, category: 'Antes de firmar', task: 'Verificar identidad del arrendador con su RUT y cédula', done: false },
  { id: 8, category: 'Antes de firmar', task: 'Pedir certificado de dominio vigente en el Conservador de Bienes Raíces (confirma que es dueño)', done: false },

  // Contrato
  { id: 9, category: 'Contrato', task: 'Leer el contrato completo antes de firmar', done: false },
  { id: 10, category: 'Contrato', task: 'Verificar que precio, plazo y condiciones coincidan con lo acordado', done: false },
  { id: 11, category: 'Contrato', task: 'Firmar contrato ante Notario Público (obligatorio desde junio 2022)', done: false },
  { id: 12, category: 'Contrato', task: 'Quedarse con una copia firmada del contrato', done: false },
  { id: 13, category: 'Contrato', task: 'Hacer inventario fotográfico detallado del estado del inmueble', done: false },
  { id: 14, category: 'Contrato', task: 'Pagar garantía y obtener recibo firmado o comprobante de transferencia', done: false },

  // Salvoconducto y permisos
  { id: 15, category: 'Salvoconducto y permisos', task: 'Obtener Salvoconducto de Mudanza en notaría (~$3.000-$7.000 CLP, válido 5 días hábiles)', done: false },
  { id: 16, category: 'Salvoconducto y permisos', task: 'Pedir certificado de no adeudar gastos comunes al salir del depto anterior', done: false },
  { id: 17, category: 'Salvoconducto y permisos', task: 'Solicitar permiso municipal de ocupación de calzada si usarás la vía pública (gratis)', done: false },
  { id: 18, category: 'Salvoconducto y permisos', task: 'Coordinar con administración del edificio/condominio fecha y horario de mudanza', done: false },
  { id: 19, category: 'Salvoconducto y permisos', task: 'Reservar ascensor de carga si el edificio lo requiere', done: false },

  // Servicios
  { id: 20, category: 'Servicios básicos', task: 'Transferir cuenta de luz a tu nombre (Enel, CGE, Chilquinta, etc.)', done: false },
  { id: 21, category: 'Servicios básicos', task: 'Transferir cuenta de agua (Aguas Andinas, ESVAL, ESSBIO, etc.)', done: false },
  { id: 22, category: 'Servicios básicos', task: 'Contratar o transferir gas (Metrogas, Abastible, Gasco, Lipigas)', done: false },
  { id: 23, category: 'Servicios básicos', task: 'Contratar internet y/o TV (VTR, Movistar, Entel, WOM, Mundo)', done: false },
  { id: 24, category: 'Servicios básicos', task: 'Verificar revisión de gas vigente (obligatoria en Chile)', done: false },

  // Mudanza
  { id: 25, category: 'Mudanza', task: 'Coordinar fecha y hora de entrega de llaves con el arrendador', done: false },
  { id: 26, category: 'Mudanza', task: 'Contratar empresa de mudanza o vehículo de carga', done: false },
  { id: 27, category: 'Mudanza', task: 'Llevar el salvoconducto durante la mudanza (Carabineros puede pedirlo)', done: false },
  { id: 28, category: 'Mudanza', task: 'Sacar copias de llaves si es necesario', done: false },

  // Después de mudarte
  { id: 29, category: 'Después de mudarte', task: 'Cambiar dirección en el SII (sii.cl)', done: false },
  { id: 30, category: 'Después de mudarte', task: 'Actualizar dirección en el Registro Civil (solicitar nueva cédula si quieres)', done: false },
  { id: 31, category: 'Después de mudarte', task: 'Cambiar dirección en tu banco, AFP, Isapre/Fonasa y trabajo', done: false },
  { id: 32, category: 'Después de mudarte', task: 'Actualizar dirección en el Registro Electoral (servel.cl)', done: false },
  { id: 33, category: 'Después de mudarte', task: 'Conocer a los vecinos y al conserje', done: false },
  { id: 34, category: 'Después de mudarte', task: 'Guardar copia del contrato, inventario y recibos en un lugar seguro', done: false },
]

export default function MoveChecklist() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('move-checklist')
    return saved ? JSON.parse(saved) : defaultChecklist
  })

  useEffect(() => {
    localStorage.setItem('move-checklist', JSON.stringify(items))
  }, [items])

  const toggle = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item))
  }

  const reset = () => {
    setItems(defaultChecklist)
    localStorage.removeItem('move-checklist')
  }

  const categories = [...new Set(items.map(i => i.category))]
  const totalDone = items.filter(i => i.done).length
  const progress = Math.round((totalDone / items.length) * 100)

  return (
    <div className="min-h-screen bg-warm-50 pt-20">
      <Helmet>
        <title>Checklist de mudanza | Rentu</title>
        <meta name="description" content="Lista completa para tu mudanza. No olvides nada: servicios, llaves, inventario y más." />
      </Helmet>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Checklist de mudanza</h1>
        <p className="text-gray-500 text-sm mb-6">Guía paso a paso para tu arriendo nuevo. Tu progreso se guarda automáticamente.</p>

        {/* Barra de progreso */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">{totalDone} de {items.length} completados</span>
            <span className="text-sm font-bold text-brand-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="bg-brand-500 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          {progress === 100 && <p className="text-sm text-green-600 font-medium mt-3">¡Todo listo! Bienvenido a tu nuevo hogar.</p>}
        </div>

        {categories.map(cat => (
          <div key={cat} className="mb-6">
            <h3 className="font-display font-semibold text-gray-800 text-sm uppercase tracking-wider mb-3">{cat}</h3>
            <div className="space-y-2">
              {items.filter(i => i.category === cat).map(item => (
                <button key={item.id} onClick={() => toggle(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${item.done ? 'bg-brand-50 border-brand-200' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.done ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
                    {item.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-brand-700 line-through' : 'text-gray-700'}`}>{item.task}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button onClick={reset} className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">Reiniciar checklist</button>
      </div>
    </div>
  )
}
