import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { supabase } from '@/infrastructure/supabase/client'
import { ROUTES } from '@/shared/constants/routes'
import { addDays, format } from 'date-fns'
import { Baby } from 'lucide-react'

const schema = z.object({
  babyName: z.string().min(1, 'Informe um nome carinhoso para o bebê'),
  babySex: z.enum(['male', 'female', 'unknown']),
  lmpDate: z.string().min(1, 'Informe a data da última menstruação'),
})
type FormData = z.infer<typeof schema>

export function OnboardingPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { babySex: 'unknown' },
  })

  const lmpDate = watch('lmpDate')
  const dueDate = lmpDate ? format(addDays(new Date(lmpDate), 280), 'dd/MM/yyyy') : null

  async function onSubmit(data: FormData) {
    setError(null)
    if (!profile?.tenant_id) { setError('Perfil não encontrado.'); return }

    const due = addDays(new Date(data.lmpDate), 280)
    const { error } = await supabase.from('pregnancies').insert({
      tenant_id: profile.tenant_id,
      baby_name: data.babyName,
      baby_sex: data.babySex,
      lmp_date: data.lmpDate,
      due_date: format(due, 'yyyy-MM-dd'),
      status: 'active',
    })
    if (error) { setError('Erro ao salvar gestação.'); return }
    navigate(ROUTES.DASHBOARD)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{ background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' }}>
      <div className="w-100 px-3" style={{ maxWidth: 480 }}>
        <div className="text-center mb-4">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #f9a8d4, #c084fc)' }}>
            <Baby size={32} className="text-white" />
          </div>
          <h2 className="fw-bold" style={{ color: '#7c3aed' }}>Configure sua gestação</h2>
          <p className="text-muted">Vamos personalizar sua jornada</p>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nome carinhoso do bebê</label>
                <input
                  {...register('babyName')}
                  className={`form-control ${errors.babyName ? 'is-invalid' : ''}`}
                  placeholder="Ex: Bebê, Aurora, Miguelzinho..."
                />
                {errors.babyName && <div className="invalid-feedback">{errors.babyName.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Sexo do bebê</label>
                <div className="d-flex gap-2">
                  {[
                    { value: 'unknown', label: '🔮 Surpresa' },
                    { value: 'male', label: '👦 Menino' },
                    { value: 'female', label: '👧 Menina' },
                  ].map(opt => (
                    <div key={opt.value} className="form-check flex-fill text-center border rounded p-2">
                      <input {...register('babySex')} type="radio" value={opt.value}
                        className="form-check-input" id={`sex-${opt.value}`} />
                      <label className="form-check-label small" htmlFor={`sex-${opt.value}`}>
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Data da última menstruação (DUM)
                </label>
                <input
                  {...register('lmpDate')}
                  type="date"
                  className={`form-control ${errors.lmpDate ? 'is-invalid' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.lmpDate && <div className="invalid-feedback">{errors.lmpDate.message}</div>}
                {dueDate && (
                  <div className="mt-2 p-2 rounded text-center small"
                    style={{ background: '#ede9fe', color: '#7c3aed' }}>
                    🍼 Data provável do parto: <strong>{dueDate}</strong>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn w-100 text-white fw-semibold"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                Começar minha jornada 🌟
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
