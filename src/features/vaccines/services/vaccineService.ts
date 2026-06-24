import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

type Vaccine = Database['public']['Tables']['vaccines']['Row']
type VaccineInsert = Database['public']['Tables']['vaccines']['Insert']
type VaccineUpdate = Database['public']['Tables']['vaccines']['Update']

export type { Vaccine }

export const PREDEFINED_VACCINES = [
  'Influenza',
  'dTpa (Difteria, Tétano, Coqueluche)',
  'Covid-19',
  'Hepatite B',
  'Hepatite A',
  'Varicela',
  'Febre Amarela',
  'MMR (Sarampo, Caxumba, Rubéola)',
]

export async function fetchVaccines(pregnancyId: string): Promise<Vaccine[]> {
  const { data, error } = await supabase
    .from('vaccines')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
    .order('vaccine_name')
  if (error) throw error
  return data as Vaccine[]
}

export async function createVaccine(payload: VaccineInsert): Promise<Vaccine> {
  const { data, error } = await supabase
    .from('vaccines')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Vaccine
}

export async function updateVaccine(id: string, payload: VaccineUpdate): Promise<Vaccine> {
  const { data, error } = await supabase
    .from('vaccines')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Vaccine
}

export async function deleteVaccine(id: string): Promise<void> {
  const { error } = await supabase.from('vaccines').delete().eq('id', id)
  if (error) throw error
}
