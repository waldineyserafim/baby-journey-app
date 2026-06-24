import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

type Exam = Database['public']['Tables']['exams']['Row']
type ExamInsert = Database['public']['Tables']['exams']['Insert']
type ExamUpdate = Database['public']['Tables']['exams']['Update']

export type { Exam }

export async function fetchExams(pregnancyId: string): Promise<Exam[]> {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
    .order('exam_date', { ascending: false })
  if (error) throw error
  return data as Exam[]
}

export async function createExam(payload: ExamInsert): Promise<Exam> {
  const { data, error } = await supabase
    .from('exams')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Exam
}

export async function updateExam(id: string, payload: ExamUpdate): Promise<Exam> {
  const { data, error } = await supabase
    .from('exams')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Exam
}

export async function deleteExam(id: string): Promise<void> {
  const { error } = await supabase.from('exams').delete().eq('id', id)
  if (error) throw error
}
