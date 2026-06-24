import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  fetchTodayContractions,
  createContraction,
  deleteContraction,
} from '../services/contractionService'
import type { Contraction } from '../services/contractionService'

export function useContractions() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const query = useQuery({
    queryKey: ['contractions-today', pregnancy?.id, today],
    enabled: !!pregnancy?.id,
    queryFn: () => fetchTodayContractions(pregnancy!.id, today),
  })

  const add = useMutation({
    mutationFn: ({ start, end, lastContraction }: { start: string; end: string; lastContraction?: Contraction }) => {
      if (!pregnancy?.id || !profile?.tenant_id) throw new Error('No pregnancy')
      const duration = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000)
      const interval = lastContraction
        ? Math.floor((new Date(start).getTime() - new Date(lastContraction.contraction_start).getTime()) / 1000)
        : null
      return createContraction({
        pregnancy_id: pregnancy.id,
        tenant_id: profile.tenant_id,
        contraction_start: start,
        contraction_end: end,
        duration_seconds: duration,
        interval_seconds: interval,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contractions-today'] }),
  })

  const remove = useMutation({
    mutationFn: deleteContraction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contractions-today'] }),
  })

  const contractions = query.data ?? []
  const lastContraction = contractions[contractions.length - 1]
  const isFrequent = (lastContraction?.interval_seconds ?? null) !== null && lastContraction!.interval_seconds! < 600

  return {
    contractions,
    isLoading: query.isLoading,
    lastContraction,
    isFrequent,
    add,
    remove,
  }
}
