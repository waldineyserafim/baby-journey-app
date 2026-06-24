import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

export type DiaryEntry = Database['public']['Tables']['diary_entries']['Row']
export type DiaryEntryInsert = Database['public']['Tables']['diary_entries']['Insert']
export type DiaryEntryUpdate = Database['public']['Tables']['diary_entries']['Update']

export const MOOD_OPTIONS = [
  { value: 'animada',   emoji: '🤩', label: 'Animada' },
  { value: 'feliz',     emoji: '😊', label: 'Feliz' },
  { value: 'amada',     emoji: '💕', label: 'Amada' },
  { value: 'calma',     emoji: '😌', label: 'Calma' },
  { value: 'cansada',   emoji: '😴', label: 'Cansada' },
  { value: 'ansiosa',   emoji: '😰', label: 'Ansiosa' },
  { value: 'enjoada',   emoji: '🤢', label: 'Enjoada' },
  { value: 'triste',    emoji: '😢', label: 'Triste' },
]

export function getMoodEmoji(value: string | null): string {
  return MOOD_OPTIONS.find(m => m.value === value)?.emoji ?? '📝'
}

export async function fetchEntries(pregnancyId: string): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
    .order('entry_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createEntry(payload: DiaryEntryInsert): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from('diary_entries')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEntry(id: string, fields: DiaryEntryUpdate): Promise<DiaryEntry> {
  const { data, error } = await supabase
    .from('diary_entries')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('diary_entries').delete().eq('id', id)
  if (error) throw error
}
