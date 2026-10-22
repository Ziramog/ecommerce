import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Headphones, Instagram, Facebook } from 'lucide-react'

export function FooterB2B() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#142019] text-[#D1DBD4] border-t border-[#23382C] text-xs font-sans">
      {/* Contenido Principal Agrupado en 4 Columnas */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Columna 1: Marca & Reseña Institucional (lg:col-span-4) */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3.5 mb-3.5">
              <div className="relative h-9 w-[65px] flex-shrink-0">
                <Image
                  src="/images/brand/isologo-jm-white.png"
                  alt="Isologo JM"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="relative h-6 w-44 mb-1">
                  <Image
                    src="/images/brand/logo-jose-mercadal-white.png"
                    alt="José Mercadal"
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <span className="text-[8.5px] tracking-[0.22em] text-[#9AB3A1] uppercase font-semibold">
                  Tradición · Calidad · Est. 1964
                </span>
              </div>
            </div>

            <p className="text-[#A2B5A7] leading-relaxed mb-4 text-[11px] max-w-sm">
              Equipamiento, talabartería y accesorios para comercios, veterinarias y profesionales del mundo ecuestre.
            </p>

            {/* Redes Sociales Oficiales */}
            <div className="flex items-center gap-3 text-[#A2B5A7]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded border border-[#23382C] flex items-center justify-center hover:text-white hover:border-[#9AB3A1] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded border border-[#23382C] flex items-center justify-center hover:text-white hover:border-[#9AB3A1] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Columna 2: Categorías Oficiales (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h5 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">
              Categorías
            </h5>
            <ul className="space-y-1.5 text-[11px] text-[#A2B5A7]">
              <li>
                <Link href="/catalogo?disciplina=polo" className="hover:text-white transition-colors">
                  Polo
                </Link>
              </li>
              <li>
                <Link href="/catalogo?disciplina=salto" className="hover:text-white transition-colors">
                  Salto
                </Link>
              </li>
              <li>
                <Link href="/catalogo?disciplina=turf" className="hover:text-white transition-colors">
                  Turf
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=Monturas" className="hover:text-white transition-colors">
                  Monturas
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=Aperos" className="hover:text-white transition-colors">
                  Aperos
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=Accesorios" className="hover:text-white transition-colors">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=Cuidado+del+cuero" className="hover:text-white transition-colors">
                  Cuidado del cuero
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=Herrajes" className="hover:text-white transition-colors">
                  Herrajes
                </Link>
              </li>
              <li>
                <Link href="/catalogo?categoria=Otros+productos" className="hover:text-white transition-colors">
                  Otros productos
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información Comercial (lg:col-span-2) */}
          <div className="lg:col-span-2">
            <h5 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">
              Información
            </h5>
            <ul className="space-y-1.5 text-[11px] text-[#A2B5A7]">
              <li>
                <Link href="#historia" className="hover:text-white transition-colors">
                  Sobre Mercadal
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">
                  Condiciones comerciales
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="hover:text-white transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/cotizacion" className="hover:text-white transition-colors">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/cotizacion" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto Comercial (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <h5 className="font-bold text-white text-[11px] uppercase tracking-wider mb-3">
              Contacto Comercial
            </h5>
            <ul className="space-y-2 text-[11px] text-[#A2B5A7]">
              <li className="flex items-center gap-2 text-white">
                <Headphones className="w-3.5 h-3.5 text-[#9AB3A1] flex-shrink-0" />
                <span>Atención mayorista</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#9AB3A1] flex-shrink-0" />
                <a
                  href="mailto:comercial@talabarteriamercadal.com.ar"
                  className="hover:text-white transition-colors truncate"
                >
                  comercial@talabarteriamercadal.com.ar
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#9AB3A1] flex-shrink-0" />
                <span>+54 9 351 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#9AB3A1] flex-shrink-0" />
                <span>Córdoba, Argentina</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barra Inferior de Copyright y Legales */}
      <div className="border-t border-[#23382C] py-3.5 bg-[#0F1813] text-[11px] text-[#7A9382]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {currentYear} Talabartería Mercadal S.A. Todos los derechos reservados.
          </span>
          <div className="flex items-center gap-4 text-[#A2B5A7]">
            <Link href="/cotizacion" className="hover:text-white transition-colors">
              Términos y condiciones
            </Link>
            <span className="text-[#3B5443]">|</span>
            <Link href="/cotizacion" className="hover:text-white transition-colors">
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
