import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/useAuth'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import {
  fetchDocuments,
  uploadAndCreateDocument,
  deleteDocument,
} from '../services/documentService'

export function useDocuments() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()
  const tenantId = profile?.tenant_id
  const pregnancyId = pregnancy?.id

  const query = useQuery({
    queryKey: ['documents', tenantId, pregnancyId],
    enabled: !!tenantId && !!pregnancyId,
    queryFn: () => fetchDocuments(tenantId!, pregnancyId!),
  })

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['documents', tenantId, pregnancyId] })
  }

  const upload = useMutation({
    mutationFn: (args: {
      file: File
      document_name: string
      category: string
      notes?: string | null
    }) =>
      uploadAndCreateDocument(args.file, {
        tenantId: tenantId!,
        pregnancyId: pregnancyId!,
        document_name: args.document_name,
        category: args.category,
        notes: args.notes,
      }),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) =>
      deleteDocument(id, storagePath),
    onSuccess: invalidate,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    upload,
    remove,
  }
}
