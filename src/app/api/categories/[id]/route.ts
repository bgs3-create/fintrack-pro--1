import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const data = categorySchema.parse(body)
    const cat = await prisma.category.findFirst({ where: { id: params.id, userId: auth.userId } })
    if (!cat) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    const updated = await prisma.category.update({ where: { id: params.id }, data })
    return NextResponse.json(updated)
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const cat = await prisma.category.findFirst({ where: { id: params.id, userId: auth.userId } })
  if (!cat) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  if (cat.isDefault) return NextResponse.json({ error: 'Kategori default tidak bisa dihapus' }, { status: 400 })
  await prisma.category.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
