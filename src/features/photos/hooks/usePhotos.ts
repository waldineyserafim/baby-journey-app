import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import { fetchPhotos, uploadAndCreatePhoto, updatePhoto, deletePhoto } from '../services/photoService'
import type { PhotoUpdate } from '../services/photoService'

export function usePhotos() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['photos', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: () => fetchPhotos(pregnancy!.id),
  })

  const upload = useMutation({
    mutationFn: ({
      file,
      photo_date,
      category,
      caption,
      week_number,
      is_public,
    }: {
      file: File
      photo_date: string
      category: string
      caption?: string | null
      week_number?: number | null
      is_public?: boolean
    }) => {
      if (!pregnancy?.id || !profile?.tenant_id) throw new Error('No pregnancy')
      return uploadAndCreatePhoto(file, {
        pregnancy_id: pregnancy.id,
        tenant_id: profile.tenant_id,
        photo_date,
        category,
        caption: caption ?? null,
        week_number: week_number ?? null,
        is_public: is_public ?? false,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }),
  })

  const update = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: PhotoUpdate }) => updatePhoto(id, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }),
  })

  const remove = useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) => deletePhoto(id, storagePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['photos'] }),
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    upload,
    update,
    remove,
  }
}
