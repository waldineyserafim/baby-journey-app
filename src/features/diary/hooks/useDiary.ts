import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import { fetchEntries, createEntry, updateEntry, deleteEntry } from '../services/diaryService'
import type { DiaryEntryInsert, DiaryEntryUpdate } from '../services/diaryService'

export function useDiary() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['diary', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: () => fetchEntries(pregnancy!.id),
  })

  const create = useMutation({
    mutationFn: (fields: Omit<DiaryEntryInsert, 'pregnancy_id' | 'tenant_id'>) => {
      if (!pregnancy?.id || !profile?.tenant_id) throw new Error('No pregnancy')
      return createEntry({ ...fields, pregnancy_id: pregnancy.id, tenant_id: profile.tenant_id })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary'] }),
  })

  const update = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: DiaryEntryUpdate }) => updateEntry(id, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary'] }),
  })

  const remove = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['diary'] }),
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    create,
    update,
    remove,
  }
}
