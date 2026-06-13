import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean DB
  await prisma.activityLog.deleteMany()
  await prisma.savingGoal.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.category.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create user
  const hashedPassword = await bcrypt.hash('password123', 12)
  const user = await prisma.user.create({
    data: {
      name: 'Ardiyansah',
      email: 'demo@fintrack.id',
      password: hashedPassword,
      currency: 'IDR',
    },
  })

  // Create accounts
  const kas = await prisma.account.create({
    data: { name: 'Kas Tunai', type: 'kas', balance: 2500000, color: '#f59e0b', icon: 'banknotes', isDefault: true, userId: user.id },
  })
  const bri = await prisma.account.create({
    data: { name: 'BRI Tabungan', type: 'bank', balance: 15750000, color: '#3b82f6', icon: 'building-library', userId: user.id },
  })
  const gopay = await prisma.account.create({
    data: { name: 'GoPay', type: 'ewallet', balance: 850000, color: '#10b981', icon: 'device-phone-mobile', userId: user.id },
  })
  const ovo = await prisma.account.create({
    data: { name: 'OVO', type: 'ewallet', balance: 320000, color: '#7c3aed', icon: 'device-phone-mobile', userId: user.id },
  })

  // Default categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Gaji', type: 'income', icon: 'briefcase', color: '#10b981', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Freelance', type: 'income', icon: 'code-bracket', color: '#6366f1', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Investasi', type: 'income', icon: 'chart-bar', color: '#f59e0b', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Bonus', type: 'income', icon: 'gift', color: '#ec4899', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Makanan', type: 'expense', icon: 'cake', color: '#ef4444', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Transportasi', type: 'expense', icon: 'truck', color: '#f97316', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Belanja', type: 'expense', icon: 'shopping-bag', color: '#8b5cf6', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Hiburan', type: 'expense', icon: 'musical-note', color: '#ec4899', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Tagihan', type: 'expense', icon: 'document-text', color: '#64748b', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Kesehatan', type: 'expense', icon: 'heart', color: '#06b6d4', isDefault: true, userId: user.id } }),
    prisma.category.create({ data: { name: 'Pendidikan', type: 'expense', icon: 'academic-cap', color: '#3b82f6', isDefault: true, userId: user.id } }),
  ])

  const [gaji, freelance, investasi, bonus, makanan, transportasi, belanja, hiburan, tagihan, kesehatan] = categories

  // Generate 3 months of transactions
  const now = new Date()
  const transactions = []

  for (let m = 2; m >= 0; m--) {
    const month = new Date(now.getFullYear(), now.getMonth() - m, 1)

    // Income transactions per month
    transactions.push(
      { type: 'income', amount: 8500000, description: 'Gaji Bulanan', date: new Date(month.getFullYear(), month.getMonth(), 1), categoryId: gaji.id, accountId: bri.id },
      { type: 'income', amount: 2000000, description: 'Proyek Website Client', date: new Date(month.getFullYear(), month.getMonth(), 5), categoryId: freelance.id, accountId: gopay.id },
      { type: 'income', amount: 350000, description: 'Dividen Reksa Dana', date: new Date(month.getFullYear(), month.getMonth(), 10), categoryId: investasi.id, accountId: bri.id },
    )

    if (m === 1) {
      transactions.push({ type: 'income', amount: 1500000, description: 'Bonus Proyek Q4', date: new Date(month.getFullYear(), month.getMonth(), 15), categoryId: bonus.id, accountId: bri.id })
    }

    // Expense transactions
    const expenseData = [
      { amount: 450000, desc: 'Makan siang & kopi', cat: makanan, acc: gopay, day: 2 },
      { amount: 320000, desc: 'Groceries Superindo', cat: makanan, acc: kas, day: 4 },
      { amount: 150000, desc: 'Ojek & GoCar', cat: transportasi, acc: gopay, day: 3 },
      { amount: 200000, desc: 'Bensin motor', cat: transportasi, acc: kas, day: 7 },
      { amount: 800000, desc: 'Shopee Fashion', cat: belanja, acc: ovo, day: 6 },
      { amount: 350000, desc: 'Tokopedia elektronik', cat: belanja, acc: bri, day: 12 },
      { amount: 200000, desc: 'Netflix + Spotify', cat: hiburan, acc: bri, day: 1 },
      { amount: 250000, desc: 'Bioskop & makan', cat: hiburan, acc: kas, day: 8 },
      { amount: 500000, desc: 'Listrik PLN', cat: tagihan, acc: bri, day: 5 },
      { amount: 250000, desc: 'Internet Indihome', cat: tagihan, acc: bri, day: 5 },
      { amount: 180000, desc: 'PDAM Air', cat: tagihan, acc: bri, day: 5 },
      { amount: 150000, desc: 'Apotik & vitamin', cat: kesehatan, acc: kas, day: 14 },
      { amount: 550000, desc: 'Makan keluarga', cat: makanan, acc: kas, day: 16 },
      { amount: 100000, desc: 'Parkir & tol', cat: transportasi, acc: kas, day: 18 },
      { amount: 450000, desc: 'Lazada gadget', cat: belanja, acc: bri, day: 20 },
      { amount: 200000, desc: 'Game online', cat: hiburan, acc: gopay, day: 22 },
      { amount: 300000, desc: 'Makan siang kantor', cat: makanan, acc: gopay, day: 24 },
      { amount: 120000, desc: 'Grab perjalanan', cat: transportasi, acc: gopay, day: 26 },
      { amount: 180000, desc: 'Kursus online Udemy', cat: { id: categories[10].id }, acc: bri, day: 9 },
    ]

    for (const e of expenseData) {
      transactions.push({
        type: 'expense',
        amount: e.amount,
        description: e.desc,
        date: new Date(month.getFullYear(), month.getMonth(), e.day),
        categoryId: e.cat.id,
        accountId: e.acc.id,
      })
    }
  }

  // Insert all transactions
  for (const t of transactions) {
    await prisma.transaction.create({
      data: {
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date,
        categoryId: t.categoryId,
        accountId: t.accountId,
        userId: user.id,
      },
    })
  }

  // Create budgets for current month
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  await Promise.all([
    prisma.budget.create({ data: { name: 'Budget Makanan', amount: 1500000, month: currentMonth, year: currentYear, spent: 1520000, alertAt: 80, categoryId: makanan.id, userId: user.id } }),
    prisma.budget.create({ data: { name: 'Budget Transportasi', amount: 600000, month: currentMonth, year: currentYear, spent: 370000, alertAt: 80, categoryId: transportasi.id, userId: user.id } }),
    prisma.budget.create({ data: { name: 'Budget Belanja', amount: 1000000, month: currentMonth, year: currentYear, spent: 800000, alertAt: 80, categoryId: belanja.id, userId: user.id } }),
    prisma.budget.create({ data: { name: 'Budget Hiburan', amount: 500000, month: currentMonth, year: currentYear, spent: 450000, alertAt: 80, categoryId: hiburan.id, userId: user.id } }),
    prisma.budget.create({ data: { name: 'Budget Tagihan', amount: 1000000, month: currentMonth, year: currentYear, spent: 930000, alertAt: 80, categoryId: tagihan.id, userId: user.id } }),
  ])

  // Saving goals
  await Promise.all([
    prisma.savingGoal.create({ data: { name: 'Beli Laptop Gaming', targetAmount: 20000000, currentAmount: 8500000, deadline: new Date('2024-12-31'), icon: 'computer-desktop', color: '#6366f1', userId: user.id } }),
    prisma.savingGoal.create({ data: { name: 'Dana Darurat 6 Bulan', targetAmount: 50000000, currentAmount: 19420000, deadline: new Date('2025-06-30'), icon: 'shield-check', color: '#10b981', userId: user.id } }),
    prisma.savingGoal.create({ data: { name: 'Liburan Bali', targetAmount: 8000000, currentAmount: 3200000, deadline: new Date('2024-08-01'), icon: 'sun', color: '#f59e0b', userId: user.id } }),
  ])

  // Activity logs
  await prisma.activityLog.create({
    data: { action: 'CREATE', entity: 'transaction', entityId: 'seed', details: 'Database seeded with sample data', userId: user.id },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📧 Login: demo@fintrack.id')
  console.log('🔑 Password: password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
