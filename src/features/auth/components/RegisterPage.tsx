import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/shared/constants/routes'
import { supabase } from '@/infrastructure/supabase/client'

const schema = z.object({
  fullName: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  familyName: z.string().min(2, 'Informe o nome da família'),
})
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const { data: authData, error: signUpError } = await signUp(data.email, data.password, data.fullName)
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    if (!authData.user) {
      setError('Erro ao criar conta. Tente novamente.')
      return
    }

    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({ name: data.familyName })
      .select()
      .single()

    if (tenantError) {
      setError('Erro ao criar família.')
      return
    }

    await supabase.from('profiles').upsert({
      id: authData.user.id,
      tenant_id: tenant.id,
      full_name: data.fullName,
      role: 'partner',
    })

    navigate(ROUTES.ONBOARDING)
  }

  return (
    <>
      <h2 className="fw-bold mb-1 text-center" style={{ fontSize: '1.25rem' }}>Criar Conta</h2>
      <p className="text-muted text-center small mb-4">Comece sua jornada</p>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Seu nome completo</label>
          <input
            {...register('fullName')}
            className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
            placeholder="Ana Silva"
          />
          {errors.fullName && <div className="invalid-feedback">{errors.fullName.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Nome da família</label>
          <input
            {...register('familyName')}
            className={`form-control ${errors.familyName ? 'is-invalid' : ''}`}
            placeholder="Família Silva"
          />
          {errors.familyName && <div className="invalid-feedback">{errors.familyName.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Email</label>
          <input
            {...register('email')}
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="seu@email.com"
          />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>

        <div className="mb-4">
          <label className="form-label small fw-semibold">Senha</label>
          <input
            {...register('password')}
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            placeholder="Mínimo 6 caracteres"
          />
          {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
        </div>

        <button
          type="submit"
          className="btn w-100 text-white fw-semibold mb-3"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
          disabled={isSubmitting}
        >
          {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
          Criar Conta
        </button>
      </form>

      <div className="text-center small">
        <span className="text-muted">Já tem conta? </span>
        <Link to={ROUTES.LOGIN} style={{ color: '#7c3aed' }}>Entrar</Link>
      </div>
    </>
  )
}
