import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  fetchMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from '../services/timelineService'
import type { TimelineMilestoneInsert, TimelineMilestoneUpdate } from '../services/timelineService'

export function useTimeline() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['timeline', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: () => fetchMilestones(pregnancy!.id),
  })

  const create = useMutation({
    mutationFn: (fields: Omit<TimelineMilestoneInsert, 'pregnancy_id' | 'tenant_id'>) => {
      if (!pregnancy?.id || !profile?.tenant_id) throw new Error('No pregnancy')
      return createMilestone({ ...fields, pregnancy_id: pregnancy.id, tenant_id: profile.tenant_id })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline'] }),
  })

  const update = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: TimelineMilestoneUpdate }) =>
      updateMilestone(id, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline'] }),
  })

  const remove = useMutation({
    mutationFn: deleteMilestone,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline'] }),
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    create,
    update,
    remove,
  }
}
