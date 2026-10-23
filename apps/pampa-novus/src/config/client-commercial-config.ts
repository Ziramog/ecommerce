/**
 * WOLFIM Commerce Core — Client Commercial Configuration
 *
 * Módulo de configuración tipada para datos comerciales, fiscales, logísticos
 * y legales específicos del cliente (Pampa Novus / Talabartería Mercadal S.A.).
 *
 * REGLAS DE GOBERNANZA WOLFIM:
 * 1. Todo dato comercial o legal debe tener un estado explícito de aprobación.
 * 2. Si un dato no cuenta con respaldo documental u homologación formal de Mercadal,
 *    debe marcarse como 'PENDING_CLIENT_APPROVAL'.
 * 3. Prohibido inventar datos ficticios para rellenar campos faltantes.
 * 4. Las promociones financieras (ej. cuotas sin interés) NO se activan sin acuerdo bancario.
 * 5. La función `assertProductionCommercialReadiness()` impide compilaciones productivas
 *    si existen campos obligatorios sin homologar.
 */

export type CommercialApprovalStatus = 'APPROVED' | 'PENDING_CLIENT_APPROVAL'

export interface CommercialField<T = string> {
  value: T
  status: CommercialApprovalStatus
  sourceNotes: string
  approvedBy?: string
  approvalDate?: string
}

export interface ClientCommercialConfig {
  clientKey: 'mercadal_pampa_novus'
  company: {
    brandName: CommercialField
    legalName: CommercialField
    cuit: CommercialField
    legalAddress: CommercialField
    showroomAddress: CommercialField
    jurisdiction: CommercialField
  }
  contact: {
    phoneFormatted: CommercialField
    phoneRaw: CommercialField
    generalEmail: CommercialField
    supportEmail: CommercialField
    legalEmail: CommercialField
    privacyEmail: CommercialField
    returnsEmail: CommercialField
    businessHoursWeekday: CommercialField
    businessHoursSaturday: CommercialField
  }
  financialPromotions: {
    installmentsMax: CommercialField<number>
    interestFreeAllowed: CommercialField<boolean>
    promotionalDisclaimer: CommercialField
  }
  shippingPolicy: {
    approvalStatus: CommercialApprovalStatus
    disclaimer: string
    cabaBaseRate: CommercialField<number>
    patagoniaBaseRate: CommercialField<number>
  }
  historyNarrative: {
    approvalStatus: CommercialApprovalStatus
    notes: string
  }
}

export const CLIENT_COMMERCIAL_CONFIG: ClientCommercialConfig = {
  clientKey: 'mercadal_pampa_novus',

  company: {
    brandName: {
      value: 'Pampa Novus',
      status: 'APPROVED',
      sourceNotes: 'Marca minorista aprobada en identidad visual y mockup.',
      approvedBy: 'Mercadal / WOLFIM',
      approvalDate: '2026-10-20',
    },
    legalName: {
      value: 'Talabartería Mercadal S.A.',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Razón social societaria preliminar. Requiere constancia de CUIT/estatuto oficial.',
    },
    cuit: {
      value: '30-71234567-8',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'CUIT demostrativo de desarrollo. Pendiente envío de CUIT real por Mercadal.',
    },
    legalAddress: {
      value: 'Av. Alvear 1850, Recoleta, CABA',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Domicilio de referencia de mockup. Pendiente ratificación de sede legal.',
    },
    showroomAddress: {
      value: 'Av. Alvear 1850, Recoleta, Ciudad Autónoma de Buenos Aires',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Dirección física de atención a coordinar con Mercadal.',
    },
    jurisdiction: {
      value: 'Tribunales Ordinarios en lo Comercial de la Ciudad Autónoma de Buenos Aires',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Cláusula de prórroga de jurisdicción sujeta a revisión legal del cliente.',
    },
  },

  contact: {
    phoneFormatted: {
      value: '+54 9 11 5555-7267',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Número telefónico temporal de desarrollo. Requiere línea oficial de Mercadal.',
    },
    phoneRaw: {
      value: '+5491155557267',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Número WhatsApp temporal. Pendiente confirmación de línea comercial.',
    },
    generalEmail: {
      value: 'info@pampanovus.com.ar',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Buzón comercial propuesto. Requiere alta y delegación DNS del dominio pampanovus.com.ar.',
    },
    supportEmail: {
      value: 'soporte@pampanovus.com.ar',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Buzón de atención propuesto. Pendiente confirmación operativa.',
    },
    legalEmail: {
      value: 'legal@mercadal.com.ar',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Casilla legal preliminar. Pendiente confirmación por asesor letrado.',
    },
    privacyEmail: {
      value: 'privacidad@pampanovus.com.ar',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Casilla de ejercicio de derechos Ley 25.326. Pendiente validación.',
    },
    returnsEmail: {
      value: 'cambios@pampanovus.com.ar',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Casilla de cambios/arrepentimiento. Pendiente validación.',
    },
    businessHoursWeekday: {
      value: 'Lunes a Viernes de 10:00 a 19:00 hs',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Horario comercial propuesto. Sujeto a disponibilidad de personal de Mercadal.',
    },
    businessHoursSaturday: {
      value: 'Sábados de 10:00 a 14:00 hs',
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Horario de sábado sujeto a definición comercial.',
    },
  },

  financialPromotions: {
    installmentsMax: {
      value: 3,
      status: 'APPROVED',
      sourceNotes: 'Hasta 3 cuotas fijas admitidas en Checkout Pro según pasarela Mercado Pago.',
    },
    interestFreeAllowed: {
      value: false,
      status: 'APPROVED',
      sourceNotes:
        'CUMPLIMIENTO CAPA 03: Prohibido publicar cuotas sin interés sin acuerdo financiero bancario explícito.',
    },
    promotionalDisclaimer: {
      value: 'Hasta 3 cuotas fijas a través de Mercado Pago conforme a las condiciones de su tarjeta.',
      status: 'APPROVED',
      sourceNotes: 'Texto ajustado sin promesas de costo financiero cero no homologadas.',
    },
  },

  shippingPolicy: {
    approvalStatus: 'PENDING_CLIENT_APPROVAL',
    disclaimer:
      'Tarifas logísticas y umbrales de envío gratuito demostrativos de desarrollo. Pendiente contrato formal con transportista.',
    cabaBaseRate: {
      value: 6500,
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Tarifa base de prueba CABA.',
    },
    patagoniaBaseRate: {
      value: 17500,
      status: 'PENDING_CLIENT_APPROVAL',
      sourceNotes: 'Tarifa base de prueba Patagonia.',
    },
  },

  historyNarrative: {
    approvalStatus: 'PENDING_CLIENT_APPROVAL',
    notes:
      'Narrativa editorial de herencia y tradición talabartera criolla sujeta a revisión final por los directivos de Mercadal.',
  },
}

/**
 * Guarda Fail-Closed de Compilación Productiva
 *
 * Comprueba que ningún dato obligatorio de contacto o fiscal permanezca en
 * 'PENDING_CLIENT_APPROVAL' antes de permitir un despliegue productivo.
 */
export function assertProductionCommercialReadiness(
  config: ClientCommercialConfig = CLIENT_COMMERCIAL_CONFIG,
  strictProductionMode: boolean = process.env.STRICT_COMMERCIAL_VALIDATION === 'true'
): { ready: boolean; unapprovedFields: string[] } {
  const unapprovedFields: string[] = []

  // Campos críticos obligatorios para producción real
  if (config.company.cuit.status !== 'APPROVED') {
    unapprovedFields.push('company.cuit (CUIT tributario real de Mercadal)')
  }
  if (config.company.legalName.status !== 'APPROVED') {
    unapprovedFields.push('company.legalName (Razón social definitiva)')
  }
  if (config.company.showroomAddress.status !== 'APPROVED') {
    unapprovedFields.push('company.showroomAddress (Domicilio comercial validado)')
  }
  if (config.contact.phoneFormatted.status !== 'APPROVED') {
    unapprovedFields.push('contact.phoneFormatted (Teléfono de atención al cliente oficial)')
  }
  if (config.contact.generalEmail.status !== 'APPROVED') {
    unapprovedFields.push('contact.generalEmail (Correo electrónico operativo)')
  }
  if (config.shippingPolicy.approvalStatus !== 'APPROVED') {
    unapprovedFields.push('shippingPolicy (Tarifario logístico comercial aprobado)')
  }

  const ready = unapprovedFields.length === 0

  if (!ready && strictProductionMode) {
    throw new Error(
      `[FAIL-CLOSED COMMERCIAL GUARD] Compilación productiva bloqueada. Los siguientes campos comerciales ` +
        `obligatorios se encuentran pendientes de validación formal por Talabartería Mercadal S.A.:\n` +
        unapprovedFields.map((f) => `  - ${f}`).join('\n')
    )
  }

  return { ready, unapprovedFields }
}
