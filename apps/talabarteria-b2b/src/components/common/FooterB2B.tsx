import React from 'react'
import Link from 'next/link'
import { Shield, Truck, FileCheck, Phone } from 'lucide-react'

export function FooterB2B() {
  return (
    <footer className="bg-navy-dark text-b2b-300 border-t border-navy-light text-xs">
      {/* Wholesale Guarantees Bar */}
      <div className="border-b border-navy-light/40 py-8 bg-navy/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-saddle-light shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Facturación A y B</h4>
              <p className="text-b2b-400 leading-relaxed text-xs">
                Emisión electrónica fiscal ARCA / AFIP automática con discriminación de IVA para Responsables Inscriptos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-saddle-light shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Logística Nacional</h4>
              <p className="text-b2b-400 leading-relaxed text-xs">
                Despachos consolidados por expreso al interior, palletizado y retiro por depósito central.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileCheck className="w-5 h-5 text-saddle-light shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Precios Escalonados</h4>
              <p className="text-b2b-400 leading-relaxed text-xs">
                Descuentos automáticos por volumen de compra en piezas de talabartería y paquetes de sogueo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-saddle-light shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Atención Mayorista</h4>
              <p className="text-b2b-400 leading-relaxed text-xs">
                Ejecutivo de cuentas asignado para seguimiento de órdenes, cotizaciones y pedidos especiales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <span className="font-heading text-lg font-bold text-white block mb-2 uppercase tracking-wider">
            Talabartería Mercadal S.A.
          </span>
          <p className="text-b2b-400 leading-relaxed mb-4">
            Fabricación tradicional y distribución mayorista de aperos criollos, monturas de trabajo, cueros curtidos, lonjas para sogueo y herrajes forjados.
          </p>
          <span className="text-[11px] text-b2b-500 block">
            Planta Industrial & Depósito: Av. Juan B. Justo 7820, CABA, Argentina.
          </span>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
            Operaciones B2B
          </h5>
          <ul className="space-y-2 text-b2b-400">
            <li>
              <Link href="/catalogo" className="hover:text-white transition-colors">
                Lista de Precios Mayorista
              </Link>
            </li>
            <li>
              <Link href="/pedido-rapido" className="hover:text-white transition-colors">
                Carga Masiva por SKU
              </Link>
            </li>
            <li>
              <Link href="/cotizacion" className="hover:text-white transition-colors">
                Solicitud de Cotización (RFQ)
              </Link>
            </li>
            <li>
              <Link href="/acceso" className="hover:text-white transition-colors">
                Apertura de Cuenta Comercial
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
            Condiciones Comerciales
          </h5>
          <p className="text-b2b-400 leading-relaxed mb-2">
            Mínimo de orden mayorista: 3 unidades combinadas o $200.000 ARS base.
          </p>
          <p className="text-b2b-400 leading-relaxed">
            Plazos de entrega habituales: 48/72 hs en productos con stock garantizado en almacén digital.
          </p>
        </div>
      </div>

      <div className="border-t border-navy-light/40 py-4 text-center text-b2b-500 text-[11px]">
        © {new Date().getFullYear()} Talabartería Mercadal — Todos los derechos reservados. Ventas exclusivas B2B bajo CUIT comercial.
      </div>
    </footer>
  )
}
