export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { accountSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const accounts = await prisma.account.findMany({
    where: { userId: auth.userId },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json(accounts)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = accountSchema.parse(body)

    const account = await prisma.account.create({
      data: { ...data, userId: auth.userId },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
