import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react'
import { useDiary } from '../hooks/useDiary'
import { DiaryForm } from './DiaryForm'
import { getMoodEmoji } from '../services/diaryService'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useGestationalAge } from '@/shared/hooks/useGestationalAge'
import type { DiaryEntry } from '../services/diaryService'
import type { DiaryFormValues } from './DiaryForm'

export function DiaryPage() {
  const { data: entries, isLoading, create, update, remove } = useDiary()
  const { data: pregnancy } = useCurrentPregnancy()
  const { week: currentWeek } = useGestationalAge(pregnancy?.lmp_date ?? null, pregnancy?.due_date ?? null)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<DiaryEntry | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  function openCreate() { setEditing(null); setModal('create') }
  function openEdit(e: DiaryEntry) { setEditing(e); setModal('edit') }
  function closeModal() { setModal(null); setEditing(null) }

  async function handleSubmit(values: DiaryFormValues) {
    const payload = {
      entry_date: values.entry_date,
      content: values.content,
      mood: values.mood || null,
      energy_level: values.energy_level === '' ? null : Number(values.energy_level),
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
    if (!confirm('Remover esta entrada do diário?')) return
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
          <h4 className="fw-bold mb-0">Diário da Mamãe</h4>
          <p className="text-muted small mb-0">{entries.length} entrada(s)</p>
        </div>
        <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={openCreate}>
          <Plus size={16} />
          Nova entrada
        </button>
      </div>

      {entries.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p className="fw-semibold mb-1">Nenhuma entrada ainda</p>
          <p className="small mb-3">
            Registre seus sentimentos, pensamentos e memórias desta jornada especial.
          </p>
          <button className="btn btn-primary btn-sm mx-auto" style={{ width: 'fit-content' }} onClick={openCreate}>
            <Plus size={14} className="me-1" />
            Primeira entrada
          </button>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {entries.map(entry => {
          const isExpanded = expanded === entry.id
          const preview = entry.content.length > 180 && !isExpanded
            ? entry.content.slice(0, 180) + '...'
            : entry.content

          return (
            <div key={entry.id} className="card border-0 shadow-sm p-4">
              <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #fce7f3, #ede9fe)', fontSize: '1.4rem' }}
                  >
                    {getMoodEmoji(entry.mood)}
                  </div>
                  <div>
                    <div className="fw-semibold">
                      {format(parseISO(entry.entry_date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      {entry.week_number && (
                        <span
                          className="badge"
                          style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '0.7rem' }}
                        >
                          Semana {entry.week_number}
                        </span>
                      )}
                      {entry.energy_level && (
                        <div className="d-flex gap-1">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div
                              key={n}
                              style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: n <= entry.energy_level! ? '#7c3aed' : '#e2e8f0',
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <button className="btn btn-sm btn-light p-1" onClick={() => openEdit(entry)} title="Editar">
                    <Edit2 size={13} />
                  </button>
                  <button className="btn btn-sm btn-light p-1 text-danger" onClick={() => handleDelete(entry.id)} title="Remover">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#374151' }}>
                {preview}
              </p>

              {entry.content.length > 180 && (
                <button
                  className="btn btn-link btn-sm p-0 mt-1 text-start"
                  style={{ color: '#7c3aed', fontSize: '0.8rem' }}
                  onClick={() => setExpanded(isExpanded ? null : entry.id)}
                >
                  {isExpanded ? 'Ver menos' : 'Ler mais'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {modal && (
        <DiaryForm
          initial={editing}
          currentWeek={currentWeek}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={create.isPending || update.isPending}
        />
      )}
    </div>
  )
}
