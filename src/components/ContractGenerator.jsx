import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { formatPrice } from '../data/properties'

// Validar RUT chileno
function validarRut(rut) {
  if (!rut || typeof rut !== 'string') return false
  const clean = rut.replace(/[.\-]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const expected = 11 - (sum % 11)
  const dvExpected = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected)
  return dv === dvExpected
}

function numberToWords(n) {
  const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
  if (n === 0) return 'cero'
  if (n < 10) return units[n]
  if (n < 20) return teens[n - 10]
  if (n < 30) return n === 20 ? 'veinte' : 'veinti' + units[n % 10]
  if (n < 100) {
    const t = Math.floor(n / 10)
    const u = n % 10
    return u === 0 ? tens[t] : tens[t] + ' y ' + units[u]
  }
  return String(n)
}

export default function ContractGenerator({ isOpen, onClose, property }) {
  const [form, setForm] = useState({
    arrendadorNombre: '',
    arrendadorRut: '',
    arrendadorDireccion: '',
    arrendadorEmail: '',
    arrendatarioNombre: '',
    arrendatarioRut: '',
    arrendatarioDireccion: '',
    arrendatarioEmail: '',
    fechaInicio: '',
    duracion: '12',
    garantia: '1',
    diaPago: '5',
    inventario: '',
  })
  const [rutErrors, setRutErrors] = useState({ arrendador: '', arrendatario: '' })

  if (!isOpen || !property) return null

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const validateRuts = () => {
    const errors = { arrendador: '', arrendatario: '' }
    if (!validarRut(form.arrendadorRut)) errors.arrendador = 'RUT inválido'
    if (!validarRut(form.arrendatarioRut)) errors.arrendatario = 'RUT inválido'
    setRutErrors(errors)
    return !errors.arrendador && !errors.arrendatario
  }

  const generatePDF = (e) => {
    e.preventDefault()
    if (!validateRuts()) return

    const doc = new jsPDF()
    const margin = 18
    const pageWidth = 174
    let y = 20

    const addText = (text, size = 10, bold = false, align = 'left') => {
      doc.setFontSize(size)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, pageWidth)
      lines.forEach(line => {
        if (y > 275) { doc.addPage(); y = 20 }
        if (align === 'center') {
          doc.text(line, 105, y, { align: 'center' })
        } else {
          doc.text(line, margin, y)
        }
        y += size * 0.45 + 1.5
      })
      y += 1
    }

    const addSpace = (px = 4) => { y += px }

    const addClause = (title, size = 11) => {
      if (y > 255) { doc.addPage(); y = 20 }
      addText(title, size, true)
      addSpace(1)
    }

    const addSeparator = () => {
      addSpace(4)
    }

    const fechaInicio = new Date(form.fechaInicio)
    const fechaFin = new Date(fechaInicio)
    fechaFin.setMonth(fechaFin.getMonth() + Number(form.duracion))
    const formatFecha = (d) => d.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })
    const montoGarantia = property.precio * Number(form.garantia)

    // ── HEADER ──
    doc.setFillColor(4, 158, 141)
    doc.rect(0, 0, 210, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.text('Rentu — Plataforma de Arriendos en Chile', margin, 7)
    doc.setTextColor(0, 0, 0)
    y = 18

    addText('CONTRATO DE ARRENDAMIENTO DE BIEN RAÍZ URBANO', 14, true, 'center')
    addText('(Conforme a la Ley N° 18.101 sobre Arrendamiento de Predios Urbanos)', 8, false, 'center')
    addSpace(6)

    // ── AVISO NOTARIAL ──
    doc.setFillColor(255, 243, 224)
    doc.setDrawColor(230, 160, 60)
    doc.setLineWidth(0.5)
    const noticeY = y
    doc.roundedRect(margin, noticeY, pageWidth, 22, 2, 2, 'FD')
    doc.setTextColor(140, 60, 0)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('IMPORTANTE:', margin + 3, noticeY + 5)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    const noticeText = 'De acuerdo con la legislación chilena vigente, los contratos de arriendo deben ser firmados ante Notario Público. Este documento es un modelo referencial y NO constituye asesoría legal. Recomendamos llevar este contrato a una notaría para su firma y autorización formal.'
    const noticeLines = doc.splitTextToSize(noticeText, pageWidth - 6)
    noticeLines.forEach((line, i) => {
      doc.text(line, margin + 3, noticeY + 10 + (i * 3.5))
    })
    doc.setTextColor(0, 0, 0)
    y = noticeY + 26

    // ── COMPARECIENTES ──
    addClause('COMPARECIENTES')
    addText(`En la ciudad de ${property.comuna}, Chile, a ${formatFecha(fechaInicio)}, entre las siguientes partes:`)
    addSpace(2)

    addText('ARRENDADOR:', 10, true)
    addText(`Don(ña) ${form.arrendadorNombre}, cédula de identidad RUT N° ${form.arrendadorRut}, con domicilio en ${form.arrendadorDireccion}, correo electrónico ${form.arrendadorEmail}, en adelante "el Arrendador";`)
    addSpace(2)

    addText('ARRENDATARIO:', 10, true)
    addText(`Don(ña) ${form.arrendatarioNombre}, cédula de identidad RUT N° ${form.arrendatarioRut}, con domicilio en ${form.arrendatarioDireccion}, correo electrónico ${form.arrendatarioEmail}, en adelante "el Arrendatario";`)
    addSpace(2)

    addText('Ambas partes, mayores de edad, libres de todo apremio, han convenido celebrar el presente contrato de arrendamiento, que se regirá por las siguientes cláusulas y, en lo no previsto, por las disposiciones del Código Civil y la Ley N° 18.101 sobre Arrendamiento de Predios Urbanos:')
    addSeparator()

    // ── CLÁUSULA PRIMERA ──
    addClause('CLÁUSULA PRIMERA: OBJETO DEL CONTRATO')
    addText(`El Arrendador da en arrendamiento al Arrendatario el inmueble de su propiedad ubicado en ${property.direccion}, comuna de ${property.comuna}, Región Metropolitana, Chile.`)
    addText(`Tipo de propiedad: ${property.tipo}. Superficie aproximada: ${property.m2 || 'no especificada'} metros cuadrados. Habitaciones: ${property.habitaciones}. Baños: ${property.banos}.${property.piso ? ` Piso: ${property.piso}.` : ''}${property.estacionamiento ? ' Incluye estacionamiento.' : ''}${property.bodega ? ' Incluye bodega.' : ''}`)
    addSeparator()

    // ── CLÁUSULA SEGUNDA ──
    addClause('CLÁUSULA SEGUNDA: DESTINO')
    addText('El inmueble objeto de este contrato se destinará exclusivamente a uso habitacional del Arrendatario y su grupo familiar. El Arrendatario no podrá cambiar el destino del inmueble sin autorización previa y por escrito del Arrendador. Cualquier cambio de destino no autorizado será causal de terminación inmediata del contrato.')
    addSeparator()

    // ── CLÁUSULA TERCERA ──
    addClause('CLÁUSULA TERCERA: RENTA')
    addText(`La renta mensual de arrendamiento se fija en la suma de ${formatPrice(property.precio)} (${numberToWords(property.precio)} pesos chilenos), que el Arrendatario se obliga a pagar al Arrendador dentro de los primeros ${form.diaPago} días de cada mes calendario, mediante transferencia electrónica o depósito bancario en la cuenta que el Arrendador indique.`)
    if (property.gastoComun > 0) {
      addText(`Adicionalmente, el Arrendatario será responsable del pago de los gastos comunes del inmueble, cuyo monto aproximado actual es de ${formatPrice(property.gastoComun)} mensuales, los que podrán variar según la administración del edificio o condominio.`)
    }
    addText(`En caso de mora en el pago de la renta, se devengará un interés moratorio del 1,5% mensual sobre el monto adeudado, sin perjuicio del derecho del Arrendador a solicitar la terminación del contrato conforme a la Ley N° 18.101.`)
    addSeparator()

    // ── CLÁUSULA CUARTA ──
    addClause('CLÁUSULA CUARTA: GARANTÍA')
    addText(`El Arrendatario entrega en este acto al Arrendador la suma de ${formatPrice(montoGarantia)}, equivalente a ${form.garantia} mes(es) de renta, en concepto de garantía por el fiel cumplimiento de las obligaciones del presente contrato y para responder por eventuales deterioros del inmueble o de sus instalaciones, más allá del desgaste natural por el uso legítimo.`)
    addText('Dicha garantía será devuelta al Arrendatario dentro de los 30 días siguientes a la restitución del inmueble, previa verificación del estado de este y una vez descontadas, si correspondiere, las sumas destinadas a reparaciones o deudas pendientes.')
    addSeparator()

    // ── CLÁUSULA QUINTA ──
    addClause('CLÁUSULA QUINTA: DURACIÓN DEL CONTRATO')
    addText(`El presente contrato tendrá una duración de ${form.duracion} meses (${numberToWords(Number(form.duracion))} meses), contados desde el ${formatFecha(fechaInicio)} hasta el ${formatFecha(fechaFin)}.`)
    addSeparator()

    // ── CLÁUSULA SEXTA ──
    addClause('CLÁUSULA SEXTA: SERVICIOS BÁSICOS')
    addText('El Arrendatario será responsable del pago oportuno de todos los servicios básicos del inmueble, incluyendo agua potable, electricidad, gas, internet, telefonía y cualquier otro servicio contratado. Los comprobantes de pago deberán estar al día al momento de la restitución del inmueble.')
    if (property.gastoComun > 0) {
      addText('Los gastos comunes del edificio o condominio serán de cargo del Arrendatario, según lo indicado en la cláusula tercera.')
    }
    addSeparator()

    // ── CLÁUSULA SÉPTIMA ──
    addClause('CLÁUSULA SÉPTIMA: REAJUSTE')
    addText('La renta de arrendamiento se reajustará cada 12 meses de vigencia del contrato, de acuerdo con la variación que experimente el Índice de Precios al Consumidor (IPC), determinado por el Instituto Nacional de Estadísticas (INE), o el organismo que lo reemplace. El reajuste se aplicará a partir del mes siguiente al cumplimiento de cada período anual.')
    addSeparator()

    // ── CLÁUSULA OCTAVA ──
    addClause('CLÁUSULA OCTAVA: ESTADO DEL INMUEBLE')
    addText('El Arrendatario declara recibir el inmueble en buen estado de conservación y habitabilidad, con todas sus instalaciones en correcto funcionamiento, lo que acepta a su entera conformidad.')
    if (form.inventario.trim()) {
      addText('El inmueble se entrega con los siguientes bienes, según inventario:', 10, true)
      addText(form.inventario)
    } else {
      addText('Las partes realizarán un inventario detallado al momento de la entrega material del inmueble, el que se adjuntará como anexo al presente contrato y formará parte integrante del mismo.')
    }
    addText('El Arrendatario se obliga a mantener el inmueble y sus instalaciones en buen estado de conservación y a efectuar las reparaciones locativas que sean de su cargo conforme a la ley.')
    addSeparator()

    // ── CLÁUSULA NOVENA ──
    addClause('CLÁUSULA NOVENA: PROHIBICIONES')
    addText('Queda expresamente prohibido al Arrendatario:')
    addText('a) Subarrendar total o parcialmente el inmueble sin autorización escrita del Arrendador.')
    addText('b) Realizar modificaciones, ampliaciones o alteraciones en la estructura, instalaciones o distribución del inmueble sin autorización previa y por escrito del Arrendador.')
    addText('c) Destinar el inmueble a fines distintos del habitacional.')
    addText('d) Mantener en el inmueble materiales inflamables, explosivos o que representen peligro.')
    addText('e) Causar molestias a los vecinos o infringir el reglamento de copropiedad, si lo hubiere.')
    addText('El incumplimiento de cualquiera de estas prohibiciones facultará al Arrendador para poner término inmediato al contrato.')
    addSeparator()

    // ── CLÁUSULA DÉCIMA ──
    addClause('CLÁUSULA DÉCIMA: RENOVACIÓN')
    addText(`Si ninguna de las partes manifiesta a la otra su voluntad de no renovar el contrato con al menos 60 días de anticipación al vencimiento del plazo o de cualquiera de sus prórrogas, mediante carta certificada enviada al domicilio de la contraparte, el contrato se entenderá renovado automáticamente por períodos sucesivos e iguales de ${form.duracion} meses cada uno, bajo las mismas condiciones, salvo el reajuste de renta previsto en la cláusula séptima.`)
    addSeparator()

    // ── CLÁUSULA UNDÉCIMA ──
    addClause('CLÁUSULA UNDÉCIMA: RESTITUCIÓN')
    addText('A la terminación del contrato, sea por vencimiento del plazo, mutuo acuerdo o cualquier otra causa, el Arrendatario deberá restituir el inmueble completamente desocupado, limpio y en el mismo estado en que lo recibió, salvo el deterioro natural por el uso legítimo.')
    addText('Si el Arrendatario no restituyere el inmueble en la fecha convenida, deberá pagar al Arrendador, a título de indemnización, una suma equivalente al doble de la renta mensual vigente por cada mes o fracción de mes de retraso, sin perjuicio de las acciones legales que correspondan conforme a la Ley N° 18.101.')
    addSeparator()

    // ── CLÁUSULA DUODÉCIMA ──
    addClause('CLÁUSULA DUODÉCIMA: TÉRMINO ANTICIPADO')
    addText('Cualquiera de las partes podrá poner término anticipado al presente contrato dando aviso a la otra con al menos 60 días de anticipación, mediante carta certificada dirigida al domicilio registrado en este contrato.')
    addText('En caso de que el Arrendatario ponga término anticipado sin causa justificada antes del vencimiento del plazo pactado, deberá pagar al Arrendador una indemnización equivalente a un mes de renta vigente a la fecha de terminación.')
    addText('Serán causales de terminación inmediata, sin necesidad de aviso previo: el no pago de dos o más meses de renta, el incumplimiento grave de las obligaciones del contrato, o el uso del inmueble para fines ilícitos.')
    addSeparator()

    // ── CLÁUSULA DECIMOTERCERA ──
    addClause('CLÁUSULA DECIMOTERCERA: DOMICILIO Y JURISDICCIÓN')
    addText(`El presente contrato se rige por las disposiciones del Código Civil de la República de Chile y por la Ley N° 18.101 sobre Arrendamiento de Predios Urbanos. Para todos los efectos legales derivados del presente contrato, las partes fijan su domicilio en la comuna de ${property.comuna}, ciudad de Santiago, Región Metropolitana, Chile, y se someten a la jurisdicción de sus tribunales ordinarios de justicia.`)
    addSeparator()

    // ── EJEMPLARES ──
    addText('El presente contrato se firma en dos ejemplares de idéntico tenor y fecha, quedando uno en poder de cada parte contratante.', 10)
    addSpace(10)

    // ── FIRMAS ──
    if (y > 240) { doc.addPage(); y = 20 }
    addText('FIRMAS', 12, true, 'center')
    addSpace(3)
    addText(`En ${property.comuna}, a ${formatFecha(fechaInicio)}`, 9, false, 'center')
    addSpace(18)

    const firmaY = y
    doc.setDrawColor(80, 80, 80)
    doc.setLineWidth(0.3)
    doc.line(margin, firmaY, margin + 65, firmaY)
    doc.line(125, firmaY, 192, firmaY)
    y = firmaY + 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('EL ARRENDADOR', margin + 14, y)
    doc.text('EL ARRENDATARIO', 138, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(form.arrendadorNombre, margin, y)
    doc.text(form.arrendatarioNombre, 125, y)
    y += 4
    doc.text(`RUT: ${form.arrendadorRut}`, margin, y)
    doc.text(`RUT: ${form.arrendatarioRut}`, 125, y)

    // ── AVISO LEGAL ──
    y += 14
    if (y > 260) { doc.addPage(); y = 20 }
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.2)
    doc.line(margin, y, margin + pageWidth, y)
    y += 5
    doc.setFontSize(7)
    doc.setTextColor(130, 130, 130)
    addText('AVISO LEGAL: Este contrato ha sido generado automáticamente por la plataforma Rentu como documento referencial basado en la legislación chilena vigente, en particular la Ley N° 18.101. Rentu no es un estudio jurídico ni presta servicios legales de ningún tipo. Se recomienda encarecidamente que ambas partes consulten con un abogado antes de firmar este documento. Rentu no se hace responsable del uso, interpretación o consecuencias legales derivadas de este contrato.')

    // ── FOOTER EN CADA PÁGINA ──
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(170, 170, 170)
      doc.setFont('helvetica', 'normal')
      doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: 'center' })
      doc.text('Rentu — rentu.cl', margin, 290)
    }

    doc.save(`contrato-arriendo-${property.comuna.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.pdf`)
    onClose()
  }

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-auto">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white border border-gray-100 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8 max-h-[90vh] overflow-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-display font-bold text-xl text-gray-900 mb-1">Generar contrato de arriendo</h2>
        <p className="text-sm text-gray-500 mb-2">{property.titulo} — {formatPrice(property.precio)}/mes</p>

        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-800 font-bold mb-1">IMPORTANTE</p>
          <p className="text-xs text-red-700 leading-relaxed">De acuerdo con la legislación chilena vigente, los contratos de arriendo deben ser firmados ante Notario Público. Este documento es un modelo referencial y NO constituye asesoría legal. Recomendamos llevar este contrato a una notaría para su firma y autorización formal.</p>
        </div>

        <p className="text-xs text-amber-600 mb-5 leading-relaxed bg-amber-50 border border-amber-200 rounded-lg p-2">Contrato basado en la Ley N° 18.101 sobre Arrendamiento de Predios Urbanos. Este documento es referencial — se recomienda consultar con un abogado.</p>

        <form onSubmit={generatePDF} className="space-y-4">
          {/* Arrendador */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">Arrendador (propietario)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre completo</label>
                <input type="text" required value={form.arrendadorNombre} onChange={e => update('arrendadorNombre', e.target.value)} placeholder="Juan Pérez López" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">RUT</label>
                <input type="text" required value={form.arrendadorRut} onChange={e => { update('arrendadorRut', e.target.value); setRutErrors(prev => ({ ...prev, arrendador: '' })) }} placeholder="12.345.678-9" className={`${inputClass} ${rutErrors.arrendador ? 'border-red-400' : ''}`} />
                {rutErrors.arrendador && <p className="text-xs text-red-500 mt-1">{rutErrors.arrendador}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dirección</label>
                <input type="text" required value={form.arrendadorDireccion} onChange={e => update('arrendadorDireccion', e.target.value)} placeholder="Av. Providencia 1234, Santiago" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input type="email" required value={form.arrendadorEmail} onChange={e => update('arrendadorEmail', e.target.value)} placeholder="correo@ejemplo.cl" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Arrendatario */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">Arrendatario (quien arrienda)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre completo</label>
                <input type="text" required value={form.arrendatarioNombre} onChange={e => update('arrendatarioNombre', e.target.value)} placeholder="María González Díaz" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">RUT</label>
                <input type="text" required value={form.arrendatarioRut} onChange={e => { update('arrendatarioRut', e.target.value); setRutErrors(prev => ({ ...prev, arrendatario: '' })) }} placeholder="98.765.432-1" className={`${inputClass} ${rutErrors.arrendatario ? 'border-red-400' : ''}`} />
                {rutErrors.arrendatario && <p className="text-xs text-red-500 mt-1">{rutErrors.arrendatario}</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dirección actual</label>
                <input type="text" required value={form.arrendatarioDireccion} onChange={e => update('arrendatarioDireccion', e.target.value)} placeholder="Los Leones 567, Providencia" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input type="email" required value={form.arrendatarioEmail} onChange={e => update('arrendatarioEmail', e.target.value)} placeholder="correo@ejemplo.cl" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Propiedad (auto-filled, read-only) */}
          <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">Propiedad (datos automáticos)</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dirección</label>
                <input type="text" readOnly value={property.direccion} className={`${inputClass} bg-white/60 cursor-not-allowed`} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Comuna</label>
                <input type="text" readOnly value={property.comuna} className={`${inputClass} bg-white/60 cursor-not-allowed`} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                <input type="text" readOnly value={property.tipo} className={`${inputClass} bg-white/60 cursor-not-allowed`} />
              </div>
            </div>
          </div>

          {/* Datos del contrato */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">Datos del contrato</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fecha inicio</label>
                <input type="date" required value={form.fechaInicio} onChange={e => update('fechaInicio', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Duración</label>
                <select value={form.duracion} onChange={e => update('duracion', e.target.value)} className={inputClass}>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Monto renta</label>
                <input type="text" readOnly value={formatPrice(property.precio)} className={`${inputClass} bg-white/60 cursor-not-allowed`} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Día de pago</label>
                <select value={form.diaPago} onChange={e => update('diaPago', e.target.value)} className={inputClass}>
                  <option value="1">Día 1</option>
                  <option value="5">Día 5</option>
                  <option value="10">Día 10</option>
                  <option value="15">Día 15</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Mes(es) de garantía</label>
                <select value={form.garantia} onChange={e => update('garantia', e.target.value)} className={inputClass}>
                  <option value="1">1 mes ({formatPrice(property.precio)})</option>
                  <option value="2">2 meses ({formatPrice(property.precio * 2)})</option>
                  <option value="3">3 meses ({formatPrice(property.precio * 3)})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventario */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Inventario del inmueble (opcional)</label>
            <textarea rows={3} value={form.inventario} onChange={e => update('inventario', e.target.value)} placeholder="Ej: Refrigerador Samsung RT35, cocina 4 quemadores Mademsa, cortinas roller en living y dormitorios, calefont Junkers 14L..." className={`${inputClass} resize-none`} />
            <p className="text-[10px] text-gray-400 mt-1">Si se deja vacío, se adjuntará un inventario como anexo al momento de la entrega.</p>
          </div>

          <button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Descargar contrato PDF
          </button>

          <p className="text-[10px] text-center text-gray-400">Rentu no es un estudio jurídico. Consulte con un abogado antes de firmar.</p>
        </form>
      </div>
    </div>
  )
}
