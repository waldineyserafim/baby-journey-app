import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Milestone, Heart, Baby, Gift, FileText, Building2,
  CalendarDays, Star, Plus, Edit2, Trash2, Sparkles,
} from 'lucide-react'
import { useTimeline } from '../hooks/useTimeline'
import { TimelineForm } from './TimelineForm'
import { MILESTONE_TYPES } from '../services/timelineService'
import type { TimelineMilestone } from '../services/timelineService'
import type { TimelineFormValues } from './TimelineForm'

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: typeof Star }> = {
  first_ultrasound: { label: 'Primeiro Ultrassom', color: '#7c3aed', bg: '#ede9fe', Icon: Milestone },
  heartbeat:        { label: 'Primeiro Batimento', color: '#ef4444', bg: '#fee2e2', Icon: Heart },
  first_kick:       { label: 'Primeiro Chute',     color: '#f97316', bg: '#ffedd5', Icon: Baby },
  baby_shower:      { label: 'Chá de Bebê',        color: '#ec4899', bg: '#fce7f3', Icon: Gift },
  birth_plan:       { label: 'Plano de Parto',     color: '#0ea5e9', bg: '#e0f2fe', Icon: FileText },
  hospital_tour:    { label: 'Visita à Maternidade', color: '#14b8a6', bg: '#ccfbf1', Icon: Building2 },
  doctor_appointment: { label: 'Consulta',         color: '#6366f1', bg: '#e0e7ff', Icon: CalendarDays },
  personal:         { label: 'Momento Pessoal',    color: '#f59e0b', bg: '#fef3c7', Icon: Star },
  other:            { label: 'Outro',              color: '#64748b', bg: '#f1f5f9', Icon: Sparkles },
}

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.other
}

export function TimelinePage() {
  const { data: milestones, isLoading, create, update, remove } = useTimeline()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<TimelineMilestone | null>(null)

  function openCreate() { setEditing(null); setModal('create') }
  function openEdit(m: TimelineMilestone) { setEditing(m); setModal('edit') }
  function closeModal() { setModal(null); setEditing(null) }

  async function handleSubmit(values: TimelineFormValues) {
    const payload = {
      title: values.title,
      milestone_type: values.milestone_type,
      milestone_date: values.milestone_date,
      week_number: values.week_number === '' ? null : Number(values.week_number),
      description: values.description || null,
      is_public: values.is_public ?? false,
    }
    if (modal === 'edit' && editing) {
      await update.mutateAsync({ id: editing.id, fields: payload })
    } else {
      await create.mutateAsync(payload)
    }
    closeModal()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este marco?')) return
    await remove.mutateAsync(id)
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" style={{ color: '#7c3aed' }} />
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0">Timeline da Gestação</h4>
          <p className="text-muted small mb-0">{milestones.length} marco(s) registrado(s)</p>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={openCreate}>
          <Plus size={16} />
          Novo Marco
        </button>
      </div>

      {milestones.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Milestone size={40} className="mx-auto mb-3 opacity-50" />
          <p className="mb-1 fw-semibold">Nenhum marco registrado ainda</p>
          <p className="small mb-3">
            Registre os momentos especiais da sua gestação — primeiro ultrassom,
            primeiro chute, chá de bebê e muito mais.
          </p>
          <button
            className="btn btn-primary btn-sm mx-auto"
            style={{ width: 'fit-content' }}
            onClick={openCreate}
          >
            <Plus size={14} className="me-1" />
            Primeiro marco
          </button>
        </div>
      )}

      {milestones.length > 0 && (
        <div className="position-relative ps-4" style={{ borderLeft: '2px solid #e2e8f0' }}>
          {milestones.map((m, idx) => {
            const config = getConfig(m.milestone_type)
            const { Icon } = config
            const typeLabel = MILESTONE_TYPES.find(t => t.value === m.milestone_type)?.label ?? m.milestone_type

            return (
              <div key={m.id} className={`position-relative mb-4 ${idx === milestones.length - 1 ? 'mb-0' : ''}`}>
                {/* dot on the timeline */}
                <div
                  className="position-absolute d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    left: -29,
                    top: 4,
                    width: 32,
                    height: 32,
                    background: config.bg,
                    border: `2px solid ${config.color}`,
                    zIndex: 1,
                  }}
                >
                  <Icon size={14} style={{ color: config.color }} />
                </div>

                <div className="card border-0 shadow-sm p-3">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                        <span className="fw-semibold">{m.title}</span>
                        {m.week_number && (
                          <span
                            className="badge rounded-pill"
                            style={{ background: `${config.color}15`, color: config.color, fontSize: '0.7rem' }}
                          >
                            Semana {m.week_number}
                          </span>
                        )}
                        {m.is_public && (
                          <span className="badge bg-light text-secondary border" style={{ fontSize: '0.65rem' }}>
                            público
                          </span>
                        )}
                      </div>

                      <div className="d-flex align-items-center gap-3">
                        <span
                          className="badge"
                          style={{ background: config.bg, color: config.color, fontSize: '0.7rem' }}
                        >
                          {typeLabel}
                        </span>
                        <span className="text-muted small">
                          {format(parseISO(m.milestone_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>

                      {m.description && (
                        <p className="small text-muted mb-0 mt-2">{m.description}</p>
                      )}
                    </div>

                    <div className="d-flex gap-1 flex-shrink-0">
                      <button
                        className="btn btn-sm btn-light p-1"
                        onClick={() => openEdit(m)}
                        title="Editar"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-sm btn-light p-1 text-danger"
                        onClick={() => handleDelete(m.id)}
                        title="Remover"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <TimelineForm
          initial={editing}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={create.isPending || update.isPending}
        />
      )}
    </div>
  )
}
