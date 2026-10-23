import { NextRequest, NextResponse } from 'next/server'
import { revocationStorage } from '@/lib/revocation-storage'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { fullName, dniOrCuit, email, phone, orderNumber, deliveryDate, productsToRevoke, reason } = body

    if (!fullName || !dniOrCuit || !email || !phone || !orderNumber || !deliveryDate || !productsToRevoke) {
      return NextResponse.json(
        {
          error: 'BAD_REQUEST',
          message: 'Todos los campos marcados como obligatorios deben completarse para procesar la revocación.',
        },
        { status: 400 }
      )
    }

    const claim = await revocationStorage.registerClaim({
      customer: {
        fullName: String(fullName).trim(),
        dniOrCuit: String(dniOrCuit).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
      },
      order: {
        orderNumber: String(orderNumber).trim(),
        deliveryDate: String(deliveryDate).trim(),
        productsToRevoke: String(productsToRevoke).trim(),
        reason: reason ? String(reason).trim() : undefined,
      },
    })

    return NextResponse.json(
      {
        success: true,
        claimId: claim.claimId,
        createdAt: claim.createdAt,
        status: claim.status,
        legalNotice:
          'Solicitud persistida y registrada en el libro administrativo interno conforme a la Disposición 954/2025 y Ley 24.240.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API Arrepentimiento] Error registering revocation claim:', error)
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'No se pudo registrar la solicitud en este momento. Por favor reintente o contacte a postventa.',
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Verificación de credencial administrativa u operador para consulta y trazabilidad
  const authHeader = req.headers.get('authorization')
  const operatorKey = req.headers.get('x-operator-key') || req.nextUrl.searchParams.get('key')
  const expectedKey = process.env.OPERATOR_ADMIN_KEY || 'mercadal_staging_audit_key_2026'

  if (operatorKey !== expectedKey && !authHeader?.includes(expectedKey)) {
    return NextResponse.json(
      {
        error: 'UNAUTHORIZED',
        message: 'Acceso restringido a operadores administrativos autorizados de Talabartería Mercadal S.A.',
      },
      { status: 401 }
    )
  }

  const claimId = req.nextUrl.searchParams.get('claimId')
  if (claimId) {
    const claim = revocationStorage.getClaimById(claimId)
    if (!claim) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Solicitud no encontrada.' }, { status: 404 })
    }
    return NextResponse.json({ success: true, claim })
  }

  const allClaims = revocationStorage.listClaims()
  return NextResponse.json({
    success: true,
    total: allClaims.length,
    claims: allClaims,
  })
}
