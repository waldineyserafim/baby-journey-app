import { useState } from 'react'
import { format, parseISO, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, Plus, Trash2, CheckCheck, Check, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNotifications } from '../hooks/useNotifications'
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_COLORS,
  type Notification,
} from '../services/notificationService'

const createSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  message: z.string().min(1, 'Mensagem obrigatória'),
  scheduled_date: z.string().min(1, 'Data obrigatória'),
  scheduled_time: z.string().min(1, 'Hora obrigatória'),
})
type CreateValues = z.infer<typeof createSchema>

function formatScheduled(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return `Hoje, ${format(date, 'HH:mm')}`
  if (isTomorrow(date)) return `Amanhã, ${format(date, 'HH:mm')}`
  if (isThisWeek(date)) return format(date, "EEEE 'às' HH:mm", { locale: ptBR })
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

function CreateModal({
  onClose,
  onCreate,
  loading,
}: {
  onClose: () => void
  onCreate: (title: string, message: string, scheduledFor: string) => Promise<void>
  loading: boolean
}) {
  const now = new Date()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      scheduled_date: format(now, 'yyyy-MM-dd'),
      scheduled_time: format(now, 'HH:mm'),
    },
  })

  async function onSubmit(values: CreateValues) {
    const scheduledFor = new Date(`${values.scheduled_date}T${values.scheduled_time}`).toISOString()
    await onCreate(values.title, values.message, scheduledFor)
  }

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">Novo lembrete</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold small">Título *</label>
                <input
                  {...register('title')}
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="Ex: Consulta pré-natal"
                />
                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Mensagem *</label>
                <textarea
                  {...register('message')}
                  className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                  rows={3}
                  placeholder="Detalhes do lembrete..."
                />
                {errors.message && <div className="invalid-feedback">{errors.message.message}</div>}
              </div>
              <div className="row g-3">
                <div className="col-7">
                  <label className="form-label fw-semibold small">Data *</label>
                  <input
                    {...register('scheduled_date')}
                    type="date"
                    className={`form-control ${errors.scheduled_date ? 'is-invalid' : ''}`}
                  />
                </div>
                <div className="col-5">
                  <label className="form-label fw-semibold small">Hora *</label>
                  <input
                    {...register('scheduled_time')}
                    type="time"
                    className={`form-control ${errors.scheduled_time ? 'is-invalid' : ''}`}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Criar lembrete
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function NotificationCard({
  notif,
  onRead,
  onDelete,
}: {
  notif: Notification
  onRead: () => void
  onDelete: () => void
}) {
  const typeColor = NOTIFICATION_TYPE_COLORS[notif.type] ?? '#7c3aed'
  const typeLabel = NOTIFICATION_TYPE_LABELS[notif.type] ?? notif.type
  const past = isPast(parseISO(notif.scheduled_for))

  return (
    <div
      className="card border-0 shadow-sm p-3 d-flex flex-row gap-3"
      style={{ background: notif.is_read ? '#fff' : '#faf5ff', borderLeft: `3px solid ${notif.is_read ? '#e2e8f0' : typeColor}` }}
    >
      <div
        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
        style={{ width: 40, height: 40, background: notif.is_read ? '#f1f5f9' : `${typeColor}20` }}
      >
        <Bell size={16} style={{ color: notif.is_read ? '#94a3b8' : typeColor }} />
      </div>

      <div className="flex-grow-1 overflow-hidden">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
          <span
            className="fw-semibold"
            style={{ fontSize: '0.875rem', color: notif.is_read ? '#64748b' : '#1e293b' }}
          >
            {notif.title}
          </span>
          <div className="d-flex gap-1 flex-shrink-0">
            {!notif.is_read && (
              <button className="btn btn-sm p-1 text-muted" onClick={onRead} title="Marcar como lida">
                <Check size={13} />
              </button>
            )}
            <button className="btn btn-sm p-1 text-danger opacity-50" onClick={onDelete} title="Remover">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <p className="text-muted small mb-1" style={{ lineHeight: 1.4 }}>{notif.message}</p>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span
            className="badge"
            style={{ background: `${typeColor}20`, color: typeColor, fontSize: '0.62rem' }}
          >
            {typeLabel}
          </span>
          <span
            className="small"
            style={{ fontSize: '0.72rem', color: past && !notif.is_read ? '#ef4444' : '#94a3b8' }}
          >
            {past && !notif.is_read ? '⚠️ ' : ''}{formatScheduled(notif.scheduled_for)}
          </span>
          {notif.is_read && (
            <span className="small text-muted" style={{ fontSize: '0.7rem' }}>✓ lida</span>
          )}
        </div>
      </div>
    </div>
  )
}

type Filter = 'all' | 'unread' | 'read'

export function NotificationsPage() {
  const { data: notifications, isLoading, create, read, readAll, remove } = useNotifications()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  const unreadCount = notifications.filter(n => !n.is_read).length

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  async function handleCreate(title: string, message: string, scheduledFor: string) {
    await create.mutateAsync({ title, message, scheduled_for: scheduledFor })
    setShowCreate(false)
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
          <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Bell size={20} style={{ color: '#7c3aed' }} />
            Notificações
            {unreadCount > 0 && (
              <span
                className="badge rounded-pill"
                style={{ background: '#7c3aed', fontSize: '0.7rem' }}
              >
                {unreadCount}
              </span>
            )}
          </h4>
          <p className="text-muted small mb-0">{notifications.length} total · {unreadCount} não lida(s)</p>
        </div>
        <div className="d-flex gap-2">
          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-light d-flex align-items-center gap-1"
              onClick={() => readAll.mutate()}
              disabled={readAll.isPending}
              style={{ fontSize: '0.78rem' }}
            >
              <CheckCheck size={14} />
              Marcar todas
            </button>
          )}
          <button
            className="btn btn-primary btn-sm d-flex align-items-center gap-1"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={16} />
            Novo lembrete
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <ul className="nav nav-pills mb-4 gap-1">
        {([['all', 'Todas'], ['unread', 'Não lidas'], ['read', 'Lidas']] as const).map(([val, label]) => (
          <li key={val} className="nav-item">
            <button
              className={`nav-link btn btn-sm ${filter === val ? 'active' : 'text-secondary'}`}
              onClick={() => setFilter(val)}
              style={{ fontSize: '0.8rem' }}
            >
              {label}
              {val === 'unread' && unreadCount > 0 && (
                <span className="badge bg-danger ms-1" style={{ fontSize: '0.6rem' }}>{unreadCount}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Bell size={36} className="mx-auto mb-3 opacity-40" />
          <p className="fw-semibold mb-1">
            {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
          </p>
          <p className="small mb-3">
            Crie lembretes para consultas, exames, vacinas e outros eventos importantes.
          </p>
          <button
            className="btn btn-primary btn-sm mx-auto"
            style={{ width: 'fit-content' }}
            onClick={() => setShowCreate(true)}
          >
            <Plus size={14} className="me-1" />
            Primeiro lembrete
          </button>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {filtered.map(notif => (
          <NotificationCard
            key={notif.id}
            notif={notif}
            onRead={() => read.mutate(notif.id)}
            onDelete={() => remove.mutate(notif.id)}
          />
        ))}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          loading={create.isPending}
        />
      )}
    </div>
  )
}
