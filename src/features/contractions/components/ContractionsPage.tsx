import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/infrastructure/supabase/client'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import { format } from 'date-fns'

export function ContractionsPage() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()

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

  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: todayContractions } = useQuery({
    queryKey: ['contractions-today', pregnancy?.id, today],
    enabled: !!pregnancy?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('contractions')
        .select('*')
        .eq('pregnancy_id', pregnancy!.id)
        .gte('contraction_start', `${today}T00:00:00`)
        .lte('contraction_start', `${today}T23:59:59`)
        .order('contraction_start')
      return data ?? []
    },
  })

  const addContraction = useMutation({
    mutationFn: async ({ start, end }: { start: string; end: string }) => {
      if (!pregnancy?.id || !profile?.tenant_id) return
      const duration = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000)
      const last = todayContractions?.[todayContractions.length - 1]
      const interval = last
        ? Math.floor((new Date(start).getTime() - new Date(last.contraction_start).getTime()) / 1000)
        : null

      await supabase.from('contractions').insert({
        pregnancy_id: pregnancy.id,
        tenant_id: profile.tenant_id,
        contraction_start: start,
        contraction_end: end,
        duration_seconds: duration,
        interval_seconds: interval,
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contractions-today'] }),
  })

  function handleStart() {
    setStartTime(new Date())
    setIsActive(true)
    setElapsed(0)
  }

  function handleStop() {
    if (!startTime) return
    const end = new Date()
    addContraction.mutate({ start: startTime.toISOString(), end: end.toISOString() })
    setIsActive(false)
    setStartTime(null)
    setElapsed(0)
  }

  function formatSeconds(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const lastInterval = todayContractions?.[todayContractions.length - 1]?.interval_seconds
  const isFrequent = lastInterval !== null && lastInterval !== undefined && lastInterval < 600

  return (
    <div>
      <h4 className="fw-bold mb-4">⏱ Contrações</h4>

      {/* Timer */}
      <div className="card border-0 shadow-sm mb-4 p-4 text-center"
        style={{ background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' }}>
        {lastInterval && (
          <div className="mb-3 small text-muted">
            Último intervalo: <strong>{formatSeconds(lastInterval)}</strong>
          </div>
        )}

        <div
          className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-4"
          style={{
            width: 160, height: 160,
            background: isActive
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #7c3aed, #db2777)',
          }}
        >
          <div className="text-white text-center">
            <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {formatSeconds(elapsed)}
            </div>
          </div>
        </div>

        <button
          className="btn btn-lg fw-bold text-white px-5"
          style={{
            background: isActive
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #7c3aed, #db2777)',
            borderRadius: 12,
          }}
          onClick={isActive ? handleStop : handleStart}
        >
          {isActive ? 'PARAR' : 'INICIAR'}
        </button>
      </div>

      {isFrequent && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <strong>⚠️ Atenção!</strong> Contrações com intervalo menor que 10 minutos. Contate seu médico!
        </div>
      )}

      {/* Histórico do dia */}
      {todayContractions && todayContractions.length > 0 && (
        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-3">Histórico de hoje ({todayContractions.length} contrações)</h6>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Duração</th>
                  <th>Intervalo</th>
                </tr>
              </thead>
              <tbody>
                {todayContractions.map(c => (
                  <tr key={c.id}>
                    <td className="small">{format(new Date(c.contraction_start), 'HH:mm')}</td>
                    <td className="small">{c.duration_seconds ? formatSeconds(c.duration_seconds) : '–'}</td>
                    <td className={`small ${c.interval_seconds && c.interval_seconds < 600 ? 'text-danger fw-bold' : ''}`}>
                      {c.interval_seconds ? formatSeconds(c.interval_seconds) : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
