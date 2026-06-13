import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string, fmt = 'dd MMM yyyy'): string {
  return format(new Date(date), fmt, { locale: id })
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yy')
}

export function getMonthRange(date = new Date()) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

export function getPreviousMonths(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = subMonths(new Date(), count - 1 - i)
    return {
      label: format(d, 'MMM', { locale: id }),
      fullLabel: format(d, 'MMMM yyyy', { locale: id }),
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      start: startOfMonth(d),
      end: endOfMonth(d),
    }
  })
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export const ACCOUNT_TYPES = [
  { value: 'kas', label: 'Kas Tunai', icon: 'banknotes' },
  { value: 'bank', label: 'Bank', icon: 'building-library' },
  { value: 'ewallet', label: 'E-Wallet', icon: 'device-phone-mobile' },
  { value: 'custom', label: 'Custom', icon: 'wallet' },
] as const

export const CATEGORY_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#64748b', '#84cc16', '#14b8a6',
]

export const TRANSACTION_TYPES = {
  income: { label: 'Pemasukan', color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  expense: { label: 'Pengeluaran', color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500' },
}
