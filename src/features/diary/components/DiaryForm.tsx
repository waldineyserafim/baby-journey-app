import { useEffect } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { MOOD_OPTIONS } from '../services/diaryService'
import type { DiaryEntry } from '../services/diaryService'

const schema = z.object({
  entry_date: z.string().min(1, 'Data obrigatória'),
  content: z.string().min(1, 'Escreva algo no diário'),
  mood: z.string().optional(),
  energy_level: z.union([z.literal(''), z.coerce.number().int().min(1).max(5)]).optional(),
  week_number: z.union([z.literal(''), z.coerce.number().int().min(1).max(42)]).optional(),
})

export type DiaryFormValues = z.infer<typeof schema>

interface Props {
  initial?: DiaryEntry | null
  currentWeek?: number
  onSubmit: (v: DiaryFormValues) => Promise<void>
  onClose: () => void
  loading: boolean
}

export function DiaryForm({ initial, currentWeek, onSubmit, onClose, loading }: Props) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<DiaryFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<DiaryFormValues>,
    defaultValues: {
      entry_date: format(new Date(), 'yyyy-MM-dd'),
      content: '',
      mood: '',
      energy_level: '',
      week_number: currentWeek ?? '',
    },
  })

  const selectedMood = watch('mood')
  const selectedEnergy = watch('energy_level')

  useEffect(() => {
    if (initial) {
      reset({
        entry_date: initial.entry_date,
        content: initial.content,
        mood: initial.mood ?? '',
        energy_level: initial.energy_level ?? '',
        week_number: initial.week_number ?? '',
      })
    }
  }, [initial, reset])

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{initial ? 'Editar entrada' : 'Nova entrada no diário'}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold small">Data *</label>
                  <input
                    {...register('entry_date')}
                    type="date"
                    className={`form-control ${errors.entry_date ? 'is-invalid' : ''}`}
                  />
                  {errors.entry_date && <div className="invalid-feedback">{errors.entry_date.message}</div>}
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold small">Semana gestacional</label>
                  <input
                    {...register('week_number')}
                    type="number"
                    min={1}
                    max={42}
                    className="form-control"
                    placeholder="Ex: 24"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small d-block mb-2">Como você está se sentindo?</label>
                <div className="d-flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map(m => (
                    <button
                      key={m.value}
                      type="button"
                      className="btn btn-sm d-flex align-items-center gap-1"
                      style={{
                        background: selectedMood === m.value ? '#ede9fe' : '#f8fafc',
                        color: selectedMood === m.value ? '#7c3aed' : '#64748b',
                        border: `1px solid ${selectedMood === m.value ? '#7c3aed' : '#e2e8f0'}`,
                        borderRadius: 20,
                      }}
                      onClick={() => setValue('mood', selectedMood === m.value ? '' : m.value)}
                    >
                      <span>{m.emoji}</span>
                      <span style={{ fontSize: '0.78rem' }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small d-block mb-2">Nível de energia</label>
                <div className="d-flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      className="btn btn-sm"
                      style={{
                        width: 40, height: 40,
                        borderRadius: '50%',
                        background: Number(selectedEnergy) >= n ? '#7c3aed' : '#f1f5f9',
                        color: Number(selectedEnergy) >= n ? '#fff' : '#94a3b8',
                        border: `2px solid ${Number(selectedEnergy) >= n ? '#7c3aed' : '#e2e8f0'}`,
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                      }}
                      onClick={() => setValue('energy_level', Number(selectedEnergy) === n ? '' : n)}
                    >
                      {n}
                    </button>
                  ))}
                  <span className="text-muted small align-self-center ms-1">
                    {selectedEnergy ? `${selectedEnergy}/5` : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="form-label fw-semibold small">Registro do dia *</label>
                <textarea
                  {...register('content')}
                  className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                  rows={6}
                  placeholder="Como foi o seu dia? O que você sentiu? Quais foram seus pensamentos sobre a gestação..."
                />
                {errors.content && <div className="invalid-feedback">{errors.content.message}</div>}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                {initial ? 'Salvar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
