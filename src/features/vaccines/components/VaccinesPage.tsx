import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Syringe, Plus, Check, Clock, AlertCircle, Trash2, X } from 'lucide-react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useVaccines } from '../hooks/useVaccines'
import { PREDEFINED_VACCINES } from '../services/vaccineService'
import type { Vaccine } from '../services/vaccineService'

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'warning', icon: AlertCircle },
  scheduled: { label: 'Agendada', color: 'primary', icon: Clock },
  applied: { label: 'Aplicada', color: 'success', icon: Check },
}

const addSchema = z.object({
  vaccine_name: z.string().min(1, 'Nome obrigatório'),
  status: z.string().default('pending'),
  scheduled_date: z.string().optional(),
  applied_date: z.string().optional(),
  notes: z.string().optional(),
})

const editSchema = z.object({
  status: z.string(),
  scheduled_date: z.string().optional(),
  applied_date: z.string().optional(),
  notes: z.string().optional(),
})

type AddValues = z.infer<typeof addSchema>
type EditValues = z.infer<typeof editSchema>

export function VaccinesPage() {
  const { data: vaccines = [], isLoading, create, update, remove } = useVaccines()
  const [addModal, setAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [customName, setCustomName] = useState(false)

  const addForm = useForm<AddValues>({
    resolver: zodResolver(addSchema) as any,
    defaultValues: { vaccine_name: '', status: 'pending', scheduled_date: '', applied_date: '', notes: '' },
  })

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema) as any,
  })

  const existingNames = new Set(vaccines.map(v => v.vaccine_name))
  const availablePredefined = PREDEFINED_VACCINES.filter(n => !existingNames.has(n))

  function openEdit(v: Vaccine) {
    setEditingId(v.id)
    editForm.reset({
      status: v.status ?? 'pending',
      scheduled_date: v.scheduled_date ?? '',
      applied_date: v.applied_date ?? '',
      notes: v.notes ?? '',
    })
  }

  async function handleAdd(values: AddValues) {
    await create.mutateAsync({
      vaccine_name: values.vaccine_name,
      status: values.status || 'pending',
      scheduled_date: values.scheduled_date || null,
      applied_date: values.applied_date || null,
      notes: values.notes || null,
    })
    setAddModal(false)
    addForm.reset()
  }

  async function handleEdit(values: EditValues) {
    if (!editingId) return
    await update.mutateAsync({
      id: editingId,
      fields: {
        status: values.status,
        scheduled_date: values.scheduled_date || null,
        applied_date: values.applied_date || null,
        notes: values.notes || null,
      },
    })
    setEditingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta vacina?')) return
    await remove.mutateAsync(id)
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" style={{ color: '#7c3aed' }} />
      </div>
    )
  }

  const applied = vaccines.filter(v => v.status === 'applied')
  const pending = vaccines.filter(v => v.status !== 'applied')

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0">Vacinas</h4>
          <p className="text-muted small mb-0">
            {applied.length}/{vaccines.length} aplicada(s)
          </p>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setAddModal(true)}>
          <Plus size={16} />
          Adicionar Vacina
        </button>
      </div>

      {vaccines.length > 0 && (
        <div className="mb-3">
          <div className="progress" style={{ height: 8 }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${vaccines.length > 0 ? (applied.length / vaccines.length) * 100 : 0}%` }}
            />
          </div>
          <div className="d-flex justify-content-between mt-1">
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              {applied.length} aplicada(s)
            </span>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              {pending.length} pendente(s)
            </span>
          </div>
        </div>
      )}

      {vaccines.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Syringe size={40} className="mx-auto mb-3 opacity-50" />
          <p className="mb-1 fw-semibold">Nenhuma vacina cadastrada</p>
          <p className="small mb-3">Adicione as vacinas do pré-natal para acompanhar seu calendário vacinal.</p>
          <button className="btn btn-primary btn-sm mx-auto" style={{ width: 'fit-content' }} onClick={() => setAddModal(true)}>
            <Plus size={14} className="me-1" />
            Adicionar vacina
          </button>
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-4">
          <h6 className="text-muted text-uppercase fw-semibold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            Pendentes / Agendadas ({pending.length})
          </h6>
          <div className="d-flex flex-column gap-2">
            {pending.map(v => (
              <VaccineCard key={v.id} vaccine={v} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {applied.length > 0 && (
        <section>
          <h6 className="text-muted text-uppercase fw-semibold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            Aplicadas ({applied.length})
          </h6>
          <div className="d-flex flex-column gap-2">
            {applied.map(v => (
              <VaccineCard key={v.id} vaccine={v} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {/* Modal: Adicionar */}
      {addModal && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Adicionar Vacina</h5>
                <button type="button" className="btn-close" onClick={() => { setAddModal(false); addForm.reset() }} />
              </div>
              <form onSubmit={addForm.handleSubmit(handleAdd)}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Vacina *</label>
                    {!customName ? (
                      <>
                        <select
                          className="form-select mb-2"
                          onChange={e => {
                            if (e.target.value === '__custom') {
                              setCustomName(true)
                              addForm.setValue('vaccine_name', '')
                            } else {
                              addForm.setValue('vaccine_name', e.target.value)
                            }
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Selecione uma vacina...</option>
                          {availablePredefined.map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                          <option value="__custom">+ Outra (digitar nome)</option>
                        </select>
                        {addForm.formState.errors.vaccine_name && (
                          <div className="text-danger small">{addForm.formState.errors.vaccine_name.message}</div>
                        )}
                      </>
                    ) : (
                      <div className="d-flex gap-2">
                        <input
                          {...addForm.register('vaccine_name')}
                          className="form-control"
                          placeholder="Nome da vacina"
                          autoFocus
                        />
                        <button type="button" className="btn btn-light btn-sm" onClick={() => { setCustomName(false); addForm.setValue('vaccine_name', '') }}>
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <select {...addForm.register('status')} className="form-select">
                      <option value="pending">Pendente</option>
                      <option value="scheduled">Agendada</option>
                      <option value="applied">Aplicada</option>
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold">Data Agendada</label>
                      <input {...addForm.register('scheduled_date')} type="date" className="form-control" />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold">Data Aplicação</label>
                      <input {...addForm.register('applied_date')} type="date" className="form-control" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Observações</label>
                    <input {...addForm.register('notes')} className="form-control" placeholder="Lote, local, etc." />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => { setAddModal(false); addForm.reset() }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={create.isPending}>
                    {create.isPending && <span className="spinner-border spinner-border-sm me-2" />}
                    Adicionar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar */}
      {editingId && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Atualizar Vacina</h5>
                <button type="button" className="btn-close" onClick={() => setEditingId(null)} />
              </div>
              <form onSubmit={editForm.handleSubmit(handleEdit)}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <select {...editForm.register('status')} className="form-select">
                      <option value="pending">Pendente</option>
                      <option value="scheduled">Agendada</option>
                      <option value="applied">Aplicada</option>
                    </select>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold">Data Agendada</label>
                      <input {...editForm.register('scheduled_date')} type="date" className="form-control" />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-semibold">Data Aplicação</label>
                      <input {...editForm.register('applied_date')} type="date" className="form-control" />
                    </div>
                  </div>
                  <div className="mb-1">
                    <label className="form-label fw-semibold">Observações</label>
                    <input {...editForm.register('notes')} className="form-control" placeholder="Lote, local, etc." />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setEditingId(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={update.isPending}>
                    {update.isPending && <span className="spinner-border spinner-border-sm me-2" />}
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VaccineCard({ vaccine: v, onEdit, onDelete }: { vaccine: Vaccine; onEdit: (v: Vaccine) => void; onDelete: (id: string) => void }) {
  const config = STATUS_CONFIG[v.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const StatusIcon = config.icon

  return (
    <div className="card border-0 shadow-sm p-3">
      <div className="d-flex align-items-center justify-content-between gap-2">
        <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 36, height: 36, background: v.status === 'applied' ? '#dcfce7' : '#fef9c3' }}
          >
            <Syringe size={16} style={{ color: v.status === 'applied' ? '#16a34a' : '#ca8a04' }} />
          </div>
          <div className="min-w-0">
            <div className="fw-semibold text-truncate">{v.vaccine_name}</div>
            <div className="d-flex flex-wrap gap-3 mt-1">
              {v.scheduled_date && (
                <span className="small text-muted">
                  Agendada: {format(parseISO(v.scheduled_date), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              )}
              {v.applied_date && (
                <span className="small text-success fw-semibold">
                  Aplicada: {format(parseISO(v.applied_date), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              )}
            </div>
            {v.notes && <p className="small text-muted mb-0 mt-1">{v.notes}</p>}
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <span className={`badge text-bg-${config.color} d-flex align-items-center gap-1`} style={{ fontSize: '0.7rem' }}>
            <StatusIcon size={10} />
            {config.label}
          </span>
          <button className="btn btn-sm btn-light p-1" onClick={() => onEdit(v)} title="Editar">
            <Clock size={13} />
          </button>
          <button className="btn btn-sm btn-light p-1 text-danger" onClick={() => onDelete(v.id)} title="Remover">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
