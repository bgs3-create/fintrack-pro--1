import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Nominal harus lebih dari 0'),
  description: z.string().min(1, 'Deskripsi wajib diisi').max(200),
  note: z.string().max(500).optional(),
  date: z.string(),
  categoryId: z.string().min(1, 'Pilih kategori'),
  accountId: z.string().min(1, 'Pilih akun'),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(50),
  type: z.enum(['income', 'expense', 'both']),
  icon: z.string().default('tag'),
  color: z.string().default('#6366f1'),
})

export const accountSchema = z.object({
  name: z.string().min(1, 'Nama akun wajib diisi').max(50),
  type: z.enum(['kas', 'bank', 'ewallet', 'custom']),
  balance: z.number().min(0, 'Saldo tidak boleh negatif'),
  color: z.string().default('#6366f1'),
  icon: z.string().default('wallet'),
})

export const budgetSchema = z.object({
  name: z.string().min(1, 'Nama budget wajib diisi'),
  amount: z.number().positive('Nominal harus lebih dari 0'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  alertAt: z.number().min(0).max(100).default(80),
  categoryId: z.string().min(1, 'Pilih kategori'),
})

export const savingGoalSchema = z.object({
  name: z.string().min(1, 'Nama target wajib diisi'),
  targetAmount: z.number().positive('Target harus lebih dari 0'),
  currentAmount: z.number().min(0).default(0),
  deadline: z.string().optional(),
  icon: z.string().default('piggy-bank'),
  color: z.string().default('#10b981'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type AccountInput = z.infer<typeof accountSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
export type SavingGoalInput = z.infer<typeof savingGoalSchema>
