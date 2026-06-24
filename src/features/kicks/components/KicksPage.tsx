import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/infrastructure/supabase/client'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useAuth } from '@/shared/hooks/useAuth'
import type { Database } from '@/infrastructure/supabase/database.types'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type KickRecord = Database['public']['Tables']['kick_counts']['Row']

const DAILY_GOAL = 10

export function KicksPage() {
  const { profile } = useAuth()
  const { data: pregnancy } = useCurrentPregnancy()
  const qc = useQueryClient()
  const [sessionStart] = useState(new Date().toISOString())
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: todayRecord } = useQuery<KickRecord | null>({
    queryKey: ['kicks-today', pregnancy?.id, today],
    enabled: !!pregnancy?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('kick_counts')
        .select('*')
        .eq('pregnancy_id', pregnancy!.id)
        .eq('count_date', today)
        .maybeSingle()
      return data
    },
  })

  const { data: history } = useQuery({
    queryKey: ['kicks-history', pregnancy?.id],
    enabled: !!pregnancy?.id,
    queryFn: async () => {
      const days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd')).reverse()
      const { data } = await supabase
        .from('kick_counts')
        .select('count_date, kick_count')
        .eq('pregnancy_id', pregnancy!.id)
        .in('count_date', days)
      const map = Object.fromEntries((data ?? []).map(d => [d.count_date, d.kick_count]))
      return days.map(d => ({
        date: format(new Date(d + 'T12:00:00'), 'EEE', { locale: ptBR }),
        chutes: map[d] ?? 0,
      }))
    },
  })

  const upsertKick = useMutation({
    mutationFn: async (newCount: number) => {
      if (!pregnancy?.id || !profile?.tenant_id) return
      if (todayRecord) {
        await supabase.from('kick_counts')
          .update({ kick_count: newCount })
          .eq('id', todayRecord.id)
      } else {
        await supabase.from('kick_counts').insert({
          pregnancy_id: pregnancy.id,
          tenant_id: profile.tenant_id,
          count_date: today,
          kick_count: newCount,
          session_start: sessionStart,
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kicks-today'] })
      qc.invalidateQueries({ queryKey: ['kicks-history'] })
    },
  })

  const count = todayRecord?.kick_count ?? 0
  const goalReached = count >= DAILY_GOAL

  function handleTap() {
    upsertKick.mutate(count + 1)
  }

  function handleReset() {
    upsertKick.mutate(0)
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">👣 Contador de Chutes</h4>

      <div className="card border-0 shadow-sm mb-4 p-4 text-center"
        style={{ background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' }}>
        <div className="text-muted small mb-2">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </div>

        <div
          className="mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3"
          style={{
            width: 160, height: 160,
            background: goalReached ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #7c3aed, #db2777)',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(124,58,237,0.3)',
            transition: 'transform 0.1s',
          }}
          onClick={handleTap}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div className="text-white text-center">
            <div style={{ fontSize: '3rem', lineHeight: 1, fontWeight: 'bold' }}>{count}</div>
            <div style={{ fontSize: '0.875rem' }}>chutes</div>
          </div>
        </div>

        <div className="mb-3">
          {goalReached ? (
            <span className="badge bg-success fs-6">✅ Meta atingida! ({DAILY_GOAL} chutes)</span>
          ) : (
            <span className="text-muted small">Meta: {DAILY_GOAL} chutes · Faltam {DAILY_GOAL - count}</span>
          )}
        </div>

        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-lg text-white fw-bold px-5"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', borderRadius: 12 }}
            onClick={handleTap}
          >
            TAP
          </button>
          <button className="btn btn-outline-secondary" onClick={handleReset}>
            Zerar
          </button>
        </div>

        <div className="text-muted small mt-3">
          Sessão iniciada às {format(new Date(sessionStart), 'HH:mm')}
        </div>
      </div>

      {/* Histórico */}
      {history && (
        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-3">📊 Histórico 7 dias</h6>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={history}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="chutes" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
