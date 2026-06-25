import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/infrastructure/supabase/client'
import { ROUTES } from '@/shared/constants/routes'
import { Baby, Eye, EyeOff, Lock } from 'lucide-react'

const schema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: 'As senhas não coincidem',
  path: ['confirm'],
})
type FormData = z.infer<typeof schema>

type PageState = 'loading' | 'ready' | 'success' | 'invalid'

export function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>('loading')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when user arrives via the reset link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready')
      }
    })

    // Also check if there's already a session (token parsed from URL hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPageState('ready')
      else setTimeout(() => setPageState(prev => prev === 'loading' ? 'invalid' : prev), 3000)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function onSubmit(data: FormData) {
    setSubmitError(null)
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      setSubmitError('Não foi possível redefinir a senha. O link pode ter expirado.')
      return
    }
    setPageState('success')
  }

  const bg = { background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #dbeafe 100%)' }

  if (pageState === 'loading') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={bg}>
        <div className="spinner-border" style={{ color: '#7c3aed' }} role="status">
          <span className="visually-hidden">Verificando link...</span>
        </div>
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={bg}>
        <div className="w-100 px-3" style={{ maxWidth: 400 }}>
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 text-center">
              <div className="mb-3" style={{ fontSize: '2.5rem' }}>⚠️</div>
              <h5 className="fw-bold mb-2">Link inválido ou expirado</h5>
              <p className="text-muted small mb-4">
                Este link de recuperação não é mais válido. Solicite um novo link na tela de login.
              </p>
              <button
                className="btn w-100 text-white fw-semibold"
                style={{ background: '#0D9488', borderRadius: 14 }}
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Ir para o login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={bg}>
        <div className="w-100 px-3" style={{ maxWidth: 400 }}>
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 text-center">
              <div className="mb-3" style={{ fontSize: '2.5rem' }}>✅</div>
              <h5 className="fw-bold mb-2">Senha redefinida!</h5>
              <p className="text-muted small mb-4">
                Sua nova senha foi salva com sucesso. Você já pode entrar no app.
              </p>
              <button
                className="btn w-100 text-white fw-semibold"
                style={{ background: '#0D9488', borderRadius: 14 }}
                onClick={() => navigate(ROUTES.DASHBOARD)}
              >
                Ir para o app
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={bg}>
      <div className="w-100 px-3" style={{ maxWidth: 440 }}>

        <div className="text-center mb-4">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #f9a8d4, #c084fc)' }}>
            <Baby size={32} className="text-white" />
          </div>
          <h1 className="fw-bold mb-1" style={{ color: '#7c3aed' }}>Baby's Plan</h1>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-1 text-center">Nova senha</h5>
            <p className="text-muted text-center small mb-4">Escolha uma senha segura para sua conta</p>

            {submitError && <div className="alert alert-danger py-2 small">{submitError}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nova senha</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Mínimo 6 caracteres"
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

              <div className="mb-4">
                <label className="form-label small fw-semibold">Confirmar senha</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <input
                    {...register('confirm')}
                    type={showConfirm ? 'text' : 'password'}
                    className={`form-control border-start-0 border-end-0 ${errors.confirm ? 'is-invalid' : ''}`}
                    placeholder="Repita a senha"
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                  </button>
                </div>
                {errors.confirm && <div className="text-danger small mt-1">{errors.confirm.message}</div>}
              </div>

              <button
                type="submit"
                className="btn w-100 text-white fw-semibold"
                style={{ background: '#0D9488', borderRadius: 14 }}
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                Salvar nova senha
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
