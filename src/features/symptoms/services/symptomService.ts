import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

type SymptomLog = Database['public']['Tables']['symptoms_log']['Row']
type SymptomInsert = Database['public']['Tables']['symptoms_log']['Insert']
type SymptomUpdate = Database['public']['Tables']['symptoms_log']['Update']

export type { SymptomLog }

export async function fetchSymptoms(pregnancyId: string): Promise<SymptomLog[]> {
  const { data, error } = await supabase
    .from('symptoms_log')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
    .order('log_date', { ascending: false })
  if (error) throw error
  return data as SymptomLog[]
}

export async function createSymptom(payload: SymptomInsert): Promise<SymptomLog> {
  const { data, error } = await supabase
    .from('symptoms_log')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as SymptomLog
}

export async function updateSymptom(id: string, payload: SymptomUpdate): Promise<SymptomLog> {
  const { data, error } = await supabase
    .from('symptoms_log')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as SymptomLog
}

export async function deleteSymptom(id: string): Promise<void> {
  const { error } = await supabase.from('symptoms_log').delete().eq('id', id)
  if (error) throw error
}
