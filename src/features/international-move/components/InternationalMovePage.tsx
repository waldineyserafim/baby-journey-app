import { useState } from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Globe, Plus, Trash2, CheckCircle2, Circle, ChevronRight, Lightbulb } from 'lucide-react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useInternationalMove } from '../hooks/useInternationalMove'
import {
  MOVE_CHECKLIST_CATEGORIES,
  SUGGESTED_CHECKLIST_ITEMS,
  US_CITIES,
  type MoveChecklistItem,
  type MovePlan,
} from '../services/internationalMoveService'
import { ROUTES } from '@/shared/constants/routes'

const planSchema = z.object({
  planned_move_date: z.string().min(1, 'Data obrigatória'),
  destination_city: z.string().min(2, 'Cidade obrigatória'),
  destination_state: z.string().min(2, 'Estado obrigatório'),
  notes: z.string().optional(),
})
type PlanValues = z.infer<typeof planSchema>

function countdownStyle(days: number) {
  if (days > 90) return { bg: '#d1fae5', color: '#065f46' }
  if (days > 30) return { bg: '#fef3c7', color: '#92400e' }
  if (days > 0)  return { bg: '#fee2e2', color: '#991b1b' }
  return { bg: '#f3f4f6', color: '#374151' }
}

function MovePlanSection({
  movePlan,
  onSaved,
}: {
  movePlan: MovePlan | null
  onSaved: (values: PlanValues) => Promise<void>
}) {
  const [editing, setEditing] = useState(!movePlan)
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      planned_move_date: movePlan?.planned_move_date ?? '',
      destination_city: movePlan?.destination_city ?? '',
      destination_state: movePlan?.destination_state ?? '',
      notes: movePlan?.notes ?? '',
    },
  })

  async function onSubmit(values: PlanValues) {
    await onSaved(values)
    setEditing(false)
  }

  if (movePlan && !editing) {
    const days = differenceInDays(parseISO(movePlan.planned_move_date), new Date())
    const { bg, color } = countdownStyle(days)
    return (
      <div className="card border-0 shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="text-muted small fw-semibold mb-1">Destino</div>
            <div className="fw-bold fs-5">
              {movePlan.destination_city}, {movePlan.destination_state} 🇺🇸
            </div>
            <div className="text-muted small mt-1">
              {format(parseISO(movePlan.planned_move_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            {movePlan.notes && (
              <div className="text-muted small mt-2 fst-italic">{movePlan.notes}</div>
            )}
          </div>
          <div className="text-center ms-4 flex-shrink-0">
            <div className="rounded-3 px-3 py-2" style={{ background: bg, color, minWidth: 90 }}>
              <div className="fw-bold" style={{ fontSize: '1.8rem', lineHeight: 1 }}>
                {Math.max(0, days)}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                {days > 0 ? 'dias' : 'chegou!'}
              </div>
            </div>
          </div>
        </div>
        <button
          className="btn btn-link btn-sm p-0 mt-3 text-muted"
          style={{ fontSize: '0.8rem', width: 'fit-content' }}
          onClick={() => setEditing(true)}
        >
          Editar plano
        </button>
      </div>
    )
  }

  return (
    <div className="card border-0 shadow-sm p-4 mb-4">
      <h6 className="fw-bold mb-3">Configure a mudança</h6>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Data prevista *</label>
            <input
              {...register('planned_move_date')}
              type="date"
              className={`form-control ${errors.planned_move_date ? 'is-invalid' : ''}`}
            />
            {errors.planned_move_date && (
              <div className="invalid-feedback">{errors.planned_move_date.message}</div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Cidade destino *</label>
            <select
              className={`form-select ${errors.destination_city ? 'is-invalid' : ''}`}
              defaultValue={movePlan?.destination_city ?? ''}
              onChange={e => {
                const found = US_CITIES.find(c => c.city === e.target.value)
                if (found) {
                  setValue('destination_city', found.city)
                  setValue('destination_state', found.state)
                }
              }}
            >
              <option value="">Selecione a cidade...</option>
              {US_CITIES.map(c => (
                <option key={c.city} value={c.city}>{c.city}, {c.state}</option>
              ))}
            </select>
            <input {...register('destination_city')} type="hidden" />
            {errors.destination_city && (
              <div className="text-danger" style={{ fontSize: '0.75rem' }}>
                {errors.destination_city.message}
              </div>
            )}
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-semibold">Estado</label>
            <input
              {...register('destination_state')}
              className="form-control"
              placeholder="FL"
              maxLength={2}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold">Observações</label>
            <input
              {...register('notes')}
              className="form-control"
              placeholder="Ex: mudança junto com o nascimento do bebê..."
            />
          </div>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button
            type="submit"
            className="btn btn-sm text-white px-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="spinner-border spinner-border-sm me-1" />}
            Salvar plano
          </button>
          {movePlan && (
            <button type="button" className="btn btn-sm btn-light" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function CategoryChecklist({
  category,
  items,
  onToggle,
  onAdd,
  onRemove,
  addLoading,
  bulkLoading,
  onBulkAdd,
}: {
  category: typeof MOVE_CHECKLIST_CATEGORIES[0]
  items: MoveChecklistItem[]
  onToggle: (id: string, status: string | null) => void
  onAdd: (name: string) => Promise<void>
  onRemove: (id: string) => void
  addLoading: boolean
  bulkLoading: boolean
  onBulkAdd: (names: string[]) => Promise<void>
}) {
  const [newItem, setNewItem] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const categoryItems = items.filter(i => i.category === category.value)
  const done = categoryItems.filter(i => i.status === 'concluido').length
  const suggested = SUGGESTED_CHECKLIST_ITEMS[category.value] ?? []
  const existingNames = new Set(categoryItems.map(i => i.item_name.toLowerCase()))
  const newSuggestions = suggested.filter(s => !existingNames.has(s.toLowerCase()))

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newItem.trim()) return
    await onAdd(newItem.trim())
    setNewItem('')
  }

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>{category.emoji}</span>
            <div>
              <span className="fw-semibold">{category.label}</span>
              <span className="text-muted ms-2 small">{done}/{categoryItems.length}</span>
            </div>
          </div>
          {newSuggestions.length > 0 && (
            <button
              className="btn btn-sm btn-light d-flex align-items-center gap-1"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setShowSuggestions(s => !s)}
            >
              <Lightbulb size={12} />
              {newSuggestions.length} sugestões
            </button>
          )}
        </div>

        {categoryItems.length > 0 && (
          <div className="progress mb-3" style={{ height: 4, borderRadius: 2 }}>
            <div
              className="progress-bar"
              style={{
                width: `${Math.round((done / categoryItems.length) * 100)}%`,
                background: 'linear-gradient(90deg, #7c3aed, #db2777)',
              }}
            />
          </div>
        )}

        {showSuggestions && (
          <div className="rounded-3 p-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small fw-semibold text-muted">Sugestões para {category.label}</span>
              <button
                className="btn btn-sm text-white py-1 px-2"
                style={{ fontSize: '0.72rem', background: '#7c3aed' }}
                onClick={() => onBulkAdd(newSuggestions)}
                disabled={bulkLoading}
              >
                {bulkLoading
                  ? <span className="spinner-border spinner-border-sm" />
                  : `Adicionar todas (${newSuggestions.length})`
                }
              </button>
            </div>
            <div className="d-flex flex-column gap-1">
              {newSuggestions.map(s => (
                <div key={s} className="d-flex align-items-center gap-2">
                  <Circle size={12} className="text-muted flex-shrink-0" />
                  <span className="small text-secondary flex-grow-1">{s}</span>
                  <button
                    className="btn btn-sm p-0"
                    style={{ fontSize: '0.7rem', color: '#7c3aed' }}
                    onClick={() => onAdd(s)}
                    disabled={addLoading}
                  >
                    + Adicionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="d-flex flex-column gap-2 mb-3">
          {categoryItems.length === 0 && !showSuggestions && (
            <div className="text-muted small text-center py-2 fst-italic">
              Nenhum item ainda — adicione abaixo ou use as sugestões.
            </div>
          )}
          {categoryItems.map(item => (
            <div key={item.id} className="d-flex align-items-center gap-2">
              <button className="btn p-0 flex-shrink-0" onClick={() => onToggle(item.id, item.status)}>
                {item.status === 'concluido'
                  ? <CheckCircle2 size={18} style={{ color: '#7c3aed' }} />
                  : <Circle size={18} className="text-muted" />
                }
              </button>
              <span
                className="flex-grow-1 small"
                style={{
                  textDecoration: item.status === 'concluido' ? 'line-through' : 'none',
                  color: item.status === 'concluido' ? '#94a3b8' : '#374151',
                }}
              >
                {item.item_name}
              </span>
              <button
                className="btn btn-sm p-0 text-muted opacity-50"
                style={{ lineHeight: 1 }}
                onClick={() => onRemove(item.id)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder={`Adicionar item em ${category.label}...`}
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-sm btn-light flex-shrink-0"
            disabled={addLoading || !newItem.trim()}
          >
            <Plus size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}

export function InternationalMovePage() {
  const { movePlan, checklist, isLoading, savePlan, addItem, toggleItem, removeItem, bulkAdd } =
    useInternationalMove()
  const [activeCategory, setActiveCategory] = useState('documentos')

  async function handleAddItem(name: string) {
    await addItem.mutateAsync({ category: activeCategory, item_name: name })
  }

  async function handleBulkAdd(names: string[]) {
    await bulkAdd.mutateAsync(names.map(n => ({ category: activeCategory, item_name: n })))
  }

  const totalItems = checklist.length
  const doneItems = checklist.filter(i => i.status === 'concluido').length
  const progressPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" style={{ color: '#7c3aed' }} />
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex align-items-start justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Globe size={20} style={{ color: '#7c3aed' }} />
            Plano de Mudança
          </h4>
          <p className="text-muted small mb-0">Organize sua mudança para os EUA</p>
        </div>
        <Link
          to={ROUTES.LAYETTE_INTELLIGENCE}
          className="btn btn-sm d-flex align-items-center gap-1"
          style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '0.78rem' }}
        >
          🛍️ Inteligência de Enxoval
          <ChevronRight size={13} />
        </Link>
      </div>

      <MovePlanSection movePlan={movePlan} onSaved={v => savePlan.mutateAsync(v).then(() => {})} />

      {totalItems > 0 && (
        <div className="card border-0 shadow-sm p-3 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small fw-semibold">Progresso geral do checklist</span>
            <span className="small fw-bold" style={{ color: '#7c3aed' }}>
              {doneItems}/{totalItems} ({progressPct}%)
            </span>
          </div>
          <div className="progress" style={{ height: 8, borderRadius: 4 }}>
            <div
              className="progress-bar"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #7c3aed, #db2777)',
                borderRadius: 4,
              }}
            />
          </div>
          <div className="d-flex justify-content-between mt-2">
            {MOVE_CHECKLIST_CATEGORIES.map(cat => {
              const catItems = checklist.filter(i => i.category === cat.value)
              const catDone = catItems.filter(i => i.status === 'concluido').length
              return (
                <div key={cat.value} className="text-center" style={{ fontSize: '0.65rem', color: '#64748b' }}>
                  <div>{cat.emoji}</div>
                  <div>{catDone}/{catItems.length}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ul className="nav nav-pills mb-3 gap-1 flex-wrap">
        {MOVE_CHECKLIST_CATEGORIES.map(cat => {
          const catItems = checklist.filter(i => i.category === cat.value)
          const catDone = catItems.filter(i => i.status === 'concluido').length
          return (
            <li key={cat.value} className="nav-item">
              <button
                className={`nav-link btn btn-sm ${activeCategory === cat.value ? 'active' : 'text-secondary'}`}
                onClick={() => setActiveCategory(cat.value)}
                style={{ fontSize: '0.78rem' }}
              >
                {cat.emoji} {cat.label}
                {catItems.length > 0 && (
                  <span
                    className="badge ms-1"
                    style={{
                      fontSize: '0.6rem',
                      background: catDone === catItems.length ? '#22c55e' : '#e2e8f0',
                      color: catDone === catItems.length ? '#fff' : '#64748b',
                    }}
                  >
                    {catDone}/{catItems.length}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {MOVE_CHECKLIST_CATEGORIES.filter(c => c.value === activeCategory).map(cat => (
        <CategoryChecklist
          key={cat.value}
          category={cat}
          items={checklist}
          onToggle={(id, status) => toggleItem.mutate({ id, status })}
          onAdd={handleAddItem}
          onRemove={id => removeItem.mutate(id)}
          addLoading={addItem.isPending}
          bulkLoading={bulkAdd.isPending}
          onBulkAdd={handleBulkAdd}
        />
      ))}
    </div>
  )
}
