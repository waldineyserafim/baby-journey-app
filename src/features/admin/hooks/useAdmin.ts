import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminStats,
  fetchAllCatalogItems,
  upsertCatalogItem,
  toggleCatalogItem,
  type LayetteCatalogInsert,
} from '../services/adminService'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAdminCatalog() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['admin-catalog'],
    queryFn: fetchAllCatalogItems,
  })

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['admin-catalog'] })
    qc.invalidateQueries({ queryKey: ['layette-catalog'] })
  }

  const upsert = useMutation({
    mutationFn: (item: Parameters<typeof upsertCatalogItem>[0]) => upsertCatalogItem(item),
    onSuccess: invalidate,
  })

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCatalogItem(id, isActive),
    onSuccess: invalidate,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    upsert,
    toggle,
  }
}
