import { useEffect } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Appointment } from '../services/appointmentService'

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  appointment_type: z.string().min(1),
  appointment_at: z.string().min(1, 'Data e hora obrigatórias'),
  doctor_name: z.string().optional(),
  clinic_name: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default('scheduled'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Appointment | null
  onSubmit: (values: FormValues) => Promise<void>
  onClose: () => void
  loading: boolean
}

export function AppointmentForm({ initial, onSubmit, onClose, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      title: '',
      appointment_type: 'obstetrica',
      appointment_at: '',
      doctor_name: '',
      clinic_name: '',
      notes: '',
      status: 'scheduled',
    },
  })

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title,
        appointment_type: initial.appointment_type,
        appointment_at: initial.appointment_at.slice(0, 16),
        doctor_name: initial.doctor_name ?? '',
        clinic_name: initial.clinic_name ?? '',
        notes: initial.notes ?? '',
        status: initial.status ?? 'scheduled',
      })
    } else {
      reset({
        title: '',
        appointment_type: 'obstetrica',
        appointment_at: '',
        doctor_name: '',
        clinic_name: '',
        notes: '',
        status: 'scheduled',
      })
    }
  }, [initial, reset])

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {initial ? 'Editar Consulta' : 'Nova Consulta'}
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
                  placeholder="Ex: Pré-natal 1º trimestre"
                />
                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold">Tipo</label>
                  <select {...register('appointment_type')} className="form-select">
                    <option value="obstetrica">Obstétrica</option>
                    <option value="especialidade">Especialidade</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold">Status</label>
                  <select {...register('status')} className="form-select">
                    <option value="scheduled">Agendada</option>
                    <option value="completed">Realizada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Data e Hora *</label>
                <input
                  {...register('appointment_at')}
                  type="datetime-local"
                  className={`form-control ${errors.appointment_at ? 'is-invalid' : ''}`}
                />
                {errors.appointment_at && (
                  <div className="invalid-feedback">{errors.appointment_at.message}</div>
                )}
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold">Médico</label>
                  <input
                    {...register('doctor_name')}
                    className="form-control"
                    placeholder="Dr(a). Nome"
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label fw-semibold">Clínica / Hospital</label>
                  <input
                    {...register('clinic_name')}
                    className="form-control"
                    placeholder="Nome da clínica"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Observações</label>
                <textarea
                  {...register('notes')}
                  className="form-control"
                  rows={3}
                  placeholder="Anotações importantes..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : null}
                {initial ? 'Salvar' : 'Criar Consulta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
