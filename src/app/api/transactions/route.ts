import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const categoryId = searchParams.get('categoryId')
  const accountId = searchParams.get('accountId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const sortBy = searchParams.get('sortBy') || 'date'
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

  const where: Record<string, unknown> = { userId: auth.userId }
  if (type) where.type = type
  if (categoryId) where.categoryId = categoryId
  if (accountId) where.accountId = accountId
  if (search) where.description = { contains: search }
  if (startDate || endDate) {
    where.date = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        account: { select: { id: true, name: true, type: true, color: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return NextResponse.json({
    transactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = transactionSchema.parse(body)

    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          ...data,
          date: new Date(data.date),
          userId: auth.userId,
        },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, type: true, color: true } },
        },
      })

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            [data.type === 'income' ? 'increment' : 'decrement']: data.amount,
          },
        },
      })

      // Update budget spent if expense
      if (data.type === 'expense') {
        const now = new Date(data.date)
        await tx.budget.updateMany({
          where: {
            userId: auth.userId,
            categoryId: data.categoryId,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
          },
          data: { spent: { increment: data.amount } },
        })
      }

      await tx.activityLog.create({
        data: {
          action: 'CREATE',
          entity: 'transaction',
          entityId: t.id,
          details: `${data.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}: ${data.description}`,
          userId: auth.userId,
        },
      })

      return t
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
