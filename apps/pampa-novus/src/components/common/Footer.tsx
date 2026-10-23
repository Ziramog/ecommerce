import React from 'react'
import Link from 'next/link'
import { PampaNovusLogo } from '@/components/brand/PampaNovusLogo'
import { ShieldCheck, Truck, CreditCard, RotateCcw, ShieldAlert, ArrowRight } from 'lucide-react'
import { CLIENT_COMMERCIAL_CONFIG } from '@/config/client-commercial-config'

export function Footer() {
  const { company, financialPromotions } = CLIENT_COMMERCIAL_CONFIG

  return (
    <footer id="contacto" className="bg-pn-espresso text-pn-crema/90 pt-10 pb-8 border-t border-pn-marron/40 font-sans">
      {/* 4 Insignias de Valor */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 mb-9">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 py-5 border-y border-pn-marron/30">
          <div className="flex items-center space-x-3.5">
            <Truck className="w-5 h-5 text-pn-arena flex-shrink-0" strokeWidth={1.75} />
            <div>
              <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Envío Asegurado</h4>
              <p className="text-[11px] text-pn-arena/85">Despacho a todo el país</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <CreditCard className="w-5 h-5 text-pn-arena flex-shrink-0" strokeWidth={1.75} />
            <div>
              <h4 className="text-white text-xs uppercase tracking-wider font-semibold">
                Hasta {financialPromotions.installmentsMax.value} Cuotas
              </h4>
              <p className="text-[11px] text-pn-arena/85">
                {financialPromotions.interestFreeAllowed.value ? 'Sin interés' : 'Vía Mercado Pago'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <ShieldCheck className="w-5 h-5 text-pn-arena flex-shrink-0" strokeWidth={1.75} />
            <div>
              <h4 className="text-white text-xs uppercase tracking-wider font-semibold">Garantía de Origen</h4>
              <p className="text-[11px] text-pn-arena/85">Cuero y plata genuinos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5">
            <RotateCcw className="w-5 h-5 text-pn-arena flex-shrink-0" strokeWidth={1.75} />
            <div>
              <h4 className="text-white text-xs uppercase tracking-wider font-semibold">30 Días de Cambio</h4>
              <p className="text-[11px] text-pn-arena/85">Satisfacción garantizada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Franja Regulatoria Oficial: Botón de Arrepentimiento (Disposición 954/2025 - Res. 424/2020 - Ley 24.240) */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 mb-9">
        <div className="bg-pn-marron/40 border border-pn-arena/30 rounded-[2px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-pn-crema/10 rounded-[2px] text-pn-arena flex-shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-pn-arena font-semibold block">
                Defensa del Consumidor · Disp. 954/2025 & Ley 24.240 Art. 34
              </span>
              <p className="text-xs text-pn-crema/90 font-light">
                Derecho a revocar su compra online dentro de los 10 días corridos de recibido el producto sin costo alguno.
              </p>
            </div>
          </div>

          <Link
            href="/arrepentimiento"
            className="flex-shrink-0 bg-pn-crema text-pn-espresso hover:bg-white px-5 py-2.5 rounded-[2px] text-xs uppercase tracking-[0.16em] font-semibold transition-colors flex items-center gap-2"
          >
            <span>Botón de Arrepentimiento</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-9">
          {/* Identidad de Marca */}
          <div className="md:col-span-5 pr-0 md:pr-6">
            <div className="mb-3.5">
              <PampaNovusLogo variant="horizontal" theme="white" height={28} />
            </div>
            <p className="text-[13px] leading-relaxed text-pn-crema/85 mb-4 font-light max-w-sm">
              La consagración contemporánea de la talabartería criolla. Cada pieza refleja la maestría de artesanos que forjan la nobleza del cuero y la plata con orgullo nacional.
            </p>
            <div className="text-xs text-pn-arena/85 uppercase tracking-widest font-medium">
              Hecho con maestría en Argentina
            </div>
          </div>

          {/* Colección */}
          <div className="md:col-span-2 col-span-6">
            <h4 className="text-white text-xs uppercase tracking-[0.16em] font-semibold mb-3.5">
              Colección
            </h4>
            <ul className="space-y-2.5 text-[13px] text-pn-crema/80 font-light">
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

          {/* Atención y Legal */}
          <div className="md:col-span-2 col-span-6">
            <h4 className="text-white text-xs uppercase tracking-[0.16em] font-semibold mb-3.5">
              Atención & Legal
            </h4>
            <ul className="space-y-2.5 text-[13px] text-pn-crema/80 font-light">
              <li>
                <Link href="/historia" className="hover:text-white transition-colors">
                  Nuestra Historia
                </Link>
              </li>
              <li>
                <Link href="/envios-y-devoluciones" className="hover:text-white transition-colors">
                  Envíos & Tarifas
                </Link>
              </li>
              <li>
                <Link href="/envios-y-devoluciones" className="hover:text-white transition-colors">
                  Garantía & Cambios
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Showroom & Contacto
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">
                  Bases de Contratación
                </Link>
              </li>
            </ul>
          </div>

          {/* Unidad B2B Institucional */}
          <div className="md:col-span-3">
            <div className="bg-pn-marron/30 border border-pn-marron/50 p-4 rounded-[2px]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-pn-arena font-semibold block mb-1">
                Portal Mayorista Exclusivo
              </span>
              <h5 className="font-serif text-sm font-bold text-white mb-1.5">
                Talabartería Mercadal (B2B)
              </h5>
              <p className="text-xs text-pn-crema/80 mb-3 font-light leading-relaxed">
                Escalas por volumen y cotizaciones (RFQ) para comercios y clubes ecuestres.
              </p>
              <a
                href="http://localhost:3001"
                className="inline-block text-[11px] uppercase tracking-[0.16em] text-pn-crema hover:text-white font-medium underline underline-offset-4 transition-colors"
              >
                Acceder al Portal B2B →
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar con Identificación y Alertas de Homologación */}
        <div className="pt-6 border-t border-pn-marron/30 flex flex-col sm:flex-row justify-between items-center text-xs text-pn-arena/70">
          <p>
            © {new Date().getFullYear()} {company.brandName.value} — Canal minorista de {company.legalName.value}.{' '}
            {company.cuit.status === 'APPROVED' ? (
              <span>CUIT {company.cuit.value}.</span>
            ) : (
              <span className="text-amber-300/80 italic font-mono text-[10px]">
                [CUIT en trámite de homologación comercial]
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-4 mt-3 sm:mt-0">
            <Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/terminos-y-condiciones#privacidad" className="hover:text-white transition-colors">
              Privacidad de Datos
            </Link>
            <Link href="/arrepentimiento" className="hover:text-white transition-colors font-medium text-pn-arena">
              Botón de Arrepentimiento
            </Link>
            <a
              href="https://www.argentina.gob.ar/defensadelconsumidor"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Defensa del Consumidor
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
