import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import { fetchSymptoms, createSymptom, updateSymptom, deleteSymptom } from '../services/symptomService'
import type { Database } from '@/infrastructure/supabase/database.types'

type SymptomInsert = Database['public']['Tables']['symptoms_log']['Insert']
type SymptomUpdate = Database['public']['Tables']['symptoms_log']['Update']

export function useSymptoms() {
  const { data: pregnancy } = useCurrentPregnancy()
  const { profile } = useAuth()
  const qc = useQueryClient()
  const key = ['symptoms', pregnancy?.id]

  const query = useQuery({
    queryKey: key,
    enabled: !!pregnancy?.id,
    queryFn: () => fetchSymptoms(pregnancy!.id),
  })

  const create = useMutation({
    mutationFn: (fields: Omit<SymptomInsert, 'pregnancy_id' | 'tenant_id'>) =>
      createSymptom({
        ...fields,
        pregnancy_id: pregnancy!.id,
        tenant_id: profile!.tenant_id!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: SymptomUpdate }) =>
      updateSymptom(id, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteSymptom(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { ...query, create, update, remove, pregnancy }
}
