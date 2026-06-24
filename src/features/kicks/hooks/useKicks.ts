import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import { fetchKickToday, fetchKickHistory, upsertKickCount } from '../services/kickService'

export const DAILY_GOAL = 10

export function useKicks() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const todayQuery = useQuery({
    queryKey: ['kicks-today', pregnancy?.id, today],
    enabled: !!pregnancy?.id,
    queryFn: () => fetchKickToday(pregnancy!.id, today),
  })

  const historyDays = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  ).reverse()

  const historyQuery = useQuery({
    queryKey: ['kicks-history', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: async () => {
      const records = await fetchKickHistory(pregnancy!.id, historyDays)
      const map = Object.fromEntries(records.map(d => [d.count_date, d.kick_count]))
      return historyDays.map(d => ({
        date: format(new Date(d + 'T12:00:00'), 'EEE', { locale: ptBR }),
        chutes: map[d] ?? 0,
      }))
    },
  })

  const tap = useMutation({
    mutationFn: async (newCount: number) => {
      if (!pregnancy?.id || !profile?.tenant_id) return
      await upsertKickCount(
        {
          pregnancy_id: pregnancy.id,
          tenant_id: profile.tenant_id,
          count_date: today,
          kick_count: newCount,
          session_start: new Date().toISOString(),
        },
        todayQuery.data?.id ?? undefined
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kicks-today'] })
      qc.invalidateQueries({ queryKey: ['kicks-history'] })
    },
  })

  const count = todayQuery.data?.kick_count ?? 0

  return {
    todayRecord: todayQuery.data,
    history: historyQuery.data ?? [],
    isLoading: todayQuery.isLoading,
    count,
    goalReached: count >= DAILY_GOAL,
    tap,
  }
}
