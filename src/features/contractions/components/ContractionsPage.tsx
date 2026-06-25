import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { useContractions } from '../hooks/useContractions'

function formatSeconds(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function ContractionsPage() {
  const { contractions, isLoading, lastContraction, isFrequent, add, remove } = useContractions()
  const [isActive, setIsActive] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, startTime])

  function handleStart() {
    setStartTime(new Date())
    setIsActive(true)
    setElapsed(0)
  }

  function handleStop() {
    if (!startTime) return
    const end = new Date()
    add.mutate({ start: startTime.toISOString(), end: end.toISOString(), lastContraction })
    setIsActive(false)
    setStartTime(null)
    setElapsed(0)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta contração?')) return
    remove.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" style={{ color: '#7c3aed' }} />
      </div>
    )
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">Contrações</h4>

      <div
        className="card border-0 shadow-sm mb-4 p-4 text-center"
        style={{ background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' }}
      >
        {lastContraction?.interval_seconds && (
          <div className="mb-3 small text-muted">
            Último intervalo: <strong>{formatSeconds(lastContraction.interval_seconds)}</strong>
          </div>
        )}

        <div
          className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-4"
          style={{
            width: 160, height: 160,
            background: isActive
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : '#0D9488',
          }}
        >
          <div className="text-white text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {formatSeconds(elapsed)}
            </div>
            <div style={{ fontSize: '0.8rem' }}>{isActive ? 'em andamento' : 'aguardando'}</div>
          </div>
        </div>

        <button
          className="btn btn-lg fw-bold text-white px-5"
          style={{
            background: isActive
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : '#0D9488',
            borderRadius: 12,
          }}
          onClick={isActive ? handleStop : handleStart}
        >
          {isActive ? 'PARAR' : 'INICIAR'}
        </button>
      </div>

      {isFrequent && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <strong>Atenção!</strong> Contrações com intervalo menor que 10 minutos. Contate seu médico!
        </div>
      )}

      {contractions.length > 0 && (
        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-3">Hoje ({contractions.length} contração{contractions.length !== 1 ? 'ões' : ''})</h6>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Duração</th>
                  <th>Intervalo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {contractions.map(c => (
                  <tr key={c.id}>
                    <td className="small">{format(new Date(c.contraction_start), 'HH:mm')}</td>
                    <td className="small">
                      {c.duration_seconds ? formatSeconds(c.duration_seconds) : '–'}
                    </td>
                    <td className={`small ${c.interval_seconds && c.interval_seconds < 600 ? 'text-danger fw-bold' : ''}`}>
                      {c.interval_seconds ? formatSeconds(c.interval_seconds) : '–'}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-light p-1 text-danger"
                        onClick={() => handleDelete(c.id)}
                        title="Remover"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {contractions.length === 0 && (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          <p className="mb-1 fw-semibold">Nenhuma contração registrada hoje</p>
          <p className="small mb-0">Use o cronômetro acima para registrar cada contração.</p>
        </div>
      )}
    </div>
  )
}
