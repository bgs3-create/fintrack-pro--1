import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const budget = await prisma.budget.findFirst({ where: { id: params.id, userId: auth.userId } })
  if (!budget) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  await prisma.budget.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
