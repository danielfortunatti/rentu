import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Política de Privacidad | Rentu</title>
        <meta name="description" content="Política de privacidad y protección de datos personales de Rentu." />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="text-sm text-brand-600 hover:text-brand-700 mb-6 inline-block">&larr; Volver al inicio</Link>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: 31 de marzo de 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">Identificación del responsable</h2>
            <ul className="list-none pl-0 space-y-1 text-sm">
              <li><strong>Razón social:</strong> Rentu SpA</li>

              <li><strong>Domicilio:</strong> Santiago, Región Metropolitana, Chile</li>
              <li><strong>Correo electrónico:</strong> rentu.contacto@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">1. Responsable del tratamiento</h2>
            <p>El responsable del tratamiento de sus datos personales es Rentu, con domicilio en Santiago de Chile. Correo de contacto: <strong>rentu.contacto@gmail.com</strong></p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">2. Datos que recopilamos</h2>
            <p>Recopilamos los siguientes datos personales cuando usted utiliza nuestra Plataforma:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Datos de registro:</strong> nombre, correo electrónico y contraseña.</li>
              <li><strong>Datos de publicación:</strong> dirección de la propiedad, número de teléfono/WhatsApp, fotografías del inmueble.</li>
              <li><strong>Datos de contrato:</strong> nombre completo, RUT, dirección y correo electrónico (cuando utiliza el generador de contratos).</li>
              <li><strong>Datos de pago:</strong> procesados exclusivamente por Flow.cl. Rentu no almacena datos de tarjetas de crédito o débito.</li>
              <li><strong>Datos de uso:</strong> dirección IP, tipo de navegador, páginas visitadas y tiempo de sesión.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">3. Finalidad del tratamiento</h2>
            <p>Utilizamos sus datos personales para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Crear y gestionar su cuenta de usuario.</li>
              <li>Publicar y mostrar propiedades en la Plataforma.</li>
              <li>Facilitar la comunicación entre arrendadores y arrendatarios.</li>
              <li>Generar contratos de arriendo.</li>
              <li>Procesar pagos por servicios premium.</li>
              <li>Enviar notificaciones relacionadas con el servicio (consultas sobre propiedades, confirmaciones).</li>
              <li>Mejorar la Plataforma y la experiencia del usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">4. Base legal (Ley N° 19.628)</h2>
            <p>El tratamiento de sus datos se realiza conforme a la Ley N° 19.628 sobre Protección de la Vida Privada, bajo las siguientes bases legales:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Consentimiento:</strong> otorgado al momento de registrarse y aceptar estos términos.</li>
              <li><strong>Ejecución contractual:</strong> necesario para prestar los servicios de la Plataforma.</li>
              <li><strong>Interés legítimo:</strong> para prevenir fraudes y mejorar la seguridad.</li>
            </ul>
            <p>A partir de diciembre de 2026, nos adecuaremos a lo dispuesto en la Ley N° 21.719 sobre Protección de Datos Personales.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">5. Compartición de datos</h2>
            <p>Sus datos personales pueden ser compartidos con:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Otros usuarios:</strong> la información de contacto (teléfono, email) se muestra a quienes consulten por su propiedad.</li>
              <li><strong>Flow.cl:</strong> procesador de pagos, para gestionar transacciones.</li>
              <li><strong>Supabase:</strong> proveedor de infraestructura para almacenamiento de datos.</li>
              <li><strong>Resend:</strong> servicio de envío de correos electrónicos transaccionales.</li>
              <li><strong>Autoridades:</strong> cuando sea requerido por ley o por orden judicial.</li>
            </ul>
            <p>No vendemos ni compartimos sus datos personales con terceros para fines de marketing.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">6. Retención de datos</h2>
            <p>Conservamos sus datos personales mientras su cuenta esté activa o sea necesario para prestar los servicios. Los datos de publicaciones eliminadas se mantienen por 90 días antes de ser borrados permanentemente. Los datos de pagos se conservan por 5 años conforme a la normativa tributaria chilena.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">7. Sus derechos</h2>
            <p>Conforme a la Ley N° 19.628, usted tiene derecho a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Acceso:</strong> solicitar información sobre los datos que tenemos sobre usted.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Cancelación:</strong> solicitar la eliminación de sus datos personales.</li>
              <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos en determinados casos.</li>
              <li><strong>Portabilidad:</strong> solicitar una copia de sus datos en formato estructurado y de uso común.</li>
              <li><strong>Oposición a decisiones automatizadas:</strong> no ser objeto de decisiones basadas únicamente en el tratamiento automatizado de sus datos que produzcan efectos jurídicos o le afecten significativamente.</li>
            </ul>
            <p>Para ejercer estos derechos, envíe un correo a <strong>rentu.contacto@gmail.com</strong> con el asunto "Derechos de datos personales" indicando su solicitud y adjuntando una copia de su documento de identidad.</p>
            <p>Responderemos en un plazo máximo de 15 días hábiles.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">8. Seguridad</h2>
            <p>Implementamos medidas técnicas y organizativas para proteger sus datos personales, incluyendo cifrado en tránsito (HTTPS), almacenamiento seguro en servidores protegidos y control de acceso restringido.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">9. Cookies</h2>
            <p>La Plataforma utiliza cookies esenciales para el funcionamiento del servicio (autenticación, preferencias de sesión). No utilizamos cookies de seguimiento publicitario de terceros.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">10. Menores de edad</h2>
            <p>La Plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos que un menor se ha registrado, eliminaremos su cuenta y datos personales.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">11. Transferencias internacionales de datos</h2>
            <p>Para la prestación de nuestros servicios, sus datos personales pueden ser transferidos y tratados fuera de Chile por los siguientes proveedores:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase (Estados Unidos):</strong> almacenamiento de datos y autenticación.</li>
              <li><strong>Resend (Estados Unidos):</strong> envío de correos electrónicos.</li>
              <li><strong>Flow.cl (Chile):</strong> procesamiento de pagos.</li>
            </ul>
            <p>Estos proveedores cuentan con medidas de seguridad adecuadas para la protección de datos personales conforme a estándares internacionales.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">12. Delegado de Protección de Datos</h2>
            <p>Para consultas específicas sobre protección de datos personales, puede contactar a nuestro Delegado de Protección de Datos en: <strong>dpo@rentu.cl</strong></p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">13. Cambios a esta política</h2>
            <p>Nos reservamos el derecho de modificar esta Política de Privacidad. Los cambios serán publicados en esta página con la fecha de actualización correspondiente.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-gray-800 mb-2">14. Contacto</h2>
            <p>Para consultas sobre esta Política de Privacidad o sobre el tratamiento de sus datos personales: <strong>rentu.contacto@gmail.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  )
}
