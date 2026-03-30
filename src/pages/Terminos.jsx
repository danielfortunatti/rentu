import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default function Terminos() {
  return (
    <div className="min-h-screen bg-warm-50 pt-20">
      <Helmet>
        <title>Términos y Condiciones | Rentu</title>
        <meta name="description" content="Términos y condiciones de uso de Rentu, plataforma de arriendos en Chile." />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="text-sm text-brand-600 hover:text-brand-700 mb-6 inline-block">&larr; Volver al inicio</Link>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Términos y Condiciones de Uso</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">Identificación del proveedor</h2>
            <ul className="list-none pl-0 space-y-1 text-sm">
              <li><strong>Razón social:</strong> Rentu SpA</li>

              <li><strong>Domicilio:</strong> Santiago, Región Metropolitana, Chile</li>
              <li><strong>Correo electrónico:</strong> rentu.contacto@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">1. Aceptación de los términos</h2>
            <p>Al registrarse, acceder o utilizar la plataforma Rentu (en adelante "la Plataforma"), usted acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo con alguno de estos términos, no debe utilizar la Plataforma.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">2. Descripción del servicio</h2>
            <p>Rentu es una plataforma digital que permite a usuarios publicar y buscar propiedades en arriendo en Chile. La Plataforma actúa únicamente como intermediario tecnológico, facilitando la conexión entre arrendadores y arrendatarios.</p>
            <p><strong>Rentu NO es parte de ningún contrato de arriendo celebrado entre los usuarios.</strong> No somos inmobiliaria, corredora de propiedades ni prestamos servicios legales.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">3. Registro y cuenta de usuario</h2>
            <p>Para publicar propiedades, el usuario debe crear una cuenta proporcionando información veraz y actualizada. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas bajo su cuenta.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">4. Publicación de propiedades</h2>
            <p>El usuario que publica una propiedad declara y garantiza que:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Es propietario del inmueble o tiene autorización legal para ofrecerlo en arriendo.</li>
              <li>La información publicada (precio, dirección, fotografías, características) es veraz y no induce a error.</li>
              <li>Las fotografías corresponden al inmueble ofrecido y no infringen derechos de terceros.</li>
              <li>Cumple con la legislación chilena aplicable, incluyendo la Ley N° 18.101 sobre Arrendamiento de Predios Urbanos.</li>
            </ul>
            <p>Rentu se reserva el derecho de eliminar publicaciones que incumplan estos requisitos o que sean reportadas como fraudulentas.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">5. Contratos de arriendo</h2>
            <p>La Plataforma ofrece un generador automático de contratos de arriendo como herramienta referencial. Estos contratos:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Son plantillas basadas en la legislación chilena vigente (Ley N° 18.101, Código Civil).</li>
              <li>NO constituyen asesoría legal.</li>
              <li>NO han sido revisados por un abogado para el caso particular de cada usuario.</li>
              <li>Su uso es responsabilidad exclusiva de las partes que lo firman.</li>
            </ul>
            <p><strong>Recomendamos enfáticamente consultar con un abogado antes de firmar cualquier contrato de arriendo.</strong></p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">6. Servicios de pago</h2>
            <p>Rentu ofrece servicios opcionales de pago, como "Destacar propiedad". Los pagos se procesan a través de Flow.cl, un procesador de pagos autorizado en Chile. Los precios se muestran en pesos chilenos (CLP) e incluyen IVA cuando corresponda.</p>
            <p>Las políticas de reembolso se rigen por la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.</p>
            <p>El usuario tiene derecho a retractarse de la contratación del servicio "Destacar propiedad" dentro de los 10 días siguientes a la contratación, conforme al artículo 3 bis de la Ley N° 19.496. Para ejercer este derecho, envíe un correo a rentu.contacto@gmail.com indicando su solicitud de retracto. El reembolso se realizará dentro de 15 días hábiles.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">7. Limitación de responsabilidad</h2>
            <p>Rentu no se responsabiliza por:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>La veracidad de la información publicada por los usuarios.</li>
              <li>El estado real de las propiedades publicadas.</li>
              <li>Las transacciones o acuerdos celebrados entre usuarios.</li>
              <li>Daños o perjuicios derivados del uso de los contratos generados por la Plataforma.</li>
              <li>La identidad o solvencia de los usuarios registrados.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">8. Conducta prohibida</h2>
            <p>Queda prohibido utilizar la Plataforma para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Publicar información falsa o engañosa.</li>
              <li>Suplantar la identidad de otra persona.</li>
              <li>Realizar actividades fraudulentas o ilícitas.</li>
              <li>Enviar spam o comunicaciones no solicitadas.</li>
              <li>Intentar acceder a cuentas de otros usuarios.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">9. Propiedad intelectual</h2>
            <p>Todo el contenido de la Plataforma (diseño, código, logotipos, textos) es propiedad de Rentu y está protegido por las leyes de propiedad intelectual chilenas (Ley N° 17.336).</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">10. Modificaciones</h2>
            <p>Rentu se reserva el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigencia al publicarse en la Plataforma. El uso continuado de la Plataforma después de la publicación constituye aceptación de los términos modificados.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">11. Ley aplicable y jurisdicción</h2>
            <p>Estos Términos se rigen por la legislación de la República de Chile. Cualquier controversia será sometida a la jurisdicción de los tribunales ordinarios de justicia de Santiago de Chile.</p>
            <p className="mt-2">Estos Términos se adecuarán a la Ley N° 21.719 sobre Protección de Datos Personales a partir de su entrada en vigencia en diciembre de 2026.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">12. Resolución de disputas</h2>
            <p>Rentu no media ni arbitra en disputas entre usuarios. En caso de conflicto entre arrendador y arrendatario, las partes deberán resolverlo directamente o recurrir a los mecanismos legales disponibles, incluyendo SERNAC, mediación o los tribunales competentes de Santiago de Chile.</p>
            <p>Para reportar publicaciones fraudulentas o conductas indebidas en la plataforma, envíe un correo a rentu.contacto@gmail.com con el asunto "Reporte".</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">13. Contacto</h2>
            <p>Para consultas sobre estos Términos, contacte a: <strong>rentu.contacto@gmail.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}
