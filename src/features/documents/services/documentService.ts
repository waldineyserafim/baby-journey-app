import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'

export type Document = Database['public']['Tables']['documents']['Row']

export const STORAGE_BUCKET = 'documents'

export const DOCUMENT_CATEGORIES = [
  { value: 'exams',       label: 'Exames',               emoji: '🔬' },
  { value: 'medical',     label: 'Médico',               emoji: '🏥' },
  { value: 'baby_docs',   label: 'Documentos do Bebê',   emoji: '👶' },
  { value: 'family_docs', label: 'Documentos da Família', emoji: '👨‍👩‍👧' },
] as const

export function getDocumentUrl(storagePath: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

export async function fetchDocuments(
  tenantId: string,
  pregnancyId: string
): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('pregnancy_id', pregnancyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function uploadAndCreateDocument(
  file: File,
  metadata: {
    tenantId: string
    pregnancyId: string
    document_name: string
    category: string
    notes?: string | null
  }
): Promise<Document> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
  const path = `${metadata.tenantId}/${metadata.pregnancyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const fileType: 'pdf' | 'image' = file.type === 'application/pdf' ? 'pdf' : 'image'

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type })
  if (uploadError) throw uploadError

  const { data, error: dbError } = await supabase
    .from('documents')
    .insert({
      tenant_id: metadata.tenantId,
      pregnancy_id: metadata.pregnancyId,
      document_name: metadata.document_name,
      category: metadata.category,
      storage_path: path,
      file_type: fileType,
      notes: metadata.notes ?? null,
    })
    .select()
    .single()

  if (dbError) {
    await supabase.storage.from(STORAGE_BUCKET).remove([path])
    throw dbError
  }
  return data
}

export async function deleteDocument(id: string, storagePath: string): Promise<void> {
  await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
}
