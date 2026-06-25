import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart3, Download, Printer, RefreshCw } from 'lucide-react'
import { useReports } from '../hooks/useReports'
import { useGestationalAge } from '@/shared/hooks/useGestationalAge'
import { generateCSV, downloadCSV } from '../services/reportsService'

function StatCard({
  emoji,
  label,
  value,
  sub,
  color = '#7c3aed',
}: {
  emoji: string
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div className="card border-0 shadow-sm p-3 text-center h-100">
      <div style={{ fontSize: '1.6rem' }}>{emoji}</div>
      <div className="fw-bold mt-1" style={{ fontSize: '1.4rem', color }}>{value}</div>
      <div className="fw-semibold small">{label}</div>
      {sub && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{sub}</div>}
    </div>
  )
}

function ProgressBar({ value, max, color = '#7c3aed' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="d-flex justify-content-between mb-1">
        <span className="small fw-semibold">{value}/{max}</span>
        <span className="small text-muted">{pct}%</span>
      </div>
      <div className="progress" style={{ height: 6, borderRadius: 3 }}>
        <div
          className="progress-bar"
          style={{ width: `${pct}%`, background: color, borderRadius: 3 }}
        />
      </div>
    </div>
  )
}

export function ReportsPage() {
  const { data: report, pregnancy, isLoading, refetch } = useReports()
  const age = useGestationalAge(pregnancy?.lmp_date ?? null, pregnancy?.due_date ?? null)

  function handleExportCSV() {
    if (!report || !pregnancy) return
    const csv = generateCSV(report, {
      due_date: pregnancy.due_date,
      lmp_date: pregnancy.lmp_date,
    })
    const filename = `baby-journey-${format(new Date(), 'yyyy-MM-dd')}.csv`
    downloadCSV(csv, filename)
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" style={{ color: '#7c3aed' }} />
      </div>
    )
  }

  if (!report || !pregnancy) {
    return (
      <div className="card border-0 shadow-sm p-5 text-center text-muted">
        <BarChart3 size={36} className="mx-auto mb-3 opacity-40" />
        <p className="fw-semibold mb-1">Dados insuficientes</p>
        <p className="small">Complete as informações da gestação para gerar o relatório.</p>
      </div>
    )
  }

  // Computed stats
  const appointmentsDone = report.appointments.filter(a => a.status === 'realizada').length
  const vaccinesDone = report.vaccines.filter(v => v.status === 'aplicada').length
  const examsWithResult = report.exams.filter(e => !!e.result).length
  const layettePurchased = report.layette.filter(l => ['comprado', 'ganho'].includes(l.status)).length
  const bagPacked = report.hospitalBag.filter(b => b.status === 'packed').length
  const totalKicks = report.kicks.reduce((sum, k) => sum + k.kick_count, 0)

  const trimesterColors = { 1: '#22c55e', 2: '#f59e0b', 3: '#ef4444' } as const
  const trimColor = trimesterColors[age.trimester] ?? '#7c3aed'

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <BarChart3 size={20} style={{ color: '#7c3aed' }} />
            Resumo da Gestação
          </h4>
          <p className="text-muted small mb-0">
            Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-light d-flex align-items-center gap-1"
            onClick={() => refetch()}
            style={{ fontSize: '0.78rem' }}
          >
            <RefreshCw size={13} />
            Atualizar
          </button>
          <button
            className="btn btn-sm btn-light d-flex align-items-center gap-1 d-print-none"
            onClick={() => window.print()}
            style={{ fontSize: '0.78rem' }}
          >
            <Printer size={13} />
            Imprimir
          </button>
          <button
            className="btn btn-sm btn-primary d-flex align-items-center gap-1 d-print-none"
            onClick={handleExportCSV}
            style={{ fontSize: '0.78rem' }}
          >
            <Download size={13} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Pregnancy progress card */}
      <div
        className="card border-0 shadow-sm p-4 mb-4"
        style={{ background: 'linear-gradient(135deg, #fdf4ff, #fce7f3)' }}
      >
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 64, height: 64, background: `${trimColor}20`, border: `2px solid ${trimColor}` }}
              >
                <span style={{ fontSize: '1.6rem', fontWeight: 700, color: trimColor }}>
                  {age.week}
                </span>
              </div>
              <div>
                <div className="fw-bold fs-5">Semana {age.week}</div>
                <div className="text-muted small">{age.trimesterLabel}</div>
                {pregnancy.due_date && (
                  <div className="small mt-1">
                    <span className="fw-semibold">{Math.max(0, age.daysRemaining)}</span>
                    <span className="text-muted"> dias até o parto</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-1 d-flex justify-content-between">
              <span className="small fw-semibold">Progresso da gestação</span>
              <span className="small fw-bold" style={{ color: '#7c3aed' }}>{age.progressPercent}%</span>
            </div>
            <div className="progress" style={{ height: 10, borderRadius: 5 }}>
              <div
                className="progress-bar"
                style={{
                  width: `${age.progressPercent}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #db2777)',
                  borderRadius: 5,
                }}
              />
            </div>
            {pregnancy.due_date && (
              <div className="text-muted mt-2" style={{ fontSize: '0.72rem' }}>
                DPP: {format(new Date(pregnancy.due_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main stats grid */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard emoji="📅" label="Consultas" value={report.appointments.length}
            sub={`${appointmentsDone} realizadas`} color="#0ea5e9" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard emoji="🔬" label="Exames" value={report.exams.length}
            sub={`${examsWithResult} com resultado`} color="#f59e0b" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard emoji="💉" label="Vacinas" value={`${vaccinesDone}/${report.vaccines.length}`}
            sub="aplicadas" color="#22c55e" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard emoji="😊" label="Diário" value={report.diary.length}
            sub="entradas" color="#db2777" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard emoji="👶" label="Chutes" value={totalKicks}
            sub={`${report.kicks.length} dias`} color="#8b5cf6" />
        </div>
        <div className="col-6 col-md-4 col-lg-2">
          <StatCard emoji="📸" label="Fotos" value={report.photos.length}
            sub="registradas" color="#7c3aed" />
        </div>
      </div>

      {/* Detailed cards row */}
      <div className="row g-3 mb-4">
        {/* Layette */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="fw-semibold mb-3">🛍️ Enxoval</div>
            <ProgressBar value={layettePurchased} max={report.layette.length} color="#7c3aed" />
            <div className="mt-3 d-flex flex-column gap-1">
              {(['nao_comprado', 'comprado', 'ganho', 'dispensado'] as const).map(status => {
                const count = report.layette.filter(l => l.status === status).length
                if (count === 0) return null
                const labels: Record<string, string> = {
                  nao_comprado: '⏳ Pendente', comprado: '✅ Comprado',
                  ganho: '🎁 Ganho', dispensado: '❌ Dispensado',
                }
                return (
                  <div key={status} className="d-flex justify-content-between small">
                    <span className="text-muted">{labels[status]}</span>
                    <span className="fw-semibold">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Hospital bag */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="fw-semibold mb-3">🧳 Mala da Maternidade</div>
            <ProgressBar value={bagPacked} max={report.hospitalBag.length} color="#0ea5e9" />
            <div className="mt-3 d-flex flex-column gap-1">
              {(['mae', 'bebe', 'pai', 'acompanhante'] as const).map(person => {
                const count = report.hospitalBag.filter(b => b.person === person).length
                const packed = report.hospitalBag.filter(b => b.person === person && b.status === 'packed').length
                if (count === 0) return null
                const labels: Record<string, string> = {
                  mae: '👩 Mamãe', bebe: '👶 Bebê', pai: '👨 Papai', acompanhante: '🤝 Acompanhante',
                }
                return (
                  <div key={person} className="d-flex justify-content-between small">
                    <span className="text-muted">{labels[person]}</span>
                    <span className="fw-semibold">{packed}/{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="fw-semibold mb-3">🩺 Sintomas Registrados</div>
            <div className="display-6 fw-bold mb-1" style={{ color: '#ef4444' }}>
              {report.symptoms.length}
            </div>
            <div className="text-muted small mb-3">registros no total</div>
            <div className="d-flex flex-column gap-1">
              {Object.entries(
                report.symptoms.reduce<Record<string, number>>((acc, s) => {
                  const key = s.pain_description ?? (s.nausea_level ? `Náusea nível ${s.nausea_level}` : 'Sintoma')
                  acc[key] = (acc[key] ?? 0) + 1
                  return acc
                }, {})
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, count]) => (
                  <div key={name} className="d-flex justify-content-between small">
                    <span className="text-muted text-truncate me-2">{name}</span>
                    <span className="fw-semibold flex-shrink-0">{count}×</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline milestones */}
      {report.timeline.length > 0 && (
        <div className="card border-0 shadow-sm p-4 mb-4">
          <div className="fw-semibold mb-3">⭐ Marcos da Gestação ({report.timeline.length})</div>
          <div className="d-flex flex-column gap-2">
            {report.timeline.slice(0, 6).map(m => (
              <div key={m.id} className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle flex-shrink-0"
                  style={{ width: 8, height: 8, background: '#7c3aed' }}
                />
                <span className="small fw-semibold flex-grow-1">{m.title}</span>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                  {format(new Date(m.milestone_date), 'dd/MM/yyyy')}
                </span>
              </div>
            ))}
            {report.timeline.length > 6 && (
              <div className="text-muted small">+{report.timeline.length - 6} mais marcos...</div>
            )}
          </div>
        </div>
      )}

      {/* Next appointments */}
      {report.appointments.filter(a => a.status === 'agendada').length > 0 && (
        <div className="card border-0 shadow-sm p-4">
          <div className="fw-semibold mb-3">📅 Próximas Consultas</div>
          <div className="d-flex flex-column gap-2">
            {report.appointments
              .filter(a => a.status === 'agendada')
              .slice(0, 5)
              .map(a => (
                <div key={a.id} className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle flex-shrink-0"
                    style={{ width: 8, height: 8, background: '#0ea5e9' }}
                  />
                  <span className="small flex-grow-1">
                    {a.appointment_type ?? 'Consulta'}
                    {a.doctor_name && ` · ${a.doctor_name}`}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    {a.appointment_at
                      ? format(new Date(a.appointment_at), 'dd/MM/yyyy', { locale: ptBR })
                      : '—'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
