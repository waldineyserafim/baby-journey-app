import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row']
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

export type { Appointment }

export async function fetchAppointments(pregnancyId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
    .order('appointment_at')
  if (error) throw error
  return data as Appointment[]
}

export async function createAppointment(payload: AppointmentInsert): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Appointment
}

export async function updateAppointment(id: string, payload: AppointmentUpdate): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Appointment
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
}
