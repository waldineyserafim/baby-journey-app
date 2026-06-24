import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import { fetchExams, createExam, updateExam, deleteExam } from '../services/examService'
import type { Database } from '@/infrastructure/supabase/database.types'

type ExamInsert = Database['public']['Tables']['exams']['Insert']
type ExamUpdate = Database['public']['Tables']['exams']['Update']

export function useExams() {
  const { data: pregnancy } = useCurrentPregnancy()
  const { profile } = useAuth()
  const qc = useQueryClient()
  const key = ['exams', pregnancy?.id]

  const query = useQuery({
    queryKey: key,
    enabled: !!pregnancy?.id,
    queryFn: () => fetchExams(pregnancy!.id),
  })

  const create = useMutation({
    mutationFn: (fields: Omit<ExamInsert, 'pregnancy_id' | 'tenant_id'>) =>
      createExam({
        ...fields,
        pregnancy_id: pregnancy!.id,
        tenant_id: profile!.tenant_id!,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const update = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: ExamUpdate }) =>
      updateExam(id, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteExam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { ...query, create, update, remove, pregnancy }
}
