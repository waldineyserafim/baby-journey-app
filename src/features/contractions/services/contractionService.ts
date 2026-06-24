import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

export type Contraction = Database['public']['Tables']['contractions']['Row']
export type ContractionInsert = Database['public']['Tables']['contractions']['Insert']

export async function fetchTodayContractions(pregnancyId: string, date: string): Promise<Contraction[]> {
  const { data, error } = await supabase
    .from('contractions')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
    .gte('contraction_start', `${date}T00:00:00`)
    .lte('contraction_start', `${date}T23:59:59`)
    .order('contraction_start')
  if (error) throw error
  return data ?? []
}

export async function createContraction(payload: ContractionInsert): Promise<Contraction> {
  const { data, error } = await supabase
    .from('contractions')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteContraction(id: string): Promise<void> {
  const { error } = await supabase.from('contractions').delete().eq('id', id)
  if (error) throw error
}
