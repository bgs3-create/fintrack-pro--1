import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/validations'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const transaction = await prisma.transaction.findFirst({
    where: { id: params.id, userId: auth.userId },
    include: {
      category: true,
      account: true,
    },
  })

  if (!transaction) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  return NextResponse.json(transaction)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = transactionSchema.parse(body)

    const old = await prisma.transaction.findFirst({
      where: { id: params.id, userId: auth.userId },
    })
    if (!old) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    const transaction = await prisma.$transaction(async (tx) => {
      // Revert old account balance
      await tx.account.update({
        where: { id: old.accountId },
        data: {
          balance: { [old.type === 'income' ? 'decrement' : 'increment']: old.amount },
        },
      })

      // Apply new account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: { [data.type === 'income' ? 'increment' : 'decrement']: data.amount },
        },
      })

      const t = await tx.transaction.update({
        where: { id: params.id },
        data: { ...data, date: new Date(data.date) },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, type: true, color: true } },
        },
      })

      await tx.activityLog.create({
        data: {
          action: 'UPDATE',
          entity: 'transaction',
          entityId: t.id,
          details: `Update: ${data.description}`,
          userId: auth.userId,
        },
      })

      return t
    })

    return NextResponse.json(transaction)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const transaction = await prisma.transaction.findFirst({
    where: { id: params.id, userId: auth.userId },
  })
  if (!transaction) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: transaction.accountId },
      data: {
        balance: {
          [transaction.type === 'income' ? 'decrement' : 'increment']: transaction.amount,
        },
      },
    })

    await tx.transaction.delete({ where: { id: params.id } })

    await tx.activityLog.create({
      data: {
        action: 'DELETE',
        entity: 'transaction',
        entityId: params.id,
        details: `Hapus: ${transaction.description}`,
        userId: auth.userId,
      },
    })
  })

  return NextResponse.json({ success: true })
}
