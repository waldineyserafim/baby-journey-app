import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/useAuth'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import {
  fetchMovePlan,
  saveMovePlan,
  fetchChecklistItems,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  bulkAddChecklistItems,
} from '../services/internationalMoveService'

export function useInternationalMove() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()
  const tenantId = profile?.tenant_id

  const movePlanQuery = useQuery({
    queryKey: ['move-plan', tenantId],
    enabled: !!tenantId,
    queryFn: () => fetchMovePlan(tenantId!),
  })

  const checklistQuery = useQuery({
    queryKey: ['move-checklist', tenantId],
    enabled: !!tenantId,
    queryFn: () => fetchChecklistItems(tenantId!),
  })

  const savePlan = useMutation({
    mutationFn: (fields: Parameters<typeof saveMovePlan>[2]) =>
      saveMovePlan(tenantId!, pregnancy?.id ?? null, fields, movePlanQuery.data?.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['move-plan', tenantId] }),
  })

  const addItem = useMutation({
    mutationFn: (fields: Parameters<typeof addChecklistItem>[1]) =>
      addChecklistItem(tenantId!, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['move-checklist', tenantId] }),
  })

  const toggleItem = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string | null }) =>
      toggleChecklistItem(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['move-checklist', tenantId] }),
  })

  const removeItem = useMutation({
    mutationFn: (id: string) => deleteChecklistItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['move-checklist', tenantId] }),
  })

  const bulkAdd = useMutation({
    mutationFn: (items: Array<{ category: string; item_name: string }>) =>
      bulkAddChecklistItems(tenantId!, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['move-checklist', tenantId] }),
  })

  return {
    movePlan: movePlanQuery.data ?? null,
    checklist: checklistQuery.data ?? [],
    isLoading: movePlanQuery.isLoading || checklistQuery.isLoading,
    savePlan,
    addItem,
    toggleItem,
    removeItem,
    bulkAdd,
  }
}
