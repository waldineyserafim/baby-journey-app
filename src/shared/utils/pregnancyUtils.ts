import { differenceInDays, differenceInWeeks, addDays, format, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const TOTAL_PREGNANCY_DAYS = 280
export const TOTAL_WEEKS = 40

export function getGestationalWeek(lmpDate: string | Date): number {
  const lmp = new Date(lmpDate)
  const today = new Date()
  const days = differenceInDays(today, lmp)
  return Math.floor(days / 7) + 1
}

export function getGestationalDays(lmpDate: string | Date): number {
  const lmp = new Date(lmpDate)
  return differenceInDays(new Date(), lmp)
}

export function getDueDate(lmpDate: string | Date): Date {
  return addDays(new Date(lmpDate), TOTAL_PREGNANCY_DAYS)
}

export function getDaysRemaining(dueDate: string | Date): number {
  const due = new Date(dueDate)
  const today = new Date()
  const days = differenceInDays(due, today)
  return Math.max(0, days)
}

export function getProgressPercent(lmpDate: string | Date): number {
  const days = getGestationalDays(lmpDate)
  return Math.min(100, Math.round((days / TOTAL_PREGNANCY_DAYS) * 100))
}

export function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 13) return 1
  if (week <= 26) return 2
  return 3
}

export function getTrimesterLabel(week: number): string {
  const t = getTrimester(week)
  return `${t}º Trimestre`
}

export function formatPregnancyDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

export function isPregnancyActive(dueDate: string | Date): boolean {
  return isAfter(new Date(dueDate), new Date())
}

export function getWeekFromDate(lmpDate: string | Date, targetDate: string | Date): number {
  const lmp = new Date(lmpDate)
  const target = new Date(targetDate)
  return differenceInWeeks(target, lmp) + 1
}

export function getBabyAgeAtDate(birthDate: string | Date, targetDate: string | Date): string {
  const birth = new Date(birthDate)
  const target = new Date(targetDate)
  const months = Math.floor(differenceInDays(target, birth) / 30)
  if (months < 1) {
    const days = differenceInDays(target, birth)
    return `${days} dia${days !== 1 ? 's' : ''}`
  }
  return `${months} ${months === 1 ? 'mês' : 'meses'}`
}
