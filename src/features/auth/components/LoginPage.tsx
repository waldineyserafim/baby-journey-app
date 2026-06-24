import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/shared/constants/routes'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    const { error } = await signInWithEmail(data.email, data.password)
    if (error) {
      setError('Email ou senha incorretos. Tente novamente.')
      return
    }
    navigate(ROUTES.DASHBOARD)
  }

  async function handleGoogle() {
    await signInWithGoogle()
  }

  return (
    <>
      <h2 className="fw-bold mb-1 text-center" style={{ fontSize: '1.25rem' }}>Entrar</h2>
      <p className="text-muted text-center small mb-4">Acesse sua conta Baby Journey</p>

      {error && (
        <div className="alert alert-danger py-2 small">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label small fw-semibold">Email</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Mail size={16} className="text-muted" />
            </span>
            <input
              {...register('email')}
              type="email"
              className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
              placeholder="seu@email.com"
            />
          </div>
          {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
        </div>

        <div className="mb-4">
          <label className="form-label small fw-semibold">Senha</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Lock size={16} className="text-muted" />
            </span>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="input-group-text bg-light"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
            </button>
          </div>
          {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
        </div>

        <button
          type="submit"
          className="btn w-100 text-white fw-semibold mb-3"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="spinner-border spinner-border-sm me-2" />
          ) : null}
          Entrar
        </button>
      </form>

      <div className="text-center mb-3">
        <span className="text-muted small">ou</span>
      </div>

      <button
        type="button"
        className="btn btn-outline-secondary w-100 mb-4"
        onClick={handleGoogle}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          width={18}
          className="me-2"
        />
        Continuar com Google
      </button>

      <div className="text-center small">
        <span className="text-muted">Não tem conta? </span>
        <Link to={ROUTES.REGISTER} style={{ color: '#7c3aed' }}>Criar conta</Link>
      </div>
    </>
  )
}
