import React from 'react'
import Link from 'next/link'
import { PampaNovusLogo } from '@/components/brand/PampaNovusLogo'
import { ShieldCheck, Truck, CreditCard, RotateCcw } from 'lucide-react'

export function Footer() {
  return (
    <footer id="contacto" className="bg-pn-espresso text-pn-crema/80 pt-10 pb-8 border-t border-pn-marron/30 font-sans">
      {/* 4 Insignias de Valor en una fila compacta */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-5 border-y border-pn-marron/25">
          <div className="flex items-center space-x-3">
            <Truck className="w-5 h-5 text-pn-arena flex-shrink-0" strokeWidth={1.6} />
            <div>
              <h4 className="text-white text-[11px] uppercase tracking-wider font-semibold">Envío Asegurado</h4>
              <p className="text-[10px] text-pn-arena/70">Despacho a todo el país</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-pn-arena flex-shrink-0" strokeWidth={1.6} />
            <div>
              <h4 className="text-white text-[11px] uppercase tracking-wider font-semibold">Hasta 3 Cuotas</h4>
              <p className="text-[10px] text-pn-arena/70">Sin interés bancarias</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-pn-arena flex-shrink-0" strokeWidth={1.6} />
            <div>
              <h4 className="text-white text-[11px] uppercase tracking-wider font-semibold">Garantía de Origen</h4>
              <p className="text-[10px] text-pn-arena/70">Cuero y plata genuinos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <RotateCcw className="w-5 h-5 text-pn-arena flex-shrink-0" strokeWidth={1.6} />
            <div>
              <h4 className="text-white text-[11px] uppercase tracking-wider font-semibold">30 Días de Cambio</h4>
              <p className="text-[10px] text-pn-arena/70">Satisfacción garantizada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links — Altura compacta */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Identidad de Marca */}
          <div className="md:col-span-5 pr-0 md:pr-6">
            <div className="mb-3">
              <PampaNovusLogo variant="horizontal" theme="white" height={28} />
            </div>
            <p className="text-xs leading-relaxed text-pn-crema/70 mb-4 font-light max-w-sm">
              La consagración contemporánea de la talabartería criolla. Cada pieza refleja la maestría de artesanos que forjan la nobleza del cuero y la plata con orgullo nacional.
            </p>
            <div className="text-[10px] text-pn-arena/70 uppercase tracking-widest font-medium">
              Hecho con maestría en Argentina
            </div>
          </div>

          {/* Colección */}
          <div className="md:col-span-2 col-span-6">
            <h4 className="text-white text-[11px] uppercase tracking-[0.18em] font-semibold mb-3">
              Colección
            </h4>
            <ul className="space-y-2 text-xs text-pn-crema/70 font-light">
              <li>
                <Link href="/catalogo?categoria=monturas" className="hover:text-white transition-colors">
                  Monturas Criollas
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=accesorios" className="hover:text-white transition-colors">
                  Bozales & Riendas
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=marroquineria" className="hover:text-white transition-colors">
                  Cinturones & Cuero
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=campo" className="hover:text-white transition-colors">
                  Aperos de Campo
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=regalos" className="hover:text-white transition-colors">
                  Regalos de Autor
                </Link>
              </li>
            </ul>
          </div>

          {/* Atención al Cliente */}
          <div className="md:col-span-2 col-span-6">
            <h4 className="text-white text-[11px] uppercase tracking-[0.18em] font-semibold mb-3">
              Atención
            </h4>
            <ul className="space-y-2 text-xs text-pn-crema/70 font-light">
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">
                  Guía de Medidas
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">
                  Cuidado del Cuero
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">
                  Política de Envíos
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">
                  Garantía y Devolución
                </Link>
              </li>
            </ul>
          </div>

          {/* Unidad B2B Institucional */}
          <div className="md:col-span-3">
            <div className="bg-pn-marron/25 border border-pn-marron/40 p-4 rounded-[2px]">
              <span className="text-[9px] uppercase tracking-[0.2em] text-pn-arena font-semibold block mb-1">
                Portal Mayorista Exclusivo
              </span>
              <h5 className="font-serif text-xs font-bold text-white mb-1.5">
                Talabartería Mercadal (B2B)
              </h5>
              <p className="text-[11px] text-pn-crema/70 mb-2.5 font-light leading-relaxed">
                Escalas por volumen y cotizaciones (RFQ) para comercios y clubes ecuestres.
              </p>
              <a
                href="http://localhost:3001"
                className="inline-block text-[10px] uppercase tracking-[0.16em] text-pn-crema hover:text-white font-medium underline underline-offset-4 transition-colors"
              >
                Acceder al Portal B2B →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-pn-marron/25 flex flex-col sm:flex-row justify-between items-center text-[11px] text-pn-arena/50">
          <p>© {new Date().getFullYear()} Pampa Novus — Canal minorista de Talabartería Mercadal. Todos los derechos reservados.</p>
          <div className="flex space-x-5 mt-3 sm:mt-0">
            <span>Términos y Condiciones</span>
            <span>Privacidad de Datos</span>
            <span>Defensa del Consumidor</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
