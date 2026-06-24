import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Stethoscope, Plus, Edit2, Trash2, TrendingUp, List } from 'lucide-react'
import { useSymptoms } from '../hooks/useSymptoms'
import { SymptomForm } from './SymptomForm'
import type { SymptomLog } from '../services/symptomService'
import type { SymptomFormValues } from './SymptomForm'

type View = 'list' | 'charts'

export function SymptomsPage() {
  const { data: logs = [], isLoading, create, update, remove } = useSymptoms()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<SymptomLog | null>(null)
  const [view, setView] = useState<View>('list')

  function openCreate() { setEditing(null); setModal('create') }
  function openEdit(log: SymptomLog) { setEditing(log); setModal('edit') }
  function closeModal() { setModal(null); setEditing(null) }

  function toNullable(v: unknown): number | null {
    if (v === '' || v === undefined || v === null) return null
    const n = Number(v)
    return isNaN(n) ? null : n
  }

  async function handleSubmit(values: SymptomFormValues) {
    const payload = {
      log_date: values.log_date,
      weight_kg: toNullable(values.weight_kg),
      nausea_level: toNullable(values.nausea_level),
      vomiting: values.vomiting ?? false,
      heartburn_level: toNullable(values.heartburn_level),
      swelling_level: toNullable(values.swelling_level),
      blood_pressure_systolic: toNullable(values.blood_pressure_systolic),
      blood_pressure_diastolic: toNullable(values.blood_pressure_diastolic),
      blood_glucose: toNullable(values.blood_glucose),
      pain_description: values.pain_description || null,
      notes: values.notes || null,
    }
    if (modal === 'edit' && editing) {
      await update.mutateAsync({ id: editing.id, fields: payload })
    } else {
      await create.mutateAsync(payload)
    }
    closeModal()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este registro?')) return
    await remove.mutateAsync(id)
  }

  const chartData = [...logs]
    .sort((a, b) => a.log_date.localeCompare(b.log_date))
    .map(l => ({
      date: format(parseISO(l.log_date), 'dd/MM', { locale: ptBR }),
      peso: l.weight_kg,
      nausea: l.nausea_level,
      azia: l.heartburn_level,
      inchaço: l.swelling_level,
      sistolica: l.blood_pressure_systolic,
      diastolica: l.blood_pressure_diastolic,
      glicemia: l.blood_glucose,
    }))

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
          <h4 className="fw-bold mb-0">Saúde & Sintomas</h4>
          <p className="text-muted small mb-0">{logs.length} registro(s)</p>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group btn-group-sm" role="group">
            <button
              className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setView('list')}
            >
              <List size={14} />
            </button>
            <button
              className={`btn ${view === 'charts' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setView('charts')}
              disabled={logs.length === 0}
            >
              <TrendingUp size={14} />
            </button>
          </div>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={openCreate}>
            <Plus size={16} />
            Registrar
          </button>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <Stethoscope size={40} className="mx-auto mb-3 opacity-50" />
          <p className="mb-1 fw-semibold">Nenhum registro de saúde</p>
          <p className="small mb-3">Registre seus sintomas diariamente para acompanhar sua evolução.</p>
          <button className="btn btn-primary btn-sm mx-auto" style={{ width: 'fit-content' }} onClick={openCreate}>
            <Plus size={14} className="me-1" />
            Primeiro registro
          </button>
        </div>
      )}

      {view === 'list' && logs.length > 0 && (
        <div className="d-flex flex-column gap-2">
          {logs.map(log => (
            <SymptomCard key={log.id} log={log} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {view === 'charts' && logs.length > 0 && (
        <div className="d-flex flex-column gap-4">
          {chartData.some(d => d.peso !== null) && (
            <div className="card border-0 shadow-sm p-3">
              <h6 className="fw-bold mb-3">Peso (kg)</h6>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="peso" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.some(d => d.sistolica !== null || d.diastolica !== null) && (
            <div className="card border-0 shadow-sm p-3">
              <h6 className="fw-bold mb-3">Pressão Arterial (mmHg)</h6>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sistolica" name="Sistólica" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="diastolica" name="Diastólica" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.some(d => d.nausea !== null || d.azia !== null || d.inchaço !== null) && (
            <div className="card border-0 shadow-sm p-3">
              <h6 className="fw-bold mb-3">Sintomas (escala 0–10)</h6>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="nausea" name="Náusea" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="azia" name="Azia" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="inchaço" name="Inchaço" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.some(d => d.glicemia !== null) && (
            <div className="card border-0 shadow-sm p-3">
              <h6 className="fw-bold mb-3">Glicemia (mg/dL)</h6>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="glicemia" name="Glicemia" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {modal && (
        <SymptomForm
          initial={editing}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={create.isPending || update.isPending}
        />
      )}
    </div>
  )
}

function SymptomCard({ log: l, onEdit, onDelete }: { log: SymptomLog; onEdit: (l: SymptomLog) => void; onDelete: (id: string) => void }) {
  const indicators = [
    l.weight_kg != null && { label: 'Peso', value: `${l.weight_kg} kg`, color: '#7c3aed' },
    l.nausea_level != null && { label: 'Náusea', value: `${l.nausea_level}/10`, color: '#0ea5e9' },
    l.heartburn_level != null && { label: 'Azia', value: `${l.heartburn_level}/10`, color: '#f59e0b' },
    l.swelling_level != null && { label: 'Inchaço', value: `${l.swelling_level}/10`, color: '#8b5cf6' },
    (l.blood_pressure_systolic != null && l.blood_pressure_diastolic != null) && {
      label: 'PA', value: `${l.blood_pressure_systolic}/${l.blood_pressure_diastolic}`, color: '#ef4444',
    },
    l.blood_glucose != null && { label: 'Glicemia', value: `${l.blood_glucose} mg/dL`, color: '#22c55e' },
    l.vomiting && { label: 'Vômito', value: 'Sim', color: '#dc2626' },
  ].filter(Boolean) as { label: string; value: string; color: string }[]

  return (
    <div className="card border-0 shadow-sm p-3">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center gap-2 mb-2">
            <Stethoscope size={15} style={{ color: '#7c3aed' }} />
            <span className="fw-semibold">
              {format(parseISO(l.log_date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          {indicators.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-1">
              {indicators.map(({ label, value, color }) => (
                <span
                  key={label}
                  className="badge rounded-pill"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}30`, fontSize: '0.7rem' }}
                >
                  {label}: {value}
                </span>
              ))}
            </div>
          )}
          {l.pain_description && (
            <p className="small text-muted mb-0">Dores: {l.pain_description}</p>
          )}
          {l.notes && (
            <p className="small text-muted mb-0">{l.notes}</p>
          )}
        </div>
        <div className="d-flex gap-1 flex-shrink-0">
          <button className="btn btn-sm btn-light p-1" onClick={() => onEdit(l)} title="Editar">
            <Edit2 size={13} />
          </button>
          <button className="btn btn-sm btn-light p-1 text-danger" onClick={() => onDelete(l.id)} title="Remover">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
