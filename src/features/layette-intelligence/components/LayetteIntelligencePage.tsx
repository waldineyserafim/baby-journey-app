import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/infrastructure/supabase/client'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  calculateRecommendation, RECOMMENDATION_LABELS, RECOMMENDATION_COLORS,
  formatBRL, formatUSD, comparePrices,
} from '@/shared/utils/currencyUtils'
import type { Database } from '@/infrastructure/supabase/database.types'

type LayetteCatalog = Database['public']['Tables']['layette_catalog']['Row']
type UserItem = Database['public']['Tables']['layette_user_items']['Row']

const moveSchema = z.object({
  plannedMoveDate: z.string().min(1, 'Informe a data'),
  destinationCity: z.string().min(2, 'Informe a cidade'),
  destinationState: z.string().min(2, 'Informe o estado'),
  exchangeRate: z.coerce.number().min(1).max(20),
})
type MoveForm = z.infer<typeof moveSchema>

const US_CITIES = [
  { city: 'Miami', state: 'FL' }, { city: 'Orlando', state: 'FL' },
  { city: 'Dallas', state: 'TX' }, { city: 'Austin', state: 'TX' },
  { city: 'Boston', state: 'MA' }, { city: 'New York', state: 'NY' },
  { city: 'Los Angeles', state: 'CA' }, { city: 'Chicago', state: 'IL' },
]

export function LayetteIntelligencePage() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const [movePlan, setMovePlan] = useState<{ date: string; city: string; state: string; rate: number } | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MoveForm>({
    resolver: zodResolver(moveSchema) as import('react-hook-form').Resolver<MoveForm>,
    defaultValues: { exchangeRate: 5.5 },
  })

  const { data: catalogItems } = useQuery<LayetteCatalog[]>({
    queryKey: ['layette-catalog'],
    queryFn: async () => {
      const { data } = await supabase
        .from('layette_catalog')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      return (data ?? []) as LayetteCatalog[]
    },
  })

  const { data: userItems } = useQuery<UserItem[]>({
    queryKey: ['layette-user-items', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('layette_user_items')
        .select('*')
        .eq('pregnancy_id', pregnancy!.id)
      return (data ?? []) as UserItem[]
    },
  })

  function onSubmitMove(data: MoveForm) {
    setMovePlan({ date: data.plannedMoveDate, city: data.destinationCity, state: data.destinationState, rate: data.exchangeRate })
  }

  const recommendations = catalogItems?.map(item => {
    const userItem = userItems?.find(u => u.catalog_id === item.id)
    const rec = calculateRecommendation({
      dueDateStr: pregnancy?.due_date ?? new Date().toISOString(),
      moveDateStr: movePlan?.date ?? null,
      usagePeriod: item.usage_period as 'NO_NASCIMENTO' | 'ATE_3_MESES' | 'ATE_6_MESES' | 'APOS_6_MESES',
      criticality: item.criticality as 'CRITICO' | 'IMPORTANTE' | 'OPCIONAL',
      priceBRL: item.price_brl_min,
      priceUSD: item.price_usd_min,
      exchangeRate: movePlan?.rate ?? 5.5,
    })
    const comparison = item.price_brl_min && item.price_usd_min
      ? comparePrices(item.price_brl_min, item.price_usd_min, movePlan?.rate ?? 5.5)
      : null
    return { item, userItem, recommendation: userItem?.user_recommendation ?? rec, comparison }
  })

  const grouped = {
    COMPRAR_AGORA_BRASIL: recommendations?.filter(r => r.recommendation === 'COMPRAR_AGORA_BRASIL') ?? [],
    AGUARDAR_EUA: recommendations?.filter(r => r.recommendation === 'AGUARDAR_EUA') ?? [],
    SO_PROMOCAO: recommendations?.filter(r => r.recommendation === 'SO_PROMOCAO') ?? [],
    RECEBER_PRESENTE: recommendations?.filter(r => r.recommendation === 'RECEBER_PRESENTE') ?? [],
    NAO_PRIORITARIO: recommendations?.filter(r => r.recommendation === 'NAO_PRIORITARIO') ?? [],
  }

  const totalSavings = grouped.AGUARDAR_EUA.reduce((sum, r) => sum + (r.comparison?.savingsBRL ?? 0), 0)

  return (
    <div>
      <h4 className="fw-bold mb-1">🌎 Inteligência de Enxoval</h4>
      <p className="text-muted small mb-4">Descubra o que comprar no Brasil ou aguardar nos EUA</p>

      {/* Configuração da mudança */}
      <div className="card border-0 shadow-sm mb-4 p-4">
        <h6 className="fw-bold mb-3">⚙️ Configure a mudança</h6>
        <form onSubmit={handleSubmit(onSubmitMove)}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Data da mudança</label>
              <input {...register('plannedMoveDate')} type="date" className={`form-control ${errors.plannedMoveDate ? 'is-invalid' : ''}`} />
              {errors.plannedMoveDate && <div className="invalid-feedback">{errors.plannedMoveDate.message}</div>}
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">Cidade destino</label>
              <select
                className="form-select"
                onChange={e => {
                  const c = US_CITIES.find(x => x.city === e.target.value)
                  if (c) { setValue('destinationCity', c.city); setValue('destinationState', c.state) }
                  else setValue('destinationCity', e.target.value)
                }}
              >
                <option value="">Selecione ou escreva</option>
                {US_CITIES.map(c => (
                  <option key={c.city} value={c.city}>{c.city}, {c.state}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Estado</label>
              <input {...register('destinationState')} className="form-control" placeholder="FL" />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Câmbio (R$/US$)</label>
              <input {...register('exchangeRate')} type="number" step="0.1" className="form-control" />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn text-white w-100"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                Calcular
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Resumo da economia */}
      {movePlan && totalSavings > 0 && (
        <div className="card border-0 shadow-sm mb-4 p-4"
          style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
          <div className="fw-bold text-success fs-5">💰 Economia potencial estimada</div>
          <div className="display-6 fw-bold text-success mt-1">{formatBRL(totalSavings)}</div>
          <div className="text-muted small mt-1">
            Comprando {grouped.AGUARDAR_EUA.length} itens nos EUA em vez de no Brasil
            (câmbio: R$ {movePlan.rate}/US$)
          </div>
        </div>
      )}

      {/* Grupos de recomendação */}
      {Object.entries(grouped).map(([rec, items]) => {
        if (items.length === 0) return null
        return (
          <div key={rec} className="mb-4">
            <h6 className="fw-bold mb-3">
              {RECOMMENDATION_LABELS[rec as keyof typeof RECOMMENDATION_LABELS]}
              <span className="badge bg-secondary ms-2">{items.length}</span>
            </h6>
            <div className="row g-2">
              {items.map(({ item, comparison, userItem }) => (
                <div key={item.id} className="col-12 col-md-6">
                  <div className="card border-0 shadow-sm p-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <div className="fw-semibold small">{item.item_name}</div>
                        <div className="text-muted" style={{ fontSize: '0.7rem' }}>{item.category}</div>
                      </div>
                      <span className={`badge bg-${RECOMMENDATION_COLORS[rec as keyof typeof RECOMMENDATION_COLORS]}`}
                        style={{ fontSize: '0.65rem' }}>
                        {item.criticality}
                      </span>
                    </div>
                    {comparison && (
                      <div className="d-flex gap-3 mt-2">
                        <div className="small">
                          <span className="text-muted">🇧🇷 </span>
                          {item.price_brl_min && formatBRL(item.price_brl_min)}
                          {item.price_brl_max && ` – ${formatBRL(item.price_brl_max)}`}
                        </div>
                        <div className="small">
                          <span className="text-muted">🇺🇸 </span>
                          {item.price_usd_min && formatUSD(item.price_usd_min)}
                          {item.price_usd_max && ` – ${formatUSD(item.price_usd_max)}`}
                        </div>
                      </div>
                    )}
                    {comparison && comparison.savingsBRL > 0 && (
                      <div className="small text-success mt-1">
                        Economia: {formatBRL(comparison.savingsBRL)} ({comparison.savingsPercent}%)
                      </div>
                    )}
                    {userItem && userItem.status !== 'nao_comprado' && (
                      <div className="badge bg-success mt-2" style={{ fontSize: '0.65rem', width: 'fit-content' }}>
                        ✓ {userItem.status}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {!movePlan && (
        <div className="text-center py-4 text-muted">
          <p className="small">Configure a data e destino da mudança para ver as recomendações personalizadas.</p>
        </div>
      )}
    </div>
  )
}
