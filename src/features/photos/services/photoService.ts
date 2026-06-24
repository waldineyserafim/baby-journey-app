import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

export type Photo = Database['public']['Tables']['photos']['Row']
export type PhotoInsert = Database['public']['Tables']['photos']['Insert']
export type PhotoUpdate = Database['public']['Tables']['photos']['Update']

export const STORAGE_BUCKET = 'photos'

export const PHOTO_CATEGORIES = [
  { value: 'ultrassom',        label: 'Ultrassom',         emoji: '🔬' },
  { value: 'barriga',          label: 'Barriga',           emoji: '🤰' },
  { value: 'momento_especial', label: 'Momento Especial',  emoji: '✨' },
  { value: 'familia',          label: 'Família',           emoji: '👨‍👩‍👧' },
  { value: 'preparativos',     label: 'Preparativos',      emoji: '🛏️' },
  { value: 'outro',            label: 'Outro',             emoji: '📷' },
] as const

export function getPhotoUrl(storagePath: string): string {
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl
}

export async function fetchPhotos(pregnancyId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('pregnancy_id', pregnancyId)
    .order('photo_date', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function uploadAndCreatePhoto(
  file: File,
  meta: Omit<PhotoInsert, 'storage_path'>
): Promise<Photo> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${meta.tenant_id}/${meta.pregnancy_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError

  const { data, error: insertError } = await supabase
    .from('photos')
    .insert({ ...meta, storage_path: path })
    .select()
    .single()
  if (insertError) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path])
    throw insertError
  }
  return data
}

export async function updatePhoto(id: string, fields: PhotoUpdate): Promise<Photo> {
  const { data, error } = await supabase
    .from('photos')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePhoto(id: string, storagePath: string): Promise<void> {
  await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
  const { error } = await supabase.from('photos').delete().eq('id', id)
  if (error) throw error
}
