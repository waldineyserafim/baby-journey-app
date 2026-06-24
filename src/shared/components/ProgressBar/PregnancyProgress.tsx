interface PregnancyProgressProps {
  week: number
  totalDays: number
  daysRemaining: number
  progressPercent: number
  trimesterLabel: string
  lmpDate: string
  dueDate: string
}

export function PregnancyProgress({
  week,
  totalDays,
  daysRemaining,
  progressPercent,
  trimesterLabel,
  lmpDate,
  dueDate,
}: PregnancyProgressProps) {
  return (
    <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge" style={{ background: '#7c3aed' }}>
                Semana {week}
              </span>
              <span className="badge bg-secondary">{trimesterLabel}</span>
            </div>
            <div className="text-muted small">Dia {totalDays} de 280</div>
          </div>
          <div className="text-end">
            <div className="fw-bold fs-4" style={{ color: '#7c3aed' }}>{progressPercent}%</div>
            <div className="text-muted small">{daysRemaining} dias restantes</div>
          </div>
        </div>

        <div className="progress mb-3" style={{ height: 8, borderRadius: 99 }}>
          <div
            className="progress-bar"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #f9a8d4, #c084fc)',
              borderRadius: 99,
            }}
          />
        </div>

        <div className="d-flex justify-content-between small text-muted">
          <span>DUM: {new Date(lmpDate).toLocaleDateString('pt-BR')}</span>
          <span>DPP: {new Date(dueDate).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  )
}
