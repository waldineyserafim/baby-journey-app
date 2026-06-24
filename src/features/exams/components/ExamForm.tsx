import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Exam } from '../services/examService'

const schema = z.object({
  exam_name: z.string().min(1, 'Nome do exame obrigatório'),
  exam_type: z.string().min(1),
  exam_date: z.string().min(1, 'Data obrigatória'),
  doctor_name: z.string().optional(),
  clinic_name: z.string().optional(),
  result: z.string().optional(),
  week_number: z.coerce.number().int().min(1).max(42).optional().or(z.literal('')),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Exam | null
  onSubmit: (values: FormValues) => Promise<void>
  onClose: () => void
  loading: boolean
}

export function ExamForm({ initial, onSubmit, onClose, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      exam_name: '',
      exam_type: 'laboratorial',
      exam_date: '',
      doctor_name: '',
      clinic_name: '',
      result: '',
      week_number: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (initial) {
      reset({
        exam_name: initial.exam_name,
        exam_type: initial.exam_type,
        exam_date: initial.exam_date,
        doctor_name: initial.doctor_name ?? '',
        clinic_name: initial.clinic_name ?? '',
        result: initial.result ?? '',
        week_number: initial.week_number ?? '',
        notes: initial.notes ?? '',
      })
    } else {
      reset({
        exam_name: '',
        exam_type: 'laboratorial',
        exam_date: '',
        doctor_name: '',
        clinic_name: '',
        result: '',
        week_number: '',
        notes: '',
      })
    }
  }, [initial, reset])

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">{initial ? 'Editar Exame' : 'Novo Exame'}</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="row g-3 mb-3">
                <div className="col-8">
                  <label className="form-label fw-semibold">Nome do Exame *</label>
                  <input
                    {...register('exam_name')}
                    className={`form-control ${errors.exam_name ? 'is-invalid' : ''}`}
                    placeholder="Ex: Hemograma completo"
                  />
                  {errors.exam_name && <div className="invalid-feedback">{errors.exam_name.message}</div>}
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold">Tipo</label>
                  <select {...register('exam_type')} className="form-select">
                    <option value="laboratorial">Laboratorial</option>
                    <option value="ultrassom">Ultrassom</option>
                    <option value="complementar">Complementar</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-4">
                  <label className="form-label fw-semibold">Data *</label>
                  <input
                    {...register('exam_date')}
                    type="date"
                    className={`form-control ${errors.exam_date ? 'is-invalid' : ''}`}
                  />
                  {errors.exam_date && <div className="invalid-feedback">{errors.exam_date.message}</div>}
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold">Semana Gestacional</label>
                  <input
                    {...register('week_number')}
                    type="number"
                    min={1}
                    max={42}
                    className="form-control"
                    placeholder="Ex: 20"
                  />
                </div>
                <div className="col-4">
                  <label className="form-label fw-semibold">Médico</label>
                  <input
                    {...register('doctor_name')}
                    className="form-control"
                    placeholder="Dr(a). Nome"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Clínica / Laboratório</label>
                <input
                  {...register('clinic_name')}
                  className="form-control"
                  placeholder="Nome do laboratório ou clínica"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Resultado</label>
                <textarea
                  {...register('result')}
                  className="form-control"
                  rows={3}
                  placeholder="Descreva o resultado ou cole o texto do laudo..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Observações</label>
                <textarea
                  {...register('notes')}
                  className="form-control"
                  rows={2}
                  placeholder="Anotações adicionais..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                {initial ? 'Salvar' : 'Cadastrar Exame'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
