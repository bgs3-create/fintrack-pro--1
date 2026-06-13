import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const goal = await prisma.savingGoal.findFirst({ where: { id: params.id, userId: auth.userId } })
  if (!goal) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  await prisma.savingGoal.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
