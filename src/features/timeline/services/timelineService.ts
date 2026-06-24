import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

export type TimelineMilestone = Database['public']['Tables']['timeline_milestones']['Row']
export type TimelineMilestoneInsert = Database['public']['Tables']['timeline_milestones']['Insert']
export type TimelineMilestoneUpdate = Database['public']['Tables']['timeline_milestones']['Update']

export const MILESTONE_TYPES = [
  { value: 'first_ultrasound', label: 'Primeiro Ultrassom' },
  { value: 'heartbeat', label: 'Primeiro Batimento' },
  { value: 'first_kick', label: 'Primeiro Chute' },
  { value: 'baby_shower', label: 'Chá de Bebê' },
  { value: 'birth_plan', label: 'Plano de Parto' },
  { value: 'hospital_tour', label: 'Visita à Maternidade' },
  { value: 'doctor_appointment', label: 'Consulta' },
  { value: 'personal', label: 'Momento Pessoal' },
  { value: 'other', label: 'Outro' },
] as const

export async function fetchMilestones(pregnancyId: string): Promise<TimelineMilestone[]> {
  const { data, error } = await supabase
    .from('timeline_milestones')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
    .order('milestone_date', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createMilestone(payload: TimelineMilestoneInsert): Promise<TimelineMilestone> {
  const { data, error } = await supabase
    .from('timeline_milestones')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMilestone(id: string, fields: TimelineMilestoneUpdate): Promise<TimelineMilestone> {
  const { data, error } = await supabase
    .from('timeline_milestones')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMilestone(id: string): Promise<void> {
  const { error } = await supabase.from('timeline_milestones').delete().eq('id', id)
  if (error) throw error
}
