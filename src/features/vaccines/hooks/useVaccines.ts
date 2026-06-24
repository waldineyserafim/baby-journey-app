import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  fetchVaccines,
  createVaccine,
  updateVaccine,
  deleteVaccine,
} from '../services/vaccineService'
import type { Database } from '@/infrastructure/supabase/database.types'

type VaccineInsert = Database['public']['Tables']['vaccines']['Insert']
type VaccineUpdate = Database['public']['Tables']['vaccines']['Update']

export function useVaccines() {
  const { data: pregnancy } = useCurrentPregnancy()
  const { profile } = useAuth()
  const qc = useQueryClient()
  const key = ['vaccines', pregnancy?.id]

  const query = useQuery({
    queryKey: key,
    enabled: !!pregnancy?.id,
    queryFn: () => fetchVaccines(pregnancy!.id),
  })

  const create = useMutation({
    mutationFn: (fields: Omit<VaccineInsert, 'pregnancy_id' | 'tenant_id'>) =>
      createVaccine({
        ...fields,
        pregnancy_id: pregnancy!.id,
        tenant_id: profile!.tenant_id!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: VaccineUpdate }) =>
      updateVaccine(id, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteVaccine(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { ...query, create, update, remove, pregnancy }
}
