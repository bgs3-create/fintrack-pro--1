import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

const DEFAULT_CATEGORIES = [
  { name: 'Gaji', type: 'income', icon: 'briefcase', color: '#10b981' },
  { name: 'Freelance', type: 'income', icon: 'code-bracket', color: '#6366f1' },
  { name: 'Investasi', type: 'income', icon: 'chart-bar', color: '#f59e0b' },
  { name: 'Bonus', type: 'income', icon: 'gift', color: '#ec4899' },
  { name: 'Makanan', type: 'expense', icon: 'cake', color: '#ef4444' },
  { name: 'Transportasi', type: 'expense', icon: 'truck', color: '#f97316' },
  { name: 'Belanja', type: 'expense', icon: 'shopping-bag', color: '#8b5cf6' },
  { name: 'Hiburan', type: 'expense', icon: 'musical-note', color: '#ec4899' },
  { name: 'Tagihan', type: 'expense', icon: 'document-text', color: '#64748b' },
  { name: 'Kesehatan', type: 'expense', icon: 'heart', color: '#06b6d4' },
  { name: 'Pendidikan', type: 'expense', icon: 'academic-cap', color: '#3b82f6' },
]

const DEFAULT_ACCOUNTS = [
  { name: 'Kas Tunai', type: 'kas', balance: 0, color: '#f59e0b', icon: 'banknotes', isDefault: true },
  { name: 'Bank', type: 'bank', balance: 0, color: '#3b82f6', icon: 'building-library' },
  { name: 'E-Wallet', type: 'ewallet', balance: 0, color: '#10b981', icon: 'device-phone-mobile' },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        categories: { createMany: { data: DEFAULT_CATEGORIES.map(c => ({ ...c, isDefault: true })) } },
        accounts: { createMany: { data: DEFAULT_ACCOUNTS } },
      },
    })

    const token = await signToken({ userId: user.id, email: user.email, name: user.name })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    })

    response.cookies.set('fintrack-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
