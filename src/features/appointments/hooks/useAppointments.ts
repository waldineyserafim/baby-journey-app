import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../services/appointmentService'
import type { Database } from '@/infrastructure/supabase/database.types'

type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

export function useAppointments() {
  const { data: pregnancy } = useCurrentPregnancy()
  const { profile } = useAuth()
  const qc = useQueryClient()
  const key = ['appointments', pregnancy?.id]

  const query = useQuery({
    queryKey: key,
    enabled: !!pregnancy?.id,
    queryFn: () => fetchAppointments(pregnancy!.id),
  })

  const create = useMutation({
    mutationFn: (fields: Omit<AppointmentInsert, 'pregnancy_id' | 'tenant_id'>) =>
      createAppointment({
        ...fields,
        pregnancy_id: pregnancy!.id,
        tenant_id: profile!.tenant_id!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: AppointmentUpdate }) =>
      updateAppointment(id, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { ...query, create, update, remove, pregnancy }
}
