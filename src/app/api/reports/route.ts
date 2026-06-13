import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const now = new Date()
  const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1))
  const year = parseInt(searchParams.get('year') || String(now.getFullYear()))

  const start = startOfMonth(new Date(year, month - 1))
  const end = endOfMonth(new Date(year, month - 1))

  // Daily cashflow
  const days = eachDayOfInterval({ start, end })
  const dailyCashflow = await Promise.all(
    days.map(async (day) => {
      const dayStart = new Date(day.setHours(0, 0, 0, 0))
      const dayEnd = new Date(day.setHours(23, 59, 59, 999))

      const [inc, exp] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId: auth.userId, type: 'income', date: { gte: dayStart, lte: dayEnd } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId: auth.userId, type: 'expense', date: { gte: dayStart, lte: dayEnd } },
          _sum: { amount: true },
        }),
      ])

      return {
        date: format(dayStart, 'dd'),
        income: inc._sum.amount || 0,
        expense: exp._sum.amount || 0,
      }
    })
  )

  // Category breakdown with percentages
  const expensesByCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId: auth.userId, type: 'expense', date: { gte: start, lte: end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  })

  const totalExpense = expensesByCategory.reduce((s, c) => s + (c._sum.amount || 0), 0)

  const categoryDetails = await Promise.all(
    expensesByCategory.map(async (c) => {
      const cat = await prisma.category.findUnique({
        where: { id: c.categoryId },
        select: { name: true, color: true, icon: true },
      })
      const amount = c._sum.amount || 0
      return {
        name: cat?.name || 'Lainnya',
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        color: cat?.color || '#64748b',
        icon: cat?.icon || 'tag',
      }
    })
  )

  // Income by category
  const incomesByCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId: auth.userId, type: 'income', date: { gte: start, lte: end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  })

  const totalIncome = incomesByCategory.reduce((s, c) => s + (c._sum.amount || 0), 0)

  const incomeCategoryDetails = await Promise.all(
    incomesByCategory.map(async (c) => {
      const cat = await prisma.category.findUnique({
        where: { id: c.categoryId },
        select: { name: true, color: true, icon: true },
      })
      const amount = c._sum.amount || 0
      return {
        name: cat?.name || 'Lainnya',
        amount,
        percentage: totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0,
        color: cat?.color || '#10b981',
      }
    })
  )

  // All transactions for this period
  const transactions = await prisma.transaction.findMany({
    where: { userId: auth.userId, date: { gte: start, lte: end } },
    include: {
      category: { select: { name: true, color: true, icon: true } },
      account: { select: { name: true } },
    },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json({
    period: { month, year, start, end },
    summary: { totalIncome, totalExpense, profit: totalIncome - totalExpense },
    dailyCashflow,
    expensesByCategory: categoryDetails,
    incomesByCategory: incomeCategoryDetails,
    transactions,
  })
}
