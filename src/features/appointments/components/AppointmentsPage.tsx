import { useState } from 'react'
import { format, isPast, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Plus, Edit2, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useAppointments } from '../hooks/useAppointments'
import { AppointmentForm } from './AppointmentForm'
import type { Appointment } from '../services/appointmentService'

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  scheduled: { label: 'Agendada', color: 'primary', icon: Clock },
  completed: { label: 'Realizada', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'secondary', icon: XCircle },
}

const TYPE_LABELS: Record<string, string> = {
  obstetrica: 'Obstétrica',
  especialidade: 'Especialidade',
  outro: 'Outro',
}

export function AppointmentsPage() {
  const { data: appointments = [], isLoading, create, update, remove } = useAppointments()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Appointment | null>(null)

  const upcoming = appointments.filter(a => a.status === 'scheduled' && !isPast(parseISO(a.appointment_at)))
  const past = appointments.filter(a => a.status !== 'scheduled' || isPast(parseISO(a.appointment_at)))

  function openCreate() {
    setEditing(null)
    setModal('create')
  }

  function openEdit(a: Appointment) {
    setEditing(a)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setEditing(null)
  }

  async function handleSubmit(values: Parameters<typeof create.mutateAsync>[0]) {
    if (modal === 'edit' && editing) {
      await update.mutateAsync({ id: editing.id, fields: values })
    } else {
      await create.mutateAsync(values)
    }
    closeModal()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta consulta?')) return
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
          <h4 className="fw-bold mb-0">Consultas</h4>
          <p className="text-muted small mb-0">{appointments.length} consulta(s) registrada(s)</p>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={openCreate}>
          <Plus size={16} />
          Nova Consulta
        </button>
      </div>

      {appointments.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Calendar size={40} className="mx-auto mb-3 opacity-50" />
          <p className="mb-1 fw-semibold">Nenhuma consulta cadastrada</p>
          <p className="small mb-3">Registre suas consultas do pré-natal e especialidades.</p>
          <button className="btn btn-primary btn-sm mx-auto" style={{ width: 'fit-content' }} onClick={openCreate}>
            <Plus size={14} className="me-1" />
            Adicionar consulta
          </button>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-4">
          <h6 className="text-muted text-uppercase fw-semibold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            Próximas ({upcoming.length})
          </h6>
          <div className="d-flex flex-column gap-2">
            {upcoming.map(a => (
              <AppointmentCard key={a.id} appointment={a} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h6 className="text-muted text-uppercase fw-semibold mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            Histórico ({past.length})
          </h6>
          <div className="d-flex flex-column gap-2">
            {past.map(a => (
              <AppointmentCard key={a.id} appointment={a} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {modal && (
        <AppointmentForm
          initial={editing}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={create.isPending || update.isPending}
        />
      )}
    </div>
  )
}

function AppointmentCard({
  appointment: a,
  onEdit,
  onDelete,
}: {
  appointment: Appointment
  onEdit: (a: Appointment) => void
  onDelete: (id: string) => void
}) {
  const status = STATUS_LABELS[a.status ?? 'scheduled'] ?? STATUS_LABELS.scheduled
  const StatusIcon = status.icon

  return (
    <div className="card border-0 shadow-sm p-3">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div className="d-flex align-items-start gap-3 flex-grow-1 min-w-0">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
            style={{ width: 36, height: 36, background: '#f3e8ff' }}
          >
            <Calendar size={16} style={{ color: '#7c3aed' }} />
          </div>
          <div className="min-w-0">
            <div className="fw-semibold text-truncate">{a.title}</div>
            <div className="small text-muted">
              {format(parseISO(a.appointment_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
            </div>
            <div className="d-flex flex-wrap gap-2 mt-1">
              <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                {TYPE_LABELS[a.appointment_type] ?? a.appointment_type}
              </span>
              {a.doctor_name && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {a.doctor_name}
                </span>
              )}
              {a.clinic_name && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  · {a.clinic_name}
                </span>
              )}
            </div>
            {a.notes && (
              <p className="small text-muted mb-0 mt-1">{a.notes}</p>
            )}
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <span className={`badge bg-${status.color}-subtle text-${status.color} border border-${status.color}-subtle d-flex align-items-center gap-1`} style={{ fontSize: '0.7rem' }}>
            <StatusIcon size={10} />
            {status.label}
          </span>
          <button className="btn btn-sm btn-light p-1" onClick={() => onEdit(a)} title="Editar">
            <Edit2 size={13} />
          </button>
          <button className="btn btn-sm btn-light p-1 text-danger" onClick={() => onDelete(a.id)} title="Remover">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
