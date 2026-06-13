import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Current month totals
  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: auth.userId, type: 'income', date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: auth.userId, type: 'expense', date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
  ])

  const income = incomeAgg._sum.amount || 0
  const expense = expenseAgg._sum.amount || 0

  // All accounts balance
  const accounts = await prisma.account.findMany({
    where: { userId: auth.userId },
    select: { id: true, name: true, type: true, balance: true, color: true, icon: true },
  })
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

  // Last 6 months data
  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, async (_, i) => {
      const d = subMonths(now, 5 - i)
      const start = startOfMonth(d)
      const end = endOfMonth(d)

      const [inc, exp] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId: auth.userId, type: 'income', date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId: auth.userId, type: 'expense', date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ])

      return {
        month: format(d, 'MMM'),
        income: inc._sum.amount || 0,
        expense: exp._sum.amount || 0,
        profit: (inc._sum.amount || 0) - (exp._sum.amount || 0),
      }
    })
  )

  // Category breakdown (expenses)
  const categoryBreakdown = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId: auth.userId, type: 'expense', date: { gte: monthStart, lte: monthEnd } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 6,
  })

  const categoryDetails = await Promise.all(
    categoryBreakdown.map(async (c) => {
      const cat = await prisma.category.findUnique({
        where: { id: c.categoryId },
        select: { name: true, color: true, icon: true },
      })
      return {
        name: cat?.name || 'Lainnya',
        value: c._sum.amount || 0,
        color: cat?.color || '#64748b',
        icon: cat?.icon || 'tag',
      }
    })
  )

  // Recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: auth.userId },
    include: {
      category: { select: { name: true, color: true, icon: true } },
      account: { select: { name: true, type: true } },
    },
    orderBy: { date: 'desc' },
    take: 8,
  })

  // Budgets with progress
  const budgets = await prisma.budget.findMany({
    where: { userId: auth.userId, month: now.getMonth() + 1, year: now.getFullYear() },
    include: { category: { select: { name: true, color: true, icon: true } } },
    orderBy: { createdAt: 'asc' },
  })

  // Previous month comparison
  const prevStart = startOfMonth(subMonths(now, 1))
  const prevEnd = endOfMonth(subMonths(now, 1))
  const [prevInc, prevExp] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId: auth.userId, type: 'income', date: { gte: prevStart, lte: prevEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: auth.userId, type: 'expense', date: { gte: prevStart, lte: prevEnd } },
      _sum: { amount: true },
    }),
  ])

  const prevIncome = prevInc._sum.amount || 0
  const prevExpense = prevExp._sum.amount || 0

  return NextResponse.json({
    summary: {
      totalBalance,
      income,
      expense,
      profit: income - expense,
      incomeChange: prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0,
      expenseChange: prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : 0,
    },
    accounts,
    monthlyData,
    categoryBreakdown: categoryDetails,
    recentTransactions,
    budgets,
  })
}
