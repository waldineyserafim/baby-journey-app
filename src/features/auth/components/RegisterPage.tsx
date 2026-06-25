import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/shared/constants/routes'

const schema = z.object({
  fullName: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

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

    if (!authData.session) {
      // Email confirmation required — user needs to verify before continuing
      setEmailSent(true)
      return
    }

    // Session active (email confirmation disabled) — go straight to onboarding
    // OnboardingPage handles family name + tenant + pregnancy creation
    navigate(ROUTES.ONBOARDING)
  }

  if (emailSent) {
    return (
      <>
        <div className="text-center mb-4">
          <div className="fs-1">📧</div>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>Verifique seu email</h2>
          <p className="text-muted small mb-0">Enviamos um link de confirmação para o seu email.</p>
        </div>
        <div className="alert alert-info py-2 small text-center">
          Após confirmar, volte aqui e faça login para continuar o cadastro.
        </div>
        <div className="text-center small mt-3">
          <Link to={ROUTES.LOGIN} style={{ color: '#7c3aed' }}>Ir para o login</Link>
        </div>
      </>
    )
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
