import { useMemo } from 'react'
import {
  getGestationalWeek,
  getGestationalDays,
  getDaysRemaining,
  getProgressPercent,
  getTrimester,
  getTrimesterLabel,
} from '@/shared/utils/pregnancyUtils'

export function useGestationalAge(lmpDate: string | null, dueDate: string | null) {
  return useMemo(() => {
    if (!lmpDate || !dueDate) {
      return {
        week: 0,
        totalDays: 0,
        daysRemaining: 0,
        progressPercent: 0,
        trimester: 1 as const,
        trimesterLabel: '1º Trimestre',
      }
    }
    const week = getGestationalWeek(lmpDate)
    return {
      week,
      totalDays: getGestationalDays(lmpDate),
      daysRemaining: getDaysRemaining(dueDate),
      progressPercent: getProgressPercent(lmpDate),
      trimester: getTrimester(week),
      trimesterLabel: getTrimesterLabel(week),
    }
  }, [lmpDate, dueDate])
}
