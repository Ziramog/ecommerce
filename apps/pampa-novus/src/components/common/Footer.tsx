import React from 'react'
import Link from 'next/link'
import { ShieldCheck, Truck, CreditCard, RotateCcw } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-pampa-950 text-pampa-300 pt-16 pb-12 border-t border-pampa-900 font-sans">
      {/* Value Badges Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-y border-pampa-900">
          <div className="flex items-center space-x-4">
            <Truck className="w-8 h-8 text-leather-light flex-shrink-0" />
            <div>
              <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Envío Seguro</h4>
              <p className="text-xs text-pampa-400 mt-1">Despacho asegurado a todo el país</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <CreditCard className="w-8 h-8 text-leather-light flex-shrink-0" />
            <div>
              <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Hasta 3 Cuotas</h4>
              <p className="text-xs text-pampa-400 mt-1">Con todas las tarjetas bancarias</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ShieldCheck className="w-8 h-8 text-leather-light flex-shrink-0" />
            <div>
              <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Garantía de Origen</h4>
              <p className="text-xs text-pampa-400 mt-1">Cueros y metales genuinos argentinos</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <RotateCcw className="w-8 h-8 text-leather-light flex-shrink-0" />
            <div>
              <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Cambios & Devolución</h4>
              <p className="text-xs text-pampa-400 mt-1">30 días de satisfacción garantizada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <span className="font-serif text-2xl font-bold tracking-[0.25em] text-white block uppercase mb-4">
              PAMPA NOVUS
            </span>
            <p className="text-xs leading-relaxed text-pampa-400 mb-6">
              La consagración contemporánea de la talabartería criolla. Cada pieza refleja la maestría de artesanos que forjan la nobleza del cuero y la plata con orgullo nacional.
            </p>
            <div className="text-[11px] text-pampa-500 uppercase tracking-widest font-medium">
              Hecho con maestría en Argentina
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold mb-5">Categorías</h4>
            <ul className="space-y-3 text-xs">
              <li><Link href="/catalogo" className="hover:text-leather-light transition-colors">Monturas Criollas</Link></li>
              <li><Link href="/catalogo" className="hover:text-leather-light transition-colors">Bozales & Cabezadas</Link></li>
              <li><Link href="/catalogo" className="hover:text-leather-light transition-colors">Cinturones de Carpincho</Link></li>
              <li><Link href="/catalogo" className="hover:text-leather-light transition-colors">Estribos & Herrajes</Link></li>
              <li><Link href="/catalogo" className="hover:text-leather-light transition-colors">Cuchillería & Vainas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold mb-5">Atención al Cliente</h4>
            <ul className="space-y-3 text-xs">
              <li><Link href="/" className="hover:text-leather-light transition-colors">Guía de Talles y Medidas</Link></li>
              <li><Link href="/" className="hover:text-leather-light transition-colors">Cuidado y Mantenimiento del Cuero</Link></li>
              <li><Link href="/" className="hover:text-leather-light transition-colors">Política de Envíos</Link></li>
              <li><Link href="/" className="hover:text-leather-light transition-colors">Garantía y Devoluciones</Link></li>
              <li><Link href="/" className="hover:text-leather-light transition-colors">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs uppercase tracking-[0.2em] font-bold mb-5">Unidad Corporativa</h4>
            <p className="text-xs text-pampa-400 mb-4 leading-relaxed">
              ¿Representás a un comercio, estancia o club ecuestre? Accedé a compras mayoristas con condiciones comerciales exclusivas.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] uppercase tracking-wider text-leather-light font-medium border border-leather/40 px-3 py-1.5 rounded">
                Portal Mayorista: Talabartería Mercadal (B2B)
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-pampa-900 flex flex-col sm:flex-row justify-between items-center text-xs text-pampa-500">
          <p>© {new Date().getFullYear()} Pampa Novus — Marca registrada de Mercadal Digital 360. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0 text-[11px]">
            <span>Términos y Condiciones</span>
            <span>Privacidad de Datos</span>
            <span>Defensa del Consumidor</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
