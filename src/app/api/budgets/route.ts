import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { budgetSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const now = new Date()
  const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1))
  const year = parseInt(searchParams.get('year') || String(now.getFullYear()))

  const budgets = await prisma.budget.findMany({
    where: { userId: auth.userId, month, year },
    include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(budgets)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = budgetSchema.parse(body)

    // Calculate current spent
    const start = new Date(data.year, data.month - 1, 1)
    const end = new Date(data.year, data.month, 0, 23, 59, 59)

    const spentAgg = await prisma.transaction.aggregate({
      where: {
        userId: auth.userId,
        type: 'expense',
        categoryId: data.categoryId,
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    })

    const budget = await prisma.budget.create({
      data: {
        ...data,
        spent: spentAgg._sum.amount || 0,
        userId: auth.userId,
      },
      include: { category: { select: { id: true, name: true, icon: true, color: true } } },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
