import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ShieldAlert, Users, Baby, Building2, ShoppingCart, Plus, Edit2, Eye, EyeOff } from 'lucide-react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/shared/hooks/useAuth'
import { useAdminStats, useAdminCatalog } from '../hooks/useAdmin'
import type { LayetteCatalog } from '../services/adminService'

const CRITICALITY_OPTIONS = ['CRITICO', 'IMPORTANTE', 'OPCIONAL'] as const
const USAGE_OPTIONS = ['NO_NASCIMENTO', 'ATE_3_MESES', 'ATE_6_MESES', 'APOS_6_MESES'] as const
const CATEGORY_OPTIONS = ['quarto', 'higiene', 'alimentacao', 'passeio', 'roupas'] as const
const REC_OPTIONS = ['COMPRAR_AGORA_BRASIL', 'AGUARDAR_EUA', 'SO_PROMOCAO', 'RECEBER_PRESENTE', 'NAO_PRIORITARIO'] as const

const catalogSchema = z.object({
  item_name: z.string().min(1, 'Nome obrigatório'),
  category: z.string().min(1, 'Categoria obrigatória'),
  description: z.string().optional(),
  ideal_quantity: z.coerce.number().int().min(1).default(1),
  criticality: z.string().min(1),
  usage_period: z.string().min(1),
  price_brl_min: z.union([z.literal(''), z.coerce.number().min(0)]).optional(),
  price_brl_max: z.union([z.literal(''), z.coerce.number().min(0)]).optional(),
  price_usd_min: z.union([z.literal(''), z.coerce.number().min(0)]).optional(),
  price_usd_max: z.union([z.literal(''), z.coerce.number().min(0)]).optional(),
  base_recommendation: z.string().min(1),
  sort_order: z.coerce.number().int().min(0).default(0),
})
type CatalogValues = z.infer<typeof catalogSchema>

function CatalogModal({
  item,
  onClose,
  onSave,
  loading,
}: {
  item: LayetteCatalog | null
  onClose: () => void
  onSave: (values: CatalogValues) => Promise<void>
  loading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CatalogValues>({
    resolver: zodResolver(catalogSchema) as any,
    defaultValues: item ? {
      item_name: item.item_name,
      category: item.category,
      description: item.description ?? '',
      ideal_quantity: item.ideal_quantity ?? 1,
      criticality: item.criticality,
      usage_period: item.usage_period,
      price_brl_min: item.price_brl_min ?? '',
      price_brl_max: item.price_brl_max ?? '',
      price_usd_min: item.price_usd_min ?? '',
      price_usd_max: item.price_usd_max ?? '',
      base_recommendation: item.base_recommendation ?? 'COMPRAR_AGORA_BRASIL',
      sort_order: item.sort_order ?? 0,
    } : {
      criticality: 'IMPORTANTE',
      usage_period: 'NO_NASCIMENTO',
      base_recommendation: 'COMPRAR_AGORA_BRASIL',
      ideal_quantity: 1,
      sort_order: 0,
    },
  })

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{item ? 'Editar item' : 'Novo item do catálogo'}</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit(onSave)}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Nome *</label>
                  <input {...register('item_name')} className={`form-control ${errors.item_name ? 'is-invalid' : ''}`} />
                  {errors.item_name && <div className="invalid-feedback">{errors.item_name.message}</div>}
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Categoria *</label>
                  <select {...register('category')} className="form-select">
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Qtd ideal</label>
                  <input {...register('ideal_quantity')} type="number" min={1} className="form-control" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold small">Descrição</label>
                  <input {...register('description')} className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Criticidade *</label>
                  <select {...register('criticality')} className="form-select">
                    {CRITICALITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Período de uso *</label>
                  <select {...register('usage_period')} className="form-select">
                    {USAGE_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Recomendação base</label>
                  <select {...register('base_recommendation')} className="form-select">
                    {REC_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Preço BR mín (R$)</label>
                  <input {...register('price_brl_min')} type="number" step="0.01" className="form-control" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Preço BR máx (R$)</label>
                  <input {...register('price_brl_max')} type="number" step="0.01" className="form-control" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Preço US mín ($)</label>
                  <input {...register('price_usd_min')} type="number" step="0.01" className="form-control" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Preço US máx ($)</label>
                  <input {...register('price_usd_max')} type="number" step="0.01" className="form-control" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Sort order</label>
                  <input {...register('sort_order')} type="number" min={0} className="form-control" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function MetricsTab() {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) return <div className="d-flex justify-content-center py-4"><div className="spinner-border" style={{ color: '#7c3aed' }} /></div>

  return (
    <div>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 text-center">
            <Building2 size={28} className="mx-auto mb-2" style={{ color: '#7c3aed' }} />
            <div className="fw-bold" style={{ fontSize: '2rem', color: '#7c3aed' }}>{stats?.tenantsCount ?? 0}</div>
            <div className="text-muted small">Tenants (famílias)</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 text-center">
            <Users size={28} className="mx-auto mb-2" style={{ color: '#0ea5e9' }} />
            <div className="fw-bold" style={{ fontSize: '2rem', color: '#0ea5e9' }}>{stats?.usersCount ?? 0}</div>
            <div className="text-muted small">Usuários cadastrados</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 text-center">
            <Baby size={28} className="mx-auto mb-2" style={{ color: '#ec4899' }} />
            <div className="fw-bold" style={{ fontSize: '2rem', color: '#ec4899' }}>{stats?.pregnanciesCount ?? 0}</div>
            <div className="text-muted small">Gestações registradas</div>
          </div>
        </div>
      </div>

      {stats && stats.recentTenants.length > 0 && (
        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-3">Últimos tenants cadastrados</h6>
          <div className="d-flex flex-column gap-2">
            {stats.recentTenants.map(t => (
              <div key={t.id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                <div>
                  <div className="fw-semibold small">{t.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {t.created_at
                      ? format(new Date(t.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : '—'}
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background: t.plan_type === 'free' ? '#f1f5f9' : '#ede9fe',
                    color: t.plan_type === 'free' ? '#64748b' : '#7c3aed',
                    fontSize: '0.7rem',
                  }}
                >
                  {t.plan_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CatalogTab() {
  const { data: items, isLoading, upsert, toggle } = useAdminCatalog()
  const [editing, setEditing] = useState<LayetteCatalog | null | 'new'>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = [...new Set(items.map(i => i.category))]
  const filtered = categoryFilter === 'all' ? items : items.filter(i => i.category === categoryFilter)

  async function handleSave(values: CatalogValues) {
    const editingItem = editing !== 'new' ? editing : null
    await upsert.mutateAsync({
      ...(editingItem?.id ? { id: editingItem.id } : {}),
      item_name: values.item_name,
      category: values.category,
      description: values.description || null,
      ideal_quantity: Number(values.ideal_quantity),
      criticality: values.criticality,
      usage_period: values.usage_period,
      price_brl_min: values.price_brl_min === '' ? null : Number(values.price_brl_min) || null,
      price_brl_max: values.price_brl_max === '' ? null : Number(values.price_brl_max) || null,
      price_usd_min: values.price_usd_min === '' ? null : Number(values.price_usd_min) || null,
      price_usd_max: values.price_usd_max === '' ? null : Number(values.price_usd_max) || null,
      base_recommendation: values.base_recommendation,
      sort_order: Number(values.sort_order),
      is_active: editingItem?.is_active ?? true,
    })
    setEditing(null)
  }

  const critColors: Record<string, string> = {
    CRITICO: '#ef4444', IMPORTANTE: '#f59e0b', OPCIONAL: '#94a3b8',
  }

  if (isLoading) return <div className="d-flex justify-content-center py-4"><div className="spinner-border" style={{ color: '#7c3aed' }} /></div>

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex gap-1 flex-wrap">
          {(['all', ...categories] as const).map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-light'}`}
              style={{ fontSize: '0.75rem' }}
              onClick={() => setCategoryFilter(cat as string)}
            >
              {cat === 'all' ? `Todos (${items.length})` : `${cat} (${items.filter(i => i.category === cat).length})`}
            </button>
          ))}
        </div>
        <button
          className="btn btn-sm btn-primary d-flex align-items-center gap-1"
          onClick={() => setEditing('new')}
        >
          <Plus size={14} /> Novo item
        </button>
      </div>

      <div className="d-flex flex-column gap-2">
        {filtered.map(item => (
          <div
            key={item.id}
            className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3"
            style={{ opacity: item.is_active ? 1 : 0.5 }}
          >
            <div className="flex-grow-1 overflow-hidden">
              <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                <span className="fw-semibold small">{item.item_name}</span>
                <span className="badge" style={{ background: `${critColors[item.criticality]}20`, color: critColors[item.criticality], fontSize: '0.6rem' }}>
                  {item.criticality}
                </span>
                <span className="badge bg-light text-muted" style={{ fontSize: '0.6rem' }}>{item.category}</span>
                <span className="badge bg-light text-muted" style={{ fontSize: '0.6rem' }}>{item.usage_period}</span>
              </div>
              {(item.price_brl_min || item.price_usd_min) && (
                <div className="small text-muted">
                  {item.price_brl_min && `🇧🇷 R$ ${item.price_brl_min}${item.price_brl_max ? `–${item.price_brl_max}` : ''}`}
                  {item.price_brl_min && item.price_usd_min && '  '}
                  {item.price_usd_min && `🇺🇸 $ ${item.price_usd_min}${item.price_usd_max ? `–${item.price_usd_max}` : ''}`}
                </div>
              )}
            </div>
            <div className="d-flex gap-1 flex-shrink-0">
              <button
                className="btn btn-sm btn-light p-1"
                onClick={() => toggle.mutate({ id: item.id, isActive: item.is_active ?? true })}
                title={item.is_active ? 'Desativar' : 'Ativar'}
              >
                {item.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <button className="btn btn-sm btn-light p-1" onClick={() => setEditing(item)} title="Editar">
                <Edit2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <CatalogModal
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          loading={upsert.isPending}
        />
      )}
    </div>
  )
}

type AdminTab = 'metrics' | 'catalog'

export function AdminPage() {
  const { profile } = useAuth()
  const [tab, setTab] = useState<AdminTab>('metrics')

  if (profile?.role !== 'platform_admin') {
    return (
      <div className="card border-0 shadow-sm p-5 text-center text-muted">
        <ShieldAlert size={40} className="mx-auto mb-3" style={{ color: '#ef4444' }} />
        <p className="fw-semibold mb-1">Acesso restrito</p>
        <p className="small">Esta página é exclusiva para administradores da plataforma.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4">
        <ShieldAlert size={20} style={{ color: '#7c3aed' }} />
        <div>
          <h4 className="fw-bold mb-0">Painel Admin</h4>
          <p className="text-muted small mb-0">Baby Journey — plataforma</p>
        </div>
      </div>

      <ul className="nav nav-pills mb-4 gap-1">
        <li className="nav-item">
          <button
            className={`nav-link btn btn-sm ${tab === 'metrics' ? 'active' : 'text-secondary'}`}
            onClick={() => setTab('metrics')}
            style={{ fontSize: '0.8rem' }}
          >
            <Users size={14} className="me-1" />
            Métricas
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn btn-sm ${tab === 'catalog' ? 'active' : 'text-secondary'}`}
            onClick={() => setTab('catalog')}
            style={{ fontSize: '0.8rem' }}
          >
            <ShoppingCart size={14} className="me-1" />
            Catálogo de Enxoval
          </button>
        </li>
      </ul>

      {tab === 'metrics' && <MetricsTab />}
      {tab === 'catalog' && <CatalogTab />}
    </div>
  )
}
