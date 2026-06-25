import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  fetchCatalog,
  fetchUserItems,
  upsertUserItem,
  updateAction,
  updateUserItemDetails,
  removeUserItem,
  mergeItem,
  computeRecommendation,
  type LayetteItem,
  type LayetteAction,
  type LayetteRecommendation,
} from '../services/layetteService'

export interface MovePlan {
  moveDateStr: string
  exchangeRate: number
  city?: string
  state?: string
}

// ─── Stats computed from merged items ────────────────────────────────────────
export interface LayetteStats {
  total: number
  done: number
  pending: number
  dispensed: number
  buyInUSA: number
  essentialsPending: number
  totalSpent: number
  estimatedSavings: number
  progressPercent: number
  essentialsProgressPercent: number
}

function computeStats(items: LayetteItem[], recs: Map<string, LayetteRecommendation>): LayetteStats {
  const done = items.filter(i => i.isDone).length
  const dispensed = items.filter(i => i.isDispensed).length
  const pending = items.filter(i => i.isPending).length
  const buyInUSA = items.filter(i => i.isBuyInUSA).length
  const essentialsPending = items.filter(i => i.isPending && i.catalog.need_level === 'essencial').length
  const essentials = items.filter(i => i.catalog.need_level === 'essencial').length

  const totalSpent = items.reduce((sum, i) => {
    const paid = i.userItem?.paid_value ?? 0
    return sum + (paid * (i.userItem?.quantity_owned ?? 0))
  }, 0)

  let estimatedSavings = 0
  for (const rec of recs.values()) {
    if (rec.savingsBRL && rec.savingsBRL > 0) estimatedSavings += rec.savingsBRL
  }

  const active = items.filter(i => !i.isDispensed)
  const progressPercent = active.length > 0
    ? Math.round((done / active.length) * 100)
    : 0
  const essentialsProgressPercent = essentials > 0
    ? Math.round(((essentials - essentialsPending) / essentials) * 100)
    : 100

  return {
    total: items.length,
    done,
    pending,
    dispensed,
    buyInUSA,
    essentialsPending,
    totalSpent,
    estimatedSavings,
    progressPercent,
    essentialsProgressPercent,
  }
}

export function useLayette(movePlan?: MovePlan | null) {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()

  // Current gestational week
  const gestWeek = useMemo(() => {
    if (!pregnancy?.lmp_date) return 0
    const dum = new Date(pregnancy.lmp_date)
    const diff = (Date.now() - dum.getTime()) / (1000 * 60 * 60 * 24 * 7)
    return Math.max(0, Math.floor(diff))
  }, [pregnancy])

  // ─── Queries ───────────────────────────────────────────────────────────────
  const catalogQuery = useQuery({
    queryKey: ['layette-catalog'],
    queryFn: fetchCatalog,
    staleTime: 1000 * 60 * 60, // 1h
  })

  const userItemsQuery = useQuery({
    queryKey: ['layette-user-items', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: () => fetchUserItems(pregnancy!.id),
    staleTime: 1000 * 30,
  })

  // ─── Merge catalog + user items ────────────────────────────────────────────
  const items = useMemo<LayetteItem[]>(() => {
    const catalog = catalogQuery.data ?? []
    const userItemsMap = new Map(
      (userItemsQuery.data ?? []).map(ui => [ui.catalog_id, ui])
    )
    return catalog.map(c => mergeItem(c, userItemsMap.get(c.id) ?? null))
  }, [catalogQuery.data, userItemsQuery.data])

  // ─── Recommendations (engine) ──────────────────────────────────────────────
  const recommendations = useMemo<Map<string, LayetteRecommendation>>(() => {
    const map = new Map<string, LayetteRecommendation>()
    for (const item of items) {
      map.set(item.catalog.id, computeRecommendation(item, gestWeek, movePlan ?? null))
    }
    return map
  }, [items, gestWeek, movePlan])

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => computeStats(items, recommendations), [items, recommendations])

  // ─── Category map ──────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.catalog.category))).sort()
    return cats
  }, [items])

  // ─── Urgent items ──────────────────────────────────────────────────────────
  const urgentItems = useMemo(() =>
    items.filter(i => {
      if (!i.isPending) return false
      const rec = recommendations.get(i.catalog.id)
      return rec?.urgency === 'alta'
    }).slice(0, 5),
    [items, recommendations]
  )

  // ─── Gift suggestions ──────────────────────────────────────────────────────
  const giftItems = useMemo(() =>
    items.filter(i => i.isPending && (i.catalog.good_as_gift ?? false)).slice(0, 6),
    [items]
  )

  // ─── USA items ─────────────────────────────────────────────────────────────
  const usaItems = useMemo(() =>
    items.filter(i => i.isPending && (i.catalog.country_rec === 'usa')).slice(0, 6),
    [items]
  )

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['layette-user-items'] })
  }

  const setAction = useMutation({
    mutationFn: async ({
      catalogId,
      action,
      existingId,
    }: {
      catalogId: string
      action: LayetteAction
      existingId?: string | null
    }) => {
      if (!pregnancy?.id || !profile?.tenant_id) throw new Error('No pregnancy/tenant')
      if (existingId) {
        await updateAction(existingId, action)
      } else {
        await upsertUserItem({
          catalog_id: catalogId,
          pregnancy_id: pregnancy.id,
          tenant_id: profile.tenant_id,
          action,
        })
      }
    },
    onSuccess: invalidate,
  })

  const saveDetails = useMutation({
    mutationFn: async (payload: {
      catalogId: string
      existingId?: string | null
      fields: {
        action?: LayetteAction
        quantity_ideal?: number | null
        quantity_owned?: number | null
        paid_value?: number | null
        planned_value?: number | null
        store_name?: string | null
        purchase_date?: string | null
        gift_from?: string | null
        notes?: string | null
      }
    }) => {
      if (!pregnancy?.id || !profile?.tenant_id) throw new Error('No pregnancy/tenant')
      if (payload.existingId) {
        await updateUserItemDetails(payload.existingId, payload.fields)
        if (payload.fields.action) {
          await updateAction(payload.existingId, payload.fields.action)
        }
      } else {
        await upsertUserItem({
          catalog_id: payload.catalogId,
          pregnancy_id: pregnancy.id,
          tenant_id: profile.tenant_id,
          action: payload.fields.action ?? 'pendente',
          ...payload.fields,
        })
      }
    },
    onSuccess: invalidate,
  })

  const removeItem = useMutation({
    mutationFn: (id: string) => removeUserItem(id),
    onSuccess: invalidate,
  })

  return {
    items,
    categories,
    stats,
    recommendations,
    urgentItems,
    giftItems,
    usaItems,
    gestWeek,
    isLoading: catalogQuery.isLoading || userItemsQuery.isLoading,
    isCatalogEmpty: (catalogQuery.data?.length ?? 0) === 0,
    setAction,
    saveDetails,
    removeItem,
  }
}
