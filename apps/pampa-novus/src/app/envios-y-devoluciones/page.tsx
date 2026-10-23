import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, RotateCcw, Package, ShieldCheck, MapPin, AlertCircle } from 'lucide-react'
import { CLIENT_COMMERCIAL_CONFIG } from '@/config/client-commercial-config'

export const metadata = {
  title: 'Envíos y Devoluciones | Pampa Novus',
  description:
    'Conozca nuestras políticas de despacho asegurado a todo el país, tiempos de entrega, tarifas y proceso ágil de cambios y devoluciones.',
}

export default function EnviosYDevolucionesPage() {
  const { shippingPolicy, company } = CLIENT_COMMERCIAL_CONFIG

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
              <Truck size={22} className="text-pn-cognac" />
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-pn-cognac">
              Logística Asegurada & Garantía
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-pn-espresso mb-4 tracking-tight">
            Política de Envíos, Cambios y Devoluciones
          </h1>

          <p className="text-sm text-pn-espresso/80 leading-relaxed font-light">
            En Pampa Novus cuidamos cada detalle desde el taller artesanal hasta la puerta de su hogar. Cada pieza de cuero y platería viaja protegida con embalaje especializado y cobertura asegurada.
          </p>

          {/* Aviso de Gobernanza Logística */}
          {shippingPolicy.approvalStatus === 'PENDING_CLIENT_APPROVAL' && (
            <div className="mt-4 bg-amber-50 border-l-4 border-amber-600 p-3 rounded-[2px] text-xs text-amber-950 flex items-start gap-2.5 font-light">
              <AlertCircle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Aviso de homologación tarifaria:</strong> Los valores aquí reflejados son demostrativos para el entorno de desarrollo y pruebas. Las tarifas finales y acuerdos con empresas de transporte serán homologados formalmente por {company.legalName.value} antes de la apertura comercial.
              </span>
            </div>
          )}
        </div>

        {/* Tarjetas Informativas Destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-6 border border-[#EFE8DE] rounded-[3px] shadow-sm">
            <div className="w-10 h-10 bg-pn-crema rounded-[2px] flex items-center justify-center text-pn-cognac mb-3 border border-pn-arena/40">
              <Truck size={20} />
            </div>
            <h3 className="font-serif text-base font-bold text-pn-espresso mb-1">
              Envío Bonificado
            </h3>
            <p className="text-xs text-pn-espresso/75 font-light leading-relaxed">
              En compras superiores al umbral promocional en CABA/GBA ($150.000 ARS) y resto del país ($200.000 / $250.000 ARS).
            </p>
          </div>

          <div className="bg-white p-6 border border-[#EFE8DE] rounded-[3px] shadow-sm">
            <div className="w-10 h-10 bg-pn-crema rounded-[2px] flex items-center justify-center text-pn-cognac mb-3 border border-pn-arena/40">
              <RotateCcw size={20} />
            </div>
            <h3 className="font-serif text-base font-bold text-pn-espresso mb-1">
              30 Días para Cambios
            </h3>
            <p className="text-xs text-pn-espresso/75 font-light leading-relaxed">
              Dispone de 30 días corridos para solicitar el cambio de talle, modelo o variante de cualquiera de nuestras piezas.
            </p>
          </div>

          <div className="bg-white p-6 border border-[#EFE8DE] rounded-[3px] shadow-sm">
            <div className="w-10 h-10 bg-pn-crema rounded-[2px] flex items-center justify-center text-pn-cognac mb-3 border border-pn-arena/40">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-serif text-base font-bold text-pn-espresso mb-1">
              Retiro en Showroom
            </h3>
            <p className="text-xs text-pn-espresso/75 font-light leading-relaxed">
              Retire sin costo en nuestro Showroom ({company.showroomAddress.value}) previa coordinación con su número de orden.
            </p>
          </div>
        </div>

        {/* Detalle de Zonas y Tiempos */}
        <div className="bg-white border border-[#EFE8DE] rounded-[3px] p-6 sm:p-10 shadow-sm space-y-8 text-sm text-pn-espresso/85 font-light leading-relaxed mb-8">
          <section className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <MapPin size={18} className="text-pn-cognac" />
              Zonas de Despacho y Tiempos Estimados
            </h2>
            <p>
              Los envíos se despachan tras la acreditación del pago. Las tarifas base orientativas se calculan según el código postal:
            </p>

            <div className="overflow-x-auto border border-[#EFE8DE] rounded-[2px]">
              <table className="min-w-full text-left text-xs divide-y divide-[#EFE8DE]">
                <thead className="bg-[#FAF7F2] text-pn-espresso font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Zona Geográfica</th>
                    <th className="py-3 px-4">Plazo de Entrega</th>
                    <th className="py-3 px-4">Tarifa de Prueba</th>
                    <th className="py-3 px-4">Envío Sin Cargo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DE] font-light">
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-pn-espresso">CABA (Ciudad Autónoma de Buenos Aires)</td>
                    <td className="py-2.5 px-4">1 a 2 días hábiles</td>
                    <td className="py-2.5 px-4">${shippingPolicy.cabaBaseRate.value.toLocaleString('es-AR')} ARS</td>
                    <td className="py-2.5 px-4 text-emerald-800 font-medium">Desde $150.000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-pn-espresso">Gran Buenos Aires (GBA)</td>
                    <td className="py-2.5 px-4">2 a 3 días hábiles</td>
                    <td className="py-2.5 px-4">$8.500 ARS</td>
                    <td className="py-2.5 px-4 text-emerald-800 font-medium">Desde $150.000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-pn-espresso">Región Centro (Santa Fe, Córdoba, Entre Ríos, La Pampa)</td>
                    <td className="py-2.5 px-4">3 a 5 días hábiles</td>
                    <td className="py-2.5 px-4">$11.500 ARS</td>
                    <td className="py-2.5 px-4 text-emerald-800 font-medium">Desde $200.000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-pn-espresso">Región Cuyo (Mendoza, San Juan, San Luis)</td>
                    <td className="py-2.5 px-4">4 a 6 días hábiles</td>
                    <td className="py-2.5 px-4">$13.500 ARS</td>
                    <td className="py-2.5 px-4 text-emerald-800 font-medium">Desde $200.000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-pn-espresso">Noroeste (NOA) y Noreste (NEA)</td>
                    <td className="py-2.5 px-4">4 a 7 días hábiles</td>
                    <td className="py-2.5 px-4">$14.500 ARS</td>
                    <td className="py-2.5 px-4 text-emerald-800 font-medium">Desde $200.000</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-pn-espresso">Patagonia Argentina y Tierra del Fuego</td>
                    <td className="py-2.5 px-4">5 a 9 días hábiles</td>
                    <td className="py-2.5 px-4">${shippingPolicy.patagoniaBaseRate.value.toLocaleString('es-AR')} ARS</td>
                    <td className="py-2.5 px-4 text-emerald-800 font-medium">Desde $250.000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-pn-espresso/60 italic font-light">
              * Las tarifas aquí expresadas son ilustrativas y pueden variar en función del peso y dimensiones de monturas o bultos especiales. La cotización se calcula de forma autoritativa en el checkout.
            </p>
          </section>

          {/* Proceso de Cambio y Devolución */}
          <section className="space-y-4 pt-4 border-t border-[#EFE8DE]">
            <h2 className="font-serif text-xl font-bold text-pn-espresso flex items-center gap-2">
              <Package size={18} className="text-pn-cognac" />
              Procedimiento para Cambios y Devoluciones
            </h2>

            <div className="space-y-3">
              <div className="bg-[#FAF7F2] p-4 rounded-[2px] border border-[#EFE8DE]">
                <h4 className="font-medium text-pn-espresso text-xs uppercase tracking-wider mb-1">
                  1. Cambios de Modelo o Talle (30 Días)
                </h4>
                <p className="text-xs text-pn-espresso/80 font-light">
                  Si necesita cambiar el talle de un cinturón o prefiere otro modelo de apero, contáctenos para coordinar el reemplazo de la pieza. El producto devuelto debe encontrarse en perfectas condiciones y con sus embalajes originales.
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-4 rounded-[2px] border border-[#EFE8DE]">
                <h4 className="font-medium text-pn-espresso text-xs uppercase tracking-wider mb-1">
                  2. Devolución por Arrepentimiento (10 Días Ley 24.240 y Disp. 954/2025)
                </h4>
                <p className="text-xs text-pn-espresso/80 font-light">
                  Si desea revocar la compra y solicitar el reembolso total de su dinero, puede ejercer su derecho legal sin costo alguno dentro de los 10 días corridos de recibido el producto a través de nuestro formulario oficial.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Botón de Arrepentimiento */}
        <div className="bg-pn-espresso text-pn-crema p-6 rounded-[3px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-serif text-base font-bold text-white mb-1">
              Revocación de Compra Online (Ley 24.240)
            </h4>
            <p className="text-xs text-pn-arena font-light">
              Haga clic aquí para solicitar el retiro gratuito y reintegro total de su pedido.
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
