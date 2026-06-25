import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ShoppingBag, CheckCircle, Gift, Plane, TrendingDown,
  AlertCircle, ChevronDown, ChevronUp, X, Check,
  DollarSign, Package, Star, Clock, Info,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLayette, type MovePlan } from '../hooks/useLayette'
import {
  ACTION_CONFIG, NEED_LEVEL_CONFIG, CATEGORY_LABELS,
  type LayetteItem, type LayetteAction,
} from '../services/layetteService'
import { formatBRL, formatUSD } from '@/shared/utils/currencyUtils'

// ─── Action button quick set ─────────────────────────────────────────────────
const QUICK_ACTIONS: { action: LayetteAction; label: string; icon: React.ReactNode; color: string }[] = [
  { action: 'comprado',    label: 'Comprei',  icon: <Check size={12} />,   color: '#0ea5e9' },
  { action: 'ganho',       label: 'Ganhei',   icon: <Gift size={12} />,    color: '#22c55e' },
  { action: 'comprar_eua', label: '✈️ EUA',   icon: null,                  color: '#f59e0b' },
  { action: 'dispensado',  label: 'Dispensar',icon: <X size={12} />,       color: '#94a3b8' },
]

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({
  item,
  rec,
  onAction,
  onDetail,
  loading,
}: {
  item: LayetteItem
  rec: ReturnType<typeof import('../services/layetteService')['computeRecommendation']>
  onAction: (action: LayetteAction) => void
  onDetail: () => void
  loading?: boolean
}) {
  const cat = item.catalog
  const cfg = ACTION_CONFIG[item.action]
  const needCfg = NEED_LEVEL_CONFIG[cat.need_level ?? 'recomendado'] ?? NEED_LEVEL_CONFIG.recomendado
  const catInfo = CATEGORY_LABELS[cat.category] ?? { name: cat.category, icon: '📦', color: '#7c3aed' }

  const avgBrl = cat.avg_price_brl ?? cat.price_brl_min
  const avgUsd = cat.avg_price_usd ?? cat.price_usd_min

  return (
    <div
      className="card border-0 shadow-sm"
      style={{
        borderLeft: `3px solid ${needCfg.color}`,
        opacity: item.isDispensed ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-start gap-2">
          {/* Icon */}
          <div
            className="rounded d-flex align-items-center justify-content-center flex-shrink-0 fs-5"
            style={{ width: 40, height: 40, background: catInfo.color + '18' }}
          >
            {catInfo.icon}
          </div>

          {/* Content */}
          <div className="flex-grow-1 min-w-0">
            <div className="d-flex align-items-start justify-content-between gap-1">
              <button
                className="btn btn-link p-0 text-start fw-semibold text-dark"
                style={{ fontSize: '0.875rem', lineHeight: 1.3 }}
                onClick={onDetail}
              >
                {cat.item_name}
              </button>
              <span
                className="badge flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.color, fontSize: '0.65rem' }}
              >
                {cfg.label}
              </span>
            </div>

            {/* Meta row */}
            <div className="d-flex flex-wrap gap-2 mt-1" style={{ fontSize: '0.72rem' }}>
              <span style={{ color: catInfo.color }}>
                {catInfo.icon} {catInfo.name}
              </span>
              <span style={{ color: needCfg.color }}>
                {needCfg.icon} {needCfg.label}
              </span>
              {avgBrl && (
                <span className="text-muted">
                  R$ {avgBrl.toFixed(0)}
                  {avgUsd ? ` · US$ ${avgUsd.toFixed(0)}` : ''}
                </span>
              )}
            </div>

            {/* Recommendation */}
            {rec?.text && (
              <div
                className="mt-2 px-2 py-1 rounded"
                style={{
                  background: rec.urgency === 'alta' ? '#fef2f2' : '#f0fdf4',
                  color: rec.urgency === 'alta' ? '#dc2626' : '#16a34a',
                  fontSize: '0.72rem',
                  lineHeight: 1.4,
                }}
              >
                {rec.text}
              </div>
            )}

            {/* Quantity done indicator */}
            {item.isDone && item.quantityIdeal > 1 && (
              <div className="mt-1" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {item.quantityOwned}/{item.quantityIdeal} unidades
              </div>
            )}
          </div>
        </div>

        {/* Quick action buttons — only for pending items */}
        {item.isPending && (
          <div className="d-flex gap-1 mt-2 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
            {QUICK_ACTIONS.map(qa => (
              <button
                key={qa.action}
                className="btn btn-sm flex-grow-1"
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 4px',
                  background: qa.color + '15',
                  color: qa.color,
                  border: `1px solid ${qa.color}30`,
                }}
                onClick={() => onAction(qa.action)}
                disabled={loading}
              >
                {qa.icon && <span className="me-1">{qa.icon}</span>}
                {qa.label}
              </button>
            ))}
          </div>
        )}

        {/* Undo for done/dispensed items */}
        {(item.isDone || item.isDispensed || item.isBuyInUSA) && (
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
            <button
              className="btn btn-sm w-100 text-muted"
              style={{ fontSize: '0.7rem', background: '#f8fafc' }}
              onClick={() => onAction('pendente')}
              disabled={loading}
            >
              Desfazer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
const detailSchema = z.object({
  action:          z.string(),
  quantity_ideal:  z.union([z.literal(''), z.coerce.number().int().min(0)]).optional(),
  quantity_owned:  z.union([z.literal(''), z.coerce.number().int().min(0)]).optional(),
  paid_value:      z.union([z.literal(''), z.coerce.number().min(0)]).optional(),
  store_name:      z.string().optional(),
  purchase_date:   z.string().optional(),
  gift_from:       z.string().optional(),
  notes:           z.string().optional(),
})
type DetailValues = z.infer<typeof detailSchema>

function DetailModal({
  item,
  rec,
  onSave,
  onClose,
  loading,
}: {
  item: LayetteItem
  rec: ReturnType<typeof import('../services/layetteService')['computeRecommendation']>
  onSave: (v: DetailValues) => Promise<void>
  onClose: () => void
  loading: boolean
}) {
  const cat = item.catalog
  const catInfo = CATEGORY_LABELS[cat.category] ?? { name: cat.category, icon: '📦', color: '#7c3aed' }
  const avgBrl = cat.avg_price_brl ?? cat.price_brl_min
  const avgUsd = cat.avg_price_usd ?? cat.price_usd_min

  const { register, handleSubmit } = useForm<DetailValues>({
    resolver: zodResolver(detailSchema) as any,
    defaultValues: {
      action:          item.action,
      quantity_ideal:  item.userItem?.quantity_ideal ?? cat.ideal_quantity ?? '',
      quantity_owned:  item.userItem?.quantity_owned ?? '',
      paid_value:      item.userItem?.paid_value ?? '',
      store_name:      item.userItem?.store_name ?? '',
      purchase_date:   item.userItem?.purchase_date ?? '',
      gift_from:       item.userItem?.gift_from ?? '',
      notes:           item.userItem?.notes ?? '',
    },
  })

  const brlMin = cat.price_brl_min
  const brlMax = cat.price_brl_max
  const usdMin = cat.price_usd_min
  const usdMax = cat.price_usd_max

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header" style={{ borderBottom: `3px solid ${catInfo.color}` }}>
            <div>
              <div className="fw-bold" style={{ fontSize: '1rem' }}>{cat.item_name}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {catInfo.icon} {catInfo.name}
                {cat.subcategory ? ` · ${cat.subcategory}` : ''}
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-3">
            {/* Description */}
            {cat.description && (
              <div className="mb-3 p-2 rounded" style={{ background: '#f8fafc', fontSize: '0.82rem', color: '#475569' }}>
                {cat.description}
              </div>
            )}

            {/* Smart info grid */}
            <div className="row g-2 mb-3">
              {cat.buy_week_from && (
                <div className="col-6">
                  <div className="p-2 rounded text-center" style={{ background: '#f0fdf4', fontSize: '0.72rem' }}>
                    <div className="fw-bold text-success">Semana {cat.buy_week_from}</div>
                    <div className="text-muted">Comprar a partir de</div>
                  </div>
                </div>
              )}
              {cat.buy_week_to && (
                <div className="col-6">
                  <div className="p-2 rounded text-center" style={{ background: '#fef2f2', fontSize: '0.72rem' }}>
                    <div className="fw-bold text-danger">Semana {cat.buy_week_to}</div>
                    <div className="text-muted">Ter até</div>
                  </div>
                </div>
              )}
              {cat.ideal_quantity && cat.ideal_quantity > 1 && (
                <div className="col-6">
                  <div className="p-2 rounded text-center" style={{ background: '#eff6ff', fontSize: '0.72rem' }}>
                    <div className="fw-bold text-primary">{cat.ideal_quantity}</div>
                    <div className="text-muted">Qtd. ideal</div>
                  </div>
                </div>
              )}
              {avgBrl && (
                <div className="col-6">
                  <div className="p-2 rounded text-center" style={{ background: '#fef3c7', fontSize: '0.72rem' }}>
                    <div className="fw-bold" style={{ color: '#92400e' }}>
                      {brlMin && brlMax ? `R$ ${brlMin}–${brlMax}` : `R$ ${avgBrl.toFixed(0)}`}
                    </div>
                    <div className="text-muted">Preço no Brasil</div>
                  </div>
                </div>
              )}
              {avgUsd && (
                <div className="col-6">
                  <div className="p-2 rounded text-center" style={{ background: '#ecfeff', fontSize: '0.72rem' }}>
                    <div className="fw-bold" style={{ color: '#0e7490' }}>
                      {usdMin && usdMax ? `US$ ${usdMin}–${usdMax}` : `US$ ${avgUsd.toFixed(0)}`}
                    </div>
                    <div className="text-muted">Preço nos EUA</div>
                  </div>
                </div>
              )}
            </div>

            {/* Attributes */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              {cat.can_borrow && <span className="badge" style={{ background: '#f3e8ff', color: '#7c3aed', fontSize: '0.7rem' }}>Pode pedir emprestado</span>}
              {cat.can_rent   && <span className="badge" style={{ background: '#ecfeff', color: '#0891b2', fontSize: '0.7rem' }}>Pode alugar</span>}
              {cat.good_as_gift && <span className="badge" style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.7rem' }}>🎁 Ótimo presente</span>}
              {cat.is_large_item && <span className="badge" style={{ background: '#fef9c3', color: '#854d0e', fontSize: '0.7rem' }}>Ocupa espaço</span>}
            </div>

            {/* Recommendation */}
            {rec?.text && (
              <div className="mb-3 p-2 rounded d-flex align-items-start gap-2"
                style={{ background: rec.urgency === 'alta' ? '#fef2f2' : '#f0fdf4', fontSize: '0.82rem' }}>
                <Info size={14} className="flex-shrink-0 mt-1" style={{ color: rec.urgency === 'alta' ? '#dc2626' : '#16a34a' }} />
                <span style={{ color: rec.urgency === 'alta' ? '#dc2626' : '#16a34a' }}>{rec.text}</span>
              </div>
            )}

            {/* Form */}
            <form id="detail-form" onSubmit={handleSubmit(onSave)}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Status</label>
                <select {...register('action')} className="form-select form-select-sm">
                  {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label fw-semibold small mb-1">Qtd. ideal</label>
                  <input {...register('quantity_ideal')} type="number" min={0} className="form-control form-control-sm" />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small mb-1">Qtd. adquirida</label>
                  <input {...register('quantity_owned')} type="number" min={0} className="form-control form-control-sm" />
                </div>
              </div>

              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label fw-semibold small mb-1">Valor pago (R$)</label>
                  <input {...register('paid_value')} type="number" step="0.01" min={0} className="form-control form-control-sm" placeholder="0,00" />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small mb-1">Data compra</label>
                  <input {...register('purchase_date')} type="date" className="form-control form-control-sm" />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold small mb-1">Loja</label>
                <input {...register('store_name')} className="form-control form-control-sm" placeholder="Amazon, Ri Happy..." />
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold small mb-1">Presente de (se ganho)</label>
                <input {...register('gift_from')} className="form-control form-control-sm" placeholder="Nome da pessoa" />
              </div>

              <div>
                <label className="form-label fw-semibold small mb-1">Observações</label>
                <input {...register('notes')} className="form-control form-control-sm" placeholder="Cor, modelo, tamanho..." />
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-light btn-sm" onClick={onClose}>Cancelar</button>
            <button type="submit" form="detail-form" className="btn btn-primary btn-sm" disabled={loading}>
              {loading && <span className="spinner-border spinner-border-sm me-1" />}
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stats bar (top) ──────────────────────────────────────────────────────────
function StatsBar({ stats }: { stats: ReturnType<typeof useLayette>['stats'] }) {
  return (
    <div className="row g-2 mb-3">
      <div className="col-3">
        <div className="card border-0 shadow-sm p-2 text-center">
          <div className="fw-bold fs-6" style={{ color: '#7c3aed' }}>{stats.total}</div>
          <div className="text-muted" style={{ fontSize: '0.65rem' }}>Itens</div>
        </div>
      </div>
      <div className="col-3">
        <div className="card border-0 shadow-sm p-2 text-center">
          <div className="fw-bold fs-6 text-success">{stats.done}</div>
          <div className="text-muted" style={{ fontSize: '0.65rem' }}>Adquiridos</div>
        </div>
      </div>
      <div className="col-3">
        <div className="card border-0 shadow-sm p-2 text-center">
          <div className="fw-bold fs-6 text-danger">{stats.essentialsPending}</div>
          <div className="text-muted" style={{ fontSize: '0.65rem' }}>Essen. faltam</div>
        </div>
      </div>
      <div className="col-3">
        <div className="card border-0 shadow-sm p-2 text-center">
          <div className="fw-bold fs-6 text-warning" style={{ color: '#f59e0b' }}>
            {stats.estimatedSavings > 0 ? `R$ ${stats.estimatedSavings.toFixed(0)}` : '—'}
          </div>
          <div className="text-muted" style={{ fontSize: '0.65rem' }}>Economia EUA</div>
        </div>
      </div>
    </div>
  )
}

// ─── Move plan form (for intelligence tab) ───────────────────────────────────
const movePlanSchema = z.object({
  moveDateStr:  z.string().min(1, 'Informe a data'),
  city:         z.string().min(2),
  state:        z.string().min(2),
  exchangeRate: z.coerce.number().min(1).max(20),
})
type MovePlanForm = z.infer<typeof movePlanSchema>

function MovePlanSetup({ onSave }: { onSave: (p: MovePlan) => void }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MovePlanForm>({
    resolver: zodResolver(movePlanSchema) as any,
    defaultValues: { exchangeRate: 5.5 },
  })
  const US_CITIES = [
    { city: 'Miami', state: 'FL' }, { city: 'Orlando', state: 'FL' },
    { city: 'Dallas', state: 'TX' }, { city: 'Austin', state: 'TX' },
    { city: 'Boston', state: 'MA' }, { city: 'New York', state: 'NY' },
    { city: 'Los Angeles', state: 'CA' }, { city: 'Chicago', state: 'IL' },
  ]
  return (
    <div className="card border-0 shadow-sm p-3 mb-4">
      <div className="fw-bold mb-3 d-flex align-items-center gap-2">
        <Plane size={16} style={{ color: '#0ea5e9' }} />
        Simulador de Mudança
      </div>
      <form onSubmit={handleSubmit(d => onSave(d))}>
        <div className="mb-2">
          <label className="form-label fw-semibold small mb-1">Data prevista da mudança</label>
          <input {...register('moveDateStr')} type="date" className={`form-control form-control-sm ${errors.moveDateStr ? 'is-invalid' : ''}`} />
        </div>
        <div className="mb-2">
          <label className="form-label fw-semibold small mb-1">Destino (atalhos)</label>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {US_CITIES.map(c => (
              <button key={c.city} type="button" className="btn btn-outline-secondary btn-sm"
                style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                onClick={() => { setValue('city', c.city); setValue('state', c.state) }}>
                {c.city}, {c.state}
              </button>
            ))}
          </div>
          <div className="row g-2">
            <div className="col-8">
              <input {...register('city')} className="form-control form-control-sm" placeholder="Cidade" />
            </div>
            <div className="col-4">
              <input {...register('state')} className="form-control form-control-sm" placeholder="Estado" />
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold small mb-1">Câmbio atual (R$/US$)</label>
          <input {...register('exchangeRate')} type="number" step="0.1" min="1" max="20" className="form-control form-control-sm" />
        </div>
        <button type="submit" className="btn btn-primary btn-sm w-100">
          Calcular recomendações
        </button>
      </form>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function LayettePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'inicio'

  const [movePlan, setMovePlan] = useState<MovePlan | null>(null)
  const [detailItem, setDetailItem] = useState<LayetteItem | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('__all')
  const [needFilter, setNeedFilter] = useState<string>('__all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showDispensed, setShowDispensed] = useState(false)

  const { items, categories, stats, recommendations, urgentItems, giftItems, usaItems, gestWeek, isLoading, isCatalogEmpty, setAction, saveDetails } =
    useLayette(movePlan)

  function changeTab(tab: string) {
    setSearchParams({ tab })
    setCategoryFilter('__all')
    setNeedFilter('__all')
    setSearchTerm('')
  }

  async function handleQuickAction(item: LayetteItem, action: LayetteAction) {
    await setAction.mutateAsync({
      catalogId: item.catalog.id,
      action,
      existingId: item.userItem?.id,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleDetailSave(values: any) {
    if (!detailItem) return
    await saveDetails.mutateAsync({
      catalogId: detailItem.catalog.id,
      existingId: detailItem.userItem?.id,
      fields: {
        action: values.action as LayetteAction,
        quantity_ideal: values.quantity_ideal === '' ? null : Number(values.quantity_ideal),
        quantity_owned: values.quantity_owned === '' ? null : Number(values.quantity_owned),
        paid_value: values.paid_value === '' ? null : Number(values.paid_value),
        store_name: values.store_name || null,
        purchase_date: values.purchase_date || null,
        gift_from: values.gift_from || null,
        notes: values.notes || null,
      },
    })
    setDetailItem(null)
  }

  // ─── Filter logic ────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let list = items

    if (activeTab === 'pendentes') {
      list = list.filter(i => i.isPending || i.isBuyInUSA)
    } else if (activeTab === 'adquiridos') {
      list = list.filter(i => i.isDone)
    } else if (activeTab === 'inteligencia') {
      list = list.filter(i => {
        const rec = recommendations.get(i.catalog.id)
        return rec?.savingsBRL && rec.savingsBRL > 0
      })
    }

    if (!showDispensed) list = list.filter(i => !i.isDispensed)
    if (categoryFilter !== '__all') list = list.filter(i => i.catalog.category === categoryFilter)
    if (needFilter !== '__all') list = list.filter(i => i.catalog.need_level === needFilter)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(i => i.catalog.item_name.toLowerCase().includes(q))
    }

    return list
  }, [items, activeTab, showDispensed, categoryFilter, needFilter, searchTerm, recommendations])

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" style={{ color: '#7c3aed' }} />
      </div>
    )
  }

  if (isCatalogEmpty) {
    return (
      <div className="card border-0 shadow-sm p-5 text-center text-muted">
        <Package size={40} className="mx-auto mb-3 opacity-50" />
        <p className="fw-semibold mb-1">Catálogo não encontrado</p>
        <p className="small">Execute o seed <code>002_layette_catalog_v2.sql</code> no Supabase para carregar o catálogo.</p>
      </div>
    )
  }

  const tabs = [
    { key: 'inicio',       label: 'Início',       icon: <Star size={14} /> },
    { key: 'pendentes',    label: 'Pendentes',     icon: <Clock size={14} /> },
    { key: 'adquiridos',   label: 'Adquiridos',    icon: <CheckCircle size={14} /> },
    { key: 'inteligencia', label: 'Inteligência',  icon: <TrendingDown size={14} /> },
  ]

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h4 className="fw-bold mb-0">Enxoval</h4>
          <p className="text-muted small mb-0">
            {gestWeek > 0 ? `Semana ${gestWeek} · ` : ''}
            {stats.done}/{stats.total - stats.dispensed} adquiridos
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Essenciais: {stats.essentialsProgressPercent}%
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Geral: {stats.progressPercent}%
            </span>
          </div>
          <div className="progress" style={{ height: 6, borderRadius: 4 }}>
            <div className="progress-bar" style={{
              width: `${stats.essentialsProgressPercent}%`,
              background: 'linear-gradient(90deg, #ef4444, #7c3aed)',
            }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-pills mb-3 gap-1 flex-nowrap overflow-auto">
        {tabs.map(t => (
          <li key={t.key} className="nav-item flex-shrink-0">
            <button
              className={`nav-link btn btn-sm d-flex align-items-center gap-1 ${activeTab === t.key ? 'active' : 'text-secondary'}`}
              style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
              onClick={() => changeTab(t.key)}
            >
              {t.icon}
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* ── INÍCIO TAB ────────────────────────────────────────── */}
      {activeTab === 'inicio' && (
        <div>
          <StatsBar stats={stats} />

          {/* Urgent items */}
          {urgentItems.length > 0 && (
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-danger" />
                <span className="fw-semibold small">⚡ Urgente esta semana</span>
              </div>
              <div className="d-flex flex-column gap-2">
                {urgentItems.map(item => (
                  <ItemCard
                    key={item.catalog.id}
                    item={item}
                    rec={recommendations.get(item.catalog.id)!}
                    onAction={action => handleQuickAction(item, action)}
                    onDetail={() => setDetailItem(item)}
                    loading={setAction.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Gift suggestions */}
          {giftItems.length > 0 && (
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Gift size={16} style={{ color: '#22c55e' }} />
                <span className="fw-semibold small">🎁 Ótimas opções para o chá de bebê</span>
              </div>
              <div className="d-flex flex-column gap-2">
                {giftItems.map(item => (
                  <ItemCard
                    key={item.catalog.id}
                    item={item}
                    rec={recommendations.get(item.catalog.id)!}
                    onAction={action => handleQuickAction(item, action)}
                    onDetail={() => setDetailItem(item)}
                    loading={setAction.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* USA items */}
          {usaItems.length > 0 && (
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Plane size={16} style={{ color: '#0ea5e9' }} />
                <span className="fw-semibold small">✈️ Vale comprar nos EUA</span>
              </div>
              <div className="d-flex flex-column gap-2">
                {usaItems.map(item => (
                  <ItemCard
                    key={item.catalog.id}
                    item={item}
                    rec={recommendations.get(item.catalog.id)!}
                    onAction={action => handleQuickAction(item, action)}
                    onDetail={() => setDetailItem(item)}
                    loading={setAction.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {urgentItems.length === 0 && giftItems.length === 0 && usaItems.length === 0 && (
            <div className="card border-0 shadow-sm p-4 text-center text-muted">
              <CheckCircle size={32} className="mx-auto mb-2 text-success opacity-50" />
              <p className="small mb-0">Nenhuma recomendação urgente — tudo em dia!</p>
            </div>
          )}
        </div>
      )}

      {/* ── PENDENTES / ADQUIRIDOS TABs ──────────────────────── */}
      {(activeTab === 'pendentes' || activeTab === 'adquiridos') && (
        <div>
          {/* Filters */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {/* Search */}
            <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ maxWidth: 200 }}
            />
            {/* Category filter */}
            <select
              className="form-select form-select-sm"
              style={{ maxWidth: 160 }}
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="__all">Todas as categorias</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]?.icon ?? ''} {CATEGORY_LABELS[c]?.name ?? c}
                </option>
              ))}
            </select>
            {/* Need level filter */}
            <select
              className="form-select form-select-sm"
              style={{ maxWidth: 140 }}
              value={needFilter}
              onChange={e => setNeedFilter(e.target.value)}
            >
              <option value="__all">Todos os níveis</option>
              {Object.entries(NEED_LEVEL_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Count */}
          <div className="text-muted small mb-2">{filteredItems.length} item(s)</div>

          {/* List */}
          {filteredItems.length === 0 ? (
            <div className="card border-0 shadow-sm p-4 text-center text-muted">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
              <p className="small mb-0">Nenhum item encontrado para este filtro.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {filteredItems.map(item => (
                <ItemCard
                  key={item.catalog.id}
                  item={item}
                  rec={recommendations.get(item.catalog.id)!}
                  onAction={action => handleQuickAction(item, action)}
                  onDetail={() => setDetailItem(item)}
                  loading={setAction.isPending}
                />
              ))}
            </div>
          )}

          {/* Show dispensed toggle */}
          {activeTab === 'pendentes' && items.some(i => i.isDispensed) && (
            <button
              className="btn btn-link text-muted small mt-2 p-0"
              onClick={() => setShowDispensed(!showDispensed)}
            >
              {showDispensed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {' '}
              {showDispensed ? 'Ocultar' : 'Mostrar'} itens dispensados ({items.filter(i => i.isDispensed).length})
            </button>
          )}
        </div>
      )}

      {/* ── INTELIGÊNCIA TAB ─────────────────────────────────── */}
      {activeTab === 'inteligencia' && (
        <div>
          <MovePlanSetup onSave={setMovePlan} />

          {movePlan && (
            <div>
              <div className="card border-0 shadow-sm p-3 mb-3" style={{ background: '#f0fdf4' }}>
                <div className="fw-semibold small mb-1 text-success">
                  ✈️ Mudança para {movePlan.city}, {movePlan.state} configurada
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Câmbio: R$ {movePlan.exchangeRate.toFixed(2)}/US$
                  {stats.estimatedSavings > 0 && ` · Economia estimada: R$ ${stats.estimatedSavings.toFixed(0)}`}
                </div>
              </div>

              {/* Items with savings */}
              {filteredItems.length === 0 ? (
                <div className="card border-0 shadow-sm p-4 text-center text-muted">
                  <DollarSign size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="small mb-0">Configure um câmbio para ver recomendações de economia.</p>
                </div>
              ) : (
                <>
                  <div className="text-muted small mb-2">{filteredItems.length} item(s) com economia nos EUA</div>
                  <div className="d-flex flex-column gap-2">
                    {filteredItems
                      .sort((a, b) => {
                        const ra = recommendations.get(a.catalog.id)?.savingsBRL ?? 0
                        const rb = recommendations.get(b.catalog.id)?.savingsBRL ?? 0
                        return rb - ra
                      })
                      .map(item => (
                        <ItemCard
                          key={item.catalog.id}
                          item={item}
                          rec={recommendations.get(item.catalog.id)!}
                          onAction={action => handleQuickAction(item, action)}
                          onDetail={() => setDetailItem(item)}
                          loading={setAction.isPending}
                        />
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailItem && (
        <DetailModal
          item={detailItem}
          rec={recommendations.get(detailItem.catalog.id)!}
          onSave={handleDetailSave as any}
          onClose={() => setDetailItem(null)}
          loading={saveDetails.isPending}
        />
      )}
    </div>
  )
}
