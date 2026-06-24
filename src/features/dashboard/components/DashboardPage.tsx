import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useGestationalAge } from '@/shared/hooks/useGestationalAge'
import { PregnancyProgress } from '@/shared/components/ProgressBar/PregnancyProgress'
import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/database.types'
import { ROUTES } from '@/shared/constants/routes'
import { formatBRL } from '@/shared/utils/currencyUtils'
import {
  Calendar, FlaskConical, Syringe, ShoppingCart,
  Camera, BookOpen, Baby, Activity
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Appointment = Database['public']['Tables']['appointments']['Row']
type Photo = Database['public']['Tables']['photos']['Row']
type DiaryEntry = Database['public']['Tables']['diary_entries']['Row']
type BabyContent = Pick<Database['public']['Tables']['baby_development_content']['Row'],
  'week' | 'fruit_name' | 'fruit_emoji' | 'size_cm' | 'weight_g' | 'development_summary'>
interface LayetteStats { total: number; done: number; percent: number; totalPaid: number; totalPlanned: number; criticalPending: number }

export function DashboardPage() {
  const { profile } = useAuth()
  const { data: pregnancy, isLoading } = useCurrentPregnancy()
  const { week, totalDays, daysRemaining, progressPercent, trimesterLabel } = useGestationalAge(
    pregnancy?.lmp_date ?? null,
    pregnancy?.due_date ?? null
  )

  const { data: nextAppointments } = useQuery<Appointment[]>({
    queryKey: ['next-appointments', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('pregnancy_id', pregnancy!.id)
        .eq('status', 'scheduled')
        .gte('appointment_at', new Date().toISOString())
        .order('appointment_at')
        .limit(3)
      return (data ?? []) as Appointment[]
    },
  })

  const { data: weekContent } = useQuery<BabyContent | null>({
    queryKey: ['baby-development', week],
    enabled: week > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from('baby_development_content')
        .select('week, fruit_name, fruit_emoji, size_cm, weight_g, development_summary')
        .eq('week', week)
        .maybeSingle()
      return data as BabyContent | null
    },
  })

  const { data: layetteStats } = useQuery<LayetteStats | null>({
    queryKey: ['layette-stats', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('layette_user_items')
        .select('status, paid_value, planned_value, catalog_id')
        .eq('pregnancy_id', pregnancy!.id)
      if (!data) return null
      const total = data.length
      const done = data.filter(i => i.status === 'comprado' || i.status === 'ganho').length
      const totalPaid = data.reduce((s, i) => s + (i.paid_value ?? 0), 0)
      const totalPlanned = data.reduce((s, i) => s + (i.planned_value ?? 0), 0)
      const criticalPending = data.filter(i => i.status === 'nao_comprado').length
      return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0, totalPaid, totalPlanned, criticalPending }
    },
  })

  const { data: lastPhoto } = useQuery<Pick<Photo, 'storage_path' | 'photo_date' | 'week_number'> | null>({
    queryKey: ['last-photo', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('photos')
        .select('storage_path, photo_date, week_number')
        .eq('pregnancy_id', pregnancy!.id)
        .eq('category', 'belly')
        .order('photo_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      return data as Pick<Photo, 'storage_path' | 'photo_date' | 'week_number'> | null
    },
  })

  const { data: lastDiary } = useQuery<Pick<DiaryEntry, 'content' | 'entry_date' | 'mood'> | null>({
    queryKey: ['last-diary', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('diary_entries')
        .select('content, entry_date, mood')
        .eq('pregnancy_id', pregnancy!.id)
        .order('entry_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      return data as Pick<DiaryEntry, 'content' | 'entry_date' | 'mood'> | null
    },
  })

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="spinner-border" style={{ color: '#7c3aed' }} />
      </div>
    )
  }

  if (!pregnancy) {
    return (
      <div className="text-center py-5">
        <Baby size={48} className="text-muted mb-3" />
        <h4>Nenhuma gestação cadastrada</h4>
        <p className="text-muted">Configure sua gestação para começar.</p>
        <Link to={ROUTES.ONBOARDING} className="btn btn-primary">Configurar agora</Link>
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Mamãe'

  return (
    <div>
      {/* Saudação */}
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Olá, {firstName}! 💛</h4>
        <p className="text-muted small mb-0">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="mb-4">
        <PregnancyProgress
          week={week}
          totalDays={totalDays}
          daysRemaining={daysRemaining}
          progressPercent={progressPercent}
          trimesterLabel={trimesterLabel}
          lmpDate={pregnancy.lmp_date}
          dueDate={pregnancy.due_date}
        />
      </div>

      {/* Grid de cards */}
      <div className="row g-3 mb-4">
        {/* Semana do bebê */}
        <div className="col-6 col-md-3">
          <Link to={`/baby-development/${week}`} className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100 text-center p-3">
              <div className="fs-2 mb-1">{weekContent?.fruit_emoji ?? '🍼'}</div>
              <div className="fw-bold small">{weekContent?.fruit_name ?? `Semana ${week}`}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                {weekContent?.size_cm}cm · {weekContent?.weight_g ? `${(weekContent.weight_g / 1000).toFixed(2)}kg` : '–'}
              </div>
            </div>
          </Link>
        </div>

        {/* Próximas consultas */}
        <div className="col-6 col-md-3">
          <Link to={ROUTES.APPOINTMENTS} className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100 p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Calendar size={16} style={{ color: '#7c3aed' }} />
                <span className="fw-semibold small">Próximas</span>
              </div>
              {nextAppointments?.slice(0, 2).map(a => (
                <div key={a.id} className="small text-muted mb-1">
                  • {format(new Date(a.appointment_at), 'dd/MM')} {a.title}
                </div>
              ))}
              {(!nextAppointments || nextAppointments.length === 0) && (
                <div className="small text-muted">Nenhuma agendada</div>
              )}
            </div>
          </Link>
        </div>

        {/* Enxoval */}
        <div className="col-6 col-md-3">
          <Link to={ROUTES.LAYETTE} className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100 p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <ShoppingCart size={16} style={{ color: '#db2777' }} />
                <span className="fw-semibold small">Enxoval</span>
              </div>
              {layetteStats ? (
                <>
                  <div className="progress mb-1" style={{ height: 6 }}>
                    <div className="progress-bar bg-success" style={{ width: `${layetteStats.percent}%` }} />
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {layetteStats.percent}% · {formatBRL(layetteStats.totalPaid)}
                  </div>
                  {layetteStats.criticalPending > 0 && (
                    <div className="badge bg-warning text-dark mt-1" style={{ fontSize: '0.65rem' }}>
                      ⚠️ {layetteStats.criticalPending} pendentes
                    </div>
                  )}
                </>
              ) : (
                <div className="small text-muted">Configure o enxoval</div>
              )}
            </div>
          </Link>
        </div>

        {/* Atividade rápida */}
        <div className="col-6 col-md-3">
          <Link to={ROUTES.KICKS} className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100 p-3 text-center">
              <div className="fs-3 mb-1">👣</div>
              <div className="fw-semibold small">Chutes</div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>Registrar hoje</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Segunda linha de cards */}
      <div className="row g-3">
        {/* Última foto */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Camera size={16} style={{ color: '#7c3aed' }} />
              <span className="fw-semibold small">Última foto da barriga</span>
              <Link to={ROUTES.PHOTOS} className="ms-auto small" style={{ color: '#7c3aed' }}>Ver álbum</Link>
            </div>
            {lastPhoto ? (
              <div className="text-muted small">
                Semana {lastPhoto.week_number} · {format(new Date(lastPhoto.photo_date), 'dd/MM/yyyy')}
              </div>
            ) : (
              <div className="text-muted small">Nenhuma foto ainda — <Link to={ROUTES.PHOTOS}>adicionar</Link></div>
            )}
          </div>
        </div>

        {/* Último diário */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm p-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <BookOpen size={16} style={{ color: '#7c3aed' }} />
              <span className="fw-semibold small">Diário</span>
              <Link to={ROUTES.DIARY} className="ms-auto small" style={{ color: '#7c3aed' }}>Escrever</Link>
            </div>
            {lastDiary ? (
              <p className="text-muted small mb-0 text-truncate">&ldquo;{lastDiary.content}&rdquo;</p>
            ) : (
              <div className="text-muted small">Comece a escrever sua história</div>
            )}
          </div>
        </div>
      </div>

      {/* Links rápidos */}
      <div className="row g-2 mt-2">
        {[
          { to: ROUTES.EXAMS, icon: FlaskConical, label: 'Exames', color: '#0ea5e9' },
          { to: ROUTES.VACCINES, icon: Syringe, label: 'Vacinas', color: '#22c55e' },
          { to: ROUTES.TIMELINE, icon: Activity, label: 'Timeline', color: '#f59e0b' },
          { to: ROUTES.LAYETTE_INTELLIGENCE, icon: ShoppingCart, label: 'Brasil x EUA', color: '#ef4444' },
        ].map(({ to, icon: Icon, label, color }) => (
          <div key={to} className="col-6 col-md-3">
            <Link to={to} className="text-decoration-none">
              <div className="card border-0 shadow-sm p-2 d-flex flex-row align-items-center gap-2">
                <Icon size={18} style={{ color }} />
                <span className="small fw-semibold text-dark">{label}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
