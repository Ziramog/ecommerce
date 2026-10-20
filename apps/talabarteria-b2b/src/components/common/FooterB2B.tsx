import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Truck, FileCheck2, Phone } from 'lucide-react'

export function FooterB2B() {
  return (
    <footer className="bg-[#18261E] text-[#D1DBD4] border-t border-[#23382C] text-xs font-sans">
      {/* Guarantees Bar */}
      <div className="border-b border-[#23382C] py-8 bg-[#142019]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#9AB3A1] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Facturación A y B</h4>
              <p className="text-[#A2B5A7] leading-relaxed text-xs">
                Emisión electrónica fiscal ARCA automática con discriminación de IVA para Responsables Inscriptos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-[#9AB3A1] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Logística Nacional</h4>
              <p className="text-[#A2B5A7] leading-relaxed text-xs">
                Despachos consolidados por expreso al interior, palletizado y logística puerta a puerta.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileCheck2 className="w-5 h-5 text-[#9AB3A1] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Precios Escalonados</h4>
              <p className="text-[#A2B5A7] leading-relaxed text-xs">
                Descuentos automáticos por volumen de compra (-10% y -20%) en piezas de talabartería y paquetes de sogueo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[#9AB3A1] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-white text-sm mb-1">Atención Mayorista</h4>
              <p className="text-[#A2B5A7] leading-relaxed text-xs">
                Mesa comercial y ejecutivo asignado para seguimiento de órdenes, cotizaciones y pedidos especiales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/images/brand/isologo-jm-transparent.png"
                alt="Isologo JM"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-white uppercase tracking-wider leading-tight">
                Talabartería José Mercadal S.A.
              </span>
              <span className="text-[9px] tracking-[0.2em] text-[#9AB3A1] uppercase font-semibold">
                Tradición & Artículos Ecuestres
              </span>
            </div>
          </div>
          <p className="text-[#A2B5A7] leading-relaxed mb-4 max-w-sm">
            Fabricación tradicional y distribución mayorista de aperos criollos, monturas de trabajo, cueros curtidos, lonjas para sogueo y equipamiento para polo, salto y turf.
          </p>
          <span className="text-[11px] text-[#7A9382] block">
            Planta Industrial & Depósito Central: Av. Juan B. Justo 7820, CABA, Argentina.
          </span>
        </div>

        <div className="md:col-span-3">
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
            Operaciones B2B
          </h5>
          <ul className="space-y-2 text-[#A2B5A7]">
            <li>
              <Link href="/catalogo" className="hover:text-white transition-colors">
                Catálogo & Lista de Precios
              </Link>
            </li>
            <li>
              <Link href="/pedido-rapido" className="hover:text-white transition-colors">
                Matriz de Pedido Rápido (SKU)
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

        <div className="md:col-span-4">
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
            Condiciones Comerciales
          </h5>
          <p className="text-[#A2B5A7] leading-relaxed mb-3">
            Venta restringida a clientes comerciales registrados y aprobados. Precios cotizados en Pesos Argentinos (ARS) sin IVA.
          </p>
          <div className="p-3 bg-[#142019] border border-[#23382C] rounded-lg">
            <span className="block text-[11px] font-mono text-[#D1DBD4]">
              CUIT: 30-58291472-4 • Responsable Inscripto
            </span>
            <span className="block text-[11px] text-[#A2B5A7] mt-0.5">
              Mesa Comercial: (011) 4892-1200 • consultas@talabarteriamercadal.com.ar
            </span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#23382C] py-4 bg-[#111A14] text-center text-[11px] text-[#7A9382]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Talabartería Mercadal S.A. Todos los derechos reservados.
          </span>
          <span className="text-[#A2B5A7]">
            Canal B2B conectado a Medusa 2 • Stock unificado por SKU
          </span>
        </div>
      </div>
    </footer>
  )
}
