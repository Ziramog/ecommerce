import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Scale, ShieldCheck, FileText, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Términos y Condiciones de Venta | Pampa Novus',
  description:
    'Términos, condiciones generales de contratación y derechos del consumidor aplicables a la tienda online Pampa Novus de Talabartería Mercadal S.A.',
}

export default function TerminosYCondicionesPage() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Retorno */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-xs uppercase tracking-[0.16em] text-pn-cognac hover:text-pn-espresso transition-colors font-medium"
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Volver a la Tienda
          </Link>
        </div>

        {/* Encabezado */}
        <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-10 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="p-2 bg-pn-crema text-pn-espresso rounded-[2px] border border-pn-arena/50">
              <Scale size={22} className="text-pn-cognac" />
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-pn-cognac">
              Marco Jurídico de Contratación
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pn-espresso mb-4 tracking-tight">
            Términos y Condiciones Generales
          </h1>

          <p className="text-xs text-pn-espresso/70 font-light">
            Última actualización: 23 de octubre de 2026 · Versión 1.2
          </p>
        </div>

        {/* Disclaimer / Aviso Legal de Aprobación */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-[2px] mb-8 text-xs text-amber-950 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
          <p className="font-light leading-relaxed">
            <strong>Nota institucional de gobernanza:</strong> El presente documento constituye las bases modelo de contratación electrónica para el canal minorista Pampa Novus. Toda cláusula queda supeditada a la revisión y aprobación formal final por parte de la asesoría legal corporativa de <strong>Talabartería Mercadal S.A.</strong> antes de su plena vigencia en producción.
          </p>
        </div>

        {/* Cuerpo del Contrato */}
        <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-10 shadow-sm space-y-8 text-sm text-pn-espresso/85 font-light leading-relaxed">
          {/* Sección 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <span className="text-pn-cognac font-mono text-sm">01.</span> Identificación de la Empresa y Titularidad
            </h2>
            <p>
              El presente sitio web y la marca comercial <strong>Pampa Novus</strong> constituyen la unidad de venta minorista directa (B2C) de <strong>Talabartería Mercadal S.A.</strong>, sociedad anónima legalmente constituida bajo las leyes de la República Argentina, con CUIT N° <strong>30-71234567-8</strong>, con domicilio legal en Av. Alvear 1850, Ciudad Autónoma de Buenos Aires, República Argentina.
            </p>
            <p>
              Toda comunicación formal, consulta o intimación legal debe cursarse a dicho domicilio o a la casilla oficial de notificación electrónica: <span className="font-medium text-pn-espresso">legal@mercadal.com.ar</span>.
            </p>
          </section>

          {/* Sección 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <span className="text-pn-cognac font-mono text-sm">02.</span> Ámbito de Aplicación y Capacidad para Contratar
            </h2>
            <p>
              Las compras efectuadas a través de Pampa Novus están destinadas exclusivamente a consumidores finales bajo el amparo de la <strong>Ley de Defensa del Consumidor N° 24.240</strong>. Solo podrán contratar personas humanas mayores de 18 años con plena capacidad jurídica para obligarse o personas jurídicas debidamente representadas.
            </p>
            <p>
              Las compras corporativas, mayoristas o con escala comercial por volumen deberán canalizarse de forma obligatoria y excluyente a través de nuestro portal mayorista privado: <strong>Talabartería Mercadal B2B</strong>.
            </p>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <span className="text-pn-cognac font-mono text-sm">03.</span> Precios, Moneda e Impuestos
            </h2>
            <p>
              Todos los precios exhibidos en Pampa Novus se encuentran expresados en <strong>Pesos Argentinos (ARS)</strong> e incluyen el Impuesto al Valor Agregado (IVA - alícuota general del 21%), salvo indicación expresa en contrario.
            </p>
            <p>
              Los precios no incluyen los costos de despacho y envío a domicilio, los cuales son calculados de manera autoritativa por nuestro servidor en el paso final del checkout según el destino geográfico del comprador, informándose con total transparencia antes de que el consumidor preste su consentimiento de pago.
            </p>
          </section>

          {/* Sección 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <span className="text-pn-cognac font-mono text-sm">04.</span> Medios de Pago y Seguridad Transaccional
            </h2>
            <p>
              Pampa Novus procesa sus cobros en línea mediante pasarelas de pago auditadas y certificadas PCI-DSS (Mercado Pago Checkout Pro) y transferencias bancarias directas:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Mercado Pago:</strong> Permite tarjetas de crédito (Visa, Mastercard, Cabal), tarjetas de débito y dinero en cuenta. Los planes de cuotas se rigen por los acuerdos comerciales vigentes al momento del checkout.
              </li>
              <li>
                <strong>Transferencia Bancaria:</strong> El pedido se reserva temporalmente por 48 horas hábiles hasta la acreditación efectiva de los fondos en la cuenta bancaria de Talabartería Mercadal S.A.
              </li>
            </ul>
            <p>
              La confirmación definitiva de la compra se encuentra sujeta a la aprobación de la entidad emisora y a los controles antifraude del backend de Medusa 2.
            </p>
          </section>

          {/* Sección 5 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <span className="text-pn-cognac font-mono text-sm">05.</span> Envíos, Despachos y Recepción
            </h2>
            <p>
              Efectuamos despachos a todo el territorio de la República Argentina mediante empresas de transporte especializadas con póliza de seguro sobre mercadería en tránsito. Los plazos de entrega estimados comienzan a computarse a partir de la acreditación fehaciente del pago y la preparación del paquete:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>CABA y Gran Buenos Aires: 24 a 72 horas hábiles.</li>
              <li>Región Centro y Cuyo: 3 a 5 días hábiles.</li>
              <li>Noroeste (NOA), Noreste (NEA) y Patagonia: 5 a 9 días hábiles.</li>
            </ul>
            <p>
              El paquete debe ser recibido por una persona mayor de 18 años con documento de identidad y firma de remito de entrega.
            </p>
          </section>

          {/* Sección 6 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <span className="text-pn-cognac font-mono text-sm">06.</span> Derecho de Revocación y Botón de Arrepentimiento
            </h2>
            <p>
              En estricto cumplimiento del <strong>Artículo 34 de la Ley 24.240</strong> y la <strong>Resolución 424/2020 de la Secretaría de Comercio Interior</strong>, el consumidor tiene la facultad irrenunciable de revocar la compra durante el plazo de <strong>10 (diez) días corridos</strong> computados desde la recepción efectiva del producto.
            </p>
            <p>
              Para ejercer este derecho, el cliente podrá utilizar en cualquier momento el{' '}
              <Link href="/arrepentimiento" className="font-medium text-pn-cognac underline hover:text-pn-espresso">
                Botón de Arrepentimiento
              </Link>{' '}
              disponible de manera permanente y visible en nuestro sitio, obteniendo un código numérico identificador de su solicitud. Los gastos de devolución serán soportados íntegramente por Talabartería Mercadal S.A.
            </p>
          </section>

          {/* Sección 7 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <span className="text-pn-cognac font-mono text-sm">07.</span> Garantía Legal y Naturaleza de las Piezas Artesanales
            </h2>
            <p>
              Conforme al Artículo 11 de la Ley 24.240, todos nuestros productos gozan de una <strong>garantía legal de 6 (seis) meses</strong> a partir de la entrega contra cualquier defecto de confección, costura o materiales no atribuibles al uso indebido.
            </p>
            <p>
              <strong>Particularidad de los materiales nobles:</strong> Nuestras piezas son elaboradas con cueros vacunos y de carpincho de curtido vegetal y platería cincelada a mano. Las variaciones leves en tonalidad, marcas naturales del cuero o vetas son testimonios de autenticidad de la materia prima y no constituyen defectos de fabricación.
            </p>
          </section>

          {/* Sección 8 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <span className="text-pn-cognac font-mono text-sm">08.</span> Protección de Datos Personales
            </h2>
            <p>
              Talabartería Mercadal S.A. cumple cabalmente con la <strong>Ley de Protección de Datos Personales N° 25.326</strong>. Los datos suministrados por los clientes son utilizados exclusivamente para la gestión de pedidos, facturación y envíos, bajo estrictos estándares de seguridad y confidencialidad. Los titulares podrán ejercer sus derechos de acceso, rectificación y supresión enviando un correo a <span className="font-medium text-pn-espresso">privacidad@pampanovus.com.ar</span>.
            </p>
          </section>

          {/* Sección 9 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <span className="text-pn-cognac font-mono text-sm">09.</span> Jurisdicción y Legislación Aplicable
            </h2>
            <p>
              El presente contrato se rige exclusivamente por las leyes vigentes de la República Argentina. Ante cualquier divergencia que no pueda ser resuelta de mutuo acuerdo, las partes se someten a la competencia de los Tribunales Ordinarios en lo Comercial de la Ciudad Autónoma de Buenos Aires, sin perjuicio de las facultades que asisten al consumidor ante los organismos competentes en materia de Defensa del Consumidor (Ley 24.240).
            </p>
          </section>
        </div>

        {/* Enlace al botón de arrepentimiento */}
        <div className="mt-8 bg-pn-espresso text-pn-crema p-6 rounded-[3px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-serif text-base font-bold text-white mb-1">
              ¿Desea revocar una compra reciente?
            </h4>
            <p className="text-xs text-pn-arena font-light">
              Acceda a nuestro formulario oficial para gestionar su solicitud en un solo paso y sin costo.
            </p>
          </div>
          <Link
            href="/arrepentimiento"
            className="flex-shrink-0 bg-pn-crema text-pn-espresso hover:bg-white px-5 py-2.5 rounded-[2px] text-xs uppercase tracking-[0.14em] font-semibold transition-colors"
          >
            Botón de Arrepentimiento →
          </Link>
        </div>
      </div>
    </div>
  )
}
