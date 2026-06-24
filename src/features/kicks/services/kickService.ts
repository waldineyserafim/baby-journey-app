import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

export type KickRecord = Database['public']['Tables']['kick_counts']['Row']
export type KickInsert = Database['public']['Tables']['kick_counts']['Insert']

export async function fetchKickToday(pregnancyId: string, date: string): Promise<KickRecord | null> {
  const { data, error } = await supabase
    .from('kick_counts')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
    .eq('count_date', date)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function fetchKickHistory(pregnancyId: string, dates: string[]): Promise<Pick<KickRecord, 'count_date' | 'kick_count'>[]> {
  const { data, error } = await supabase
    .from('kick_counts')
    .select('count_date, kick_count')
    .eq('pregnancy_id', pregnancyId)
    .in('count_date', dates)
  if (error) throw error
  return data ?? []
}

export async function upsertKickCount(payload: KickInsert, existingId?: string): Promise<void> {
  if (existingId) {
    const { error } = await supabase
      .from('kick_counts')
      .update({ kick_count: payload.kick_count })
      .eq('id', existingId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('kick_counts').insert(payload)
    if (error) throw error
  }
}
