import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FlaskConical, Plus, Edit2, Trash2, Microscope, ScanLine, Stethoscope } from 'lucide-react'
import { useExams } from '../hooks/useExams'
import { ExamForm } from './ExamForm'
import type { Exam } from '../services/examService'

const TYPE_CONFIG: Record<string, { label: string; color: string; Icon: typeof FlaskConical }> = {
  laboratorial: { label: 'Laboratorial', color: '#0ea5e9', Icon: FlaskConical },
  ultrassom: { label: 'Ultrassom', color: '#8b5cf6', Icon: ScanLine },
  complementar: { label: 'Complementar', color: '#f59e0b', Icon: Stethoscope },
}

const TABS = ['todos', 'laboratorial', 'ultrassom', 'complementar'] as const
type Tab = typeof TABS[number]

export function ExamsPage() {
  const { data: exams = [], isLoading, create, update, remove } = useExams()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Exam | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('todos')

  const filtered = activeTab === 'todos' ? exams : exams.filter(e => e.exam_type === activeTab)

  function openCreate() { setEditing(null); setModal('create') }
  function openEdit(e: Exam) { setEditing(e); setModal('edit') }
  function closeModal() { setModal(null); setEditing(null) }

  async function handleSubmit(values: Parameters<typeof create.mutateAsync>[0]) {
    const payload = {
      ...values,
      week_number: values.week_number === '' ? null : Number(values.week_number),
    }
    if (modal === 'edit' && editing) {
      await update.mutateAsync({ id: editing.id, fields: payload })
    } else {
      await create.mutateAsync(payload)
    }
    closeModal()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este exame?')) return
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
          <h4 className="fw-bold mb-0">Exames</h4>
          <p className="text-muted small mb-0">{exams.length} exame(s) registrado(s)</p>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={openCreate}>
          <Plus size={16} />
          Novo Exame
        </button>
      </div>

      <ul className="nav nav-pills mb-4 gap-1">
        {TABS.map(tab => (
          <li key={tab} className="nav-item">
            <button
              className={`nav-link btn btn-sm ${activeTab === tab ? 'active' : 'text-secondary'}`}
              onClick={() => setActiveTab(tab)}
              style={{ fontSize: '0.8rem' }}
            >
              {tab === 'todos'
                ? `Todos (${exams.length})`
                : `${TYPE_CONFIG[tab]?.label} (${exams.filter(e => e.exam_type === tab).length})`}
            </button>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Microscope size={40} className="mx-auto mb-3 opacity-50" />
          <p className="mb-1 fw-semibold">Nenhum exame cadastrado</p>
          <p className="small mb-3">Registre seus exames laboratoriais, ultrassons e complementares.</p>
          <button className="btn btn-primary btn-sm mx-auto" style={{ width: 'fit-content' }} onClick={openCreate}>
            <Plus size={14} className="me-1" />
            Adicionar exame
          </button>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {filtered.map(exam => (
          <ExamCard key={exam.id} exam={exam} onEdit={openEdit} onDelete={handleDelete} />
        ))}
      </div>

      {modal && (
        <ExamForm
          initial={editing}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={create.isPending || update.isPending}
        />
      )}
    </div>
  )
}

function ExamCard({
  exam: e,
  onEdit,
  onDelete,
}: {
  exam: Exam
  onEdit: (e: Exam) => void
  onDelete: (id: string) => void
}) {
  const config = TYPE_CONFIG[e.exam_type] ?? TYPE_CONFIG.laboratorial
  const { Icon, color } = config

  return (
    <div className="card border-0 shadow-sm p-3">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div className="d-flex align-items-start gap-3 flex-grow-1 min-w-0">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
            style={{ width: 36, height: 36, background: `${color}15` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
          <div className="min-w-0">
            <div className="fw-semibold text-truncate">{e.exam_name}</div>
            <div className="small text-muted">
              {format(parseISO(e.exam_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              {e.week_number && <span> · Semana {e.week_number}</span>}
            </div>
            <div className="d-flex flex-wrap gap-2 mt-1">
              <span className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>
                {config.label}
              </span>
              {e.doctor_name && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{e.doctor_name}</span>
              )}
              {e.clinic_name && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>· {e.clinic_name}</span>
              )}
            </div>
            {e.result && (
              <p className="small text-muted mb-0 mt-1 text-truncate" style={{ maxWidth: 400 }}>
                Resultado: {e.result}
              </p>
            )}
          </div>
        </div>
        <div className="d-flex gap-1 flex-shrink-0">
          <button className="btn btn-sm btn-light p-1" onClick={() => onEdit(e)} title="Editar">
            <Edit2 size={13} />
          </button>
          <button className="btn btn-sm btn-light p-1 text-danger" onClick={() => onDelete(e.id)} title="Remover">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
