import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { savingGoalSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const goals = await prisma.savingGoal.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(goals)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = savingGoalSchema.parse(body)

    const goal = await prisma.savingGoal.create({
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        userId: auth.userId,
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUserFromRequest(req)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, currentAmount } = body

    const goal = await prisma.savingGoal.findFirst({ where: { id, userId: auth.userId } })
    if (!goal) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    const updated = await prisma.savingGoal.update({
      where: { id },
      data: { currentAmount },
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
