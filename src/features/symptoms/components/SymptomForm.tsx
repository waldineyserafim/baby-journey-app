import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import type { SymptomLog } from '../services/symptomService'

const coerceOptionalInt = z.union([z.literal(''), z.coerce.number().int().min(0)]).optional()
const coerceOptionalFloat = z.union([z.literal(''), z.coerce.number().min(0)]).optional()

const schema = z.object({
  log_date: z.string().min(1, 'Data obrigatória'),
  weight_kg: coerceOptionalFloat,
  nausea_level: coerceOptionalInt,
  vomiting: z.boolean().optional(),
  heartburn_level: coerceOptionalInt,
  swelling_level: coerceOptionalInt,
  blood_pressure_systolic: coerceOptionalInt,
  blood_pressure_diastolic: coerceOptionalInt,
  blood_glucose: coerceOptionalFloat,
  pain_description: z.string().optional(),
  notes: z.string().optional(),
})

export type SymptomFormValues = z.infer<typeof schema>

interface Props {
  initial?: SymptomLog | null
  onSubmit: (values: SymptomFormValues) => Promise<void>
  onClose: () => void
  loading: boolean
}

function emptyDefaults(): SymptomFormValues {
  return {
    log_date: format(new Date(), 'yyyy-MM-dd'),
    weight_kg: '',
    nausea_level: '',
    vomiting: false,
    heartburn_level: '',
    swelling_level: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    blood_glucose: '',
    pain_description: '',
    notes: '',
  }
}

function LevelInput({ label, name, register }: { label: string; name: string; register: ReturnType<typeof useForm<SymptomFormValues>>['register'] }) {
  return (
    <div>
      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>{label}</label>
      <input
        {...register(name as keyof SymptomFormValues)}
        type="number"
        min={0}
        max={10}
        step={1}
        className="form-control"
        placeholder="0–10"
      />
    </div>
  )
}

export function SymptomForm({ initial, onSubmit, onClose, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SymptomFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults(),
  })

  useEffect(() => {
    if (initial) {
      reset({
        log_date: initial.log_date,
        weight_kg: initial.weight_kg ?? '',
        nausea_level: initial.nausea_level ?? '',
        vomiting: initial.vomiting ?? false,
        heartburn_level: initial.heartburn_level ?? '',
        swelling_level: initial.swelling_level ?? '',
        blood_pressure_systolic: initial.blood_pressure_systolic ?? '',
        blood_pressure_diastolic: initial.blood_pressure_diastolic ?? '',
        blood_glucose: initial.blood_glucose ?? '',
        pain_description: initial.pain_description ?? '',
        notes: initial.notes ?? '',
      })
    } else {
      reset(emptyDefaults())
    }
  }, [initial, reset])

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{initial ? 'Editar Registro' : 'Registrar Sintomas'}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label fw-semibold">Data *</label>
                  <input
                    {...register('log_date')}
                    type="date"
                    className={`form-control ${errors.log_date ? 'is-invalid' : ''}`}
                  />
                  {errors.log_date && <div className="invalid-feedback">{errors.log_date.message}</div>}
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold">Peso (kg)</label>
                  <input
                    {...register('weight_kg')}
                    type="number"
                    step="0.1"
                    min={0}
                    className="form-control"
                    placeholder="Ex: 68.5"
                  />
                </div>
              </div>

              <p className="fw-semibold mb-3 text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sintomas (escala 0–10)
              </p>

              <div className="row g-3 mb-4">
                <div className="col-4">
                  <LevelInput label="Náusea" name="nausea_level" register={register} />
                </div>
                <div className="col-4">
                  <LevelInput label="Azia" name="heartburn_level" register={register} />
                </div>
                <div className="col-4">
                  <LevelInput label="Inchaço" name="swelling_level" register={register} />
                </div>
                <div className="col-4 d-flex align-items-end">
                  <div className="form-check">
                    <input {...register('vomiting')} type="checkbox" className="form-check-input" id="vomiting" />
                    <label className="form-check-label fw-semibold" htmlFor="vomiting" style={{ fontSize: '0.85rem' }}>
                      Vômito
                    </label>
                  </div>
                </div>
              </div>

              <p className="fw-semibold mb-3 text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Medições
              </p>

              <div className="row g-3 mb-4">
                <div className="col-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>PA Sistólica</label>
                  <input
                    {...register('blood_pressure_systolic')}
                    type="number"
                    className="form-control"
                    placeholder="Ex: 120"
                  />
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>PA Diastólica</label>
                  <input
                    {...register('blood_pressure_diastolic')}
                    type="number"
                    className="form-control"
                    placeholder="Ex: 80"
                  />
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Glicemia (mg/dL)</label>
                  <input
                    {...register('blood_glucose')}
                    type="number"
                    step="0.1"
                    className="form-control"
                    placeholder="Ex: 95"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Descrição de Dores</label>
                <input
                  {...register('pain_description')}
                  className="form-control"
                  placeholder="Ex: Dor lombar leve, câimbras nas pernas..."
                />
              </div>

              <div className="mb-1">
                <label className="form-label fw-semibold">Observações</label>
                <textarea
                  {...register('notes')}
                  className="form-control"
                  rows={2}
                  placeholder="Como você está se sentindo hoje?"
                />
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
