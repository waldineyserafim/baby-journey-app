import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { MILESTONE_TYPES } from '../services/timelineService'
import type { TimelineMilestone } from '../services/timelineService'

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  milestone_type: z.string().min(1, 'Tipo obrigatório'),
  milestone_date: z.string().min(1, 'Data obrigatória'),
  week_number: z.union([z.literal(''), z.coerce.number().int().min(1).max(42)]).optional(),
  description: z.string().optional(),
  is_public: z.boolean().optional(),
})

export type TimelineFormValues = z.infer<typeof schema>

interface Props {
  initial?: TimelineMilestone | null
  onSubmit: (values: TimelineFormValues) => Promise<void>
  onClose: () => void
  loading: boolean
}

export function TimelineForm({ initial, onSubmit, onClose, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TimelineFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      milestone_type: '',
      milestone_date: format(new Date(), 'yyyy-MM-dd'),
      week_number: '',
      description: '',
      is_public: false,
    },
  })

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title,
        milestone_type: initial.milestone_type,
        milestone_date: initial.milestone_date,
        week_number: initial.week_number ?? '',
        description: initial.description ?? '',
        is_public: initial.is_public ?? false,
      })
    }
  }, [initial, reset])

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {initial ? 'Editar Marco' : 'Novo Marco na Timeline'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Título *</label>
                <input
                  {...register('title')}
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="Ex: Primeiro ultrassom com a bebê"
                />
                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Tipo *</label>
                <select
                  {...register('milestone_type')}
                  className={`form-select ${errors.milestone_type ? 'is-invalid' : ''}`}
                >
                  <option value="">Selecione o tipo...</option>
                  {MILESTONE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.milestone_type && (
                  <div className="invalid-feedback">{errors.milestone_type.message}</div>
                )}
              </div>

              <div className="row g-3 mb-3">
                <div className="col-7">
                  <label className="form-label fw-semibold">Data *</label>
                  <input
                    {...register('milestone_date')}
                    type="date"
                    className={`form-control ${errors.milestone_date ? 'is-invalid' : ''}`}
                  />
                  {errors.milestone_date && (
                    <div className="invalid-feedback">{errors.milestone_date.message}</div>
                  )}
                </div>
                <div className="col-5">
                  <label className="form-label fw-semibold">Semana gestacional</label>
                  <input
                    {...register('week_number')}
                    type="number"
                    min={1}
                    max={42}
                    className="form-control"
                    placeholder="Ex: 20"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Descrição</label>
                <textarea
                  {...register('description')}
                  className="form-control"
                  rows={3}
                  placeholder="Conte mais sobre este momento especial..."
                />
              </div>

              <div className="form-check">
                <input
                  {...register('is_public')}
                  type="checkbox"
                  className="form-check-input"
                  id="is_public"
                />
                <label className="form-check-label" htmlFor="is_public">
                  Marco público (visível para compartilhamento)
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                {initial ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
