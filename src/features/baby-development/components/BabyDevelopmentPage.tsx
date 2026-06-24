import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/infrastructure/supabase/client'
import { useCurrentPregnancy } from '@/shared/hooks/useCurrentPregnancy'
import { useGestationalAge } from '@/shared/hooks/useGestationalAge'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const tabs = [
  { key: 'development', label: '🧠 Desenvolvimento' },
  { key: 'organs', label: '🫀 Órgãos' },
  { key: 'mom', label: '👩 Mamãe' },
  { key: 'food', label: '🥗 Nutrição' },
  { key: 'care', label: '💊 Cuidados' },
]

export function BabyDevelopmentPage() {
  const { week: weekParam } = useParams()
  const navigate = useNavigate()
  const { data: pregnancy } = useCurrentPregnancy()
  const { week: currentWeek } = useGestationalAge(pregnancy?.lmp_date ?? null, pregnancy?.due_date ?? null)
  const [activeTab, setActiveTab] = useState('development')

  const week = weekParam ? parseInt(weekParam) : currentWeek

  const { data: content, isLoading } = useQuery({
    queryKey: ['baby-development', week],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('baby_development_content')
        .select('*')
        .eq('week', week)
        .single()
      if (error) throw error
      return data
    },
    enabled: week > 0,
  })

  function goToWeek(w: number) {
    if (w >= 1 && w <= 42) navigate(`/baby-development/${w}`)
  }

  if (isLoading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border" style={{ color: '#7c3aed' }} /></div>
  }

  return (
    <div>
      {/* Header navegação de semanas */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => goToWeek(week - 1)} disabled={week <= 1}>
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <h4 className="fw-bold mb-0" style={{ color: '#7c3aed' }}>Semana {week}</h4>
          {week === currentWeek && <span className="badge bg-success">Semana atual</span>}
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => goToWeek(week + 1)} disabled={week >= 42}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Card principal - fruta */}
      {content && (
        <>
          <div className="card border-0 shadow-sm mb-4 text-center p-4"
            style={{ background: 'linear-gradient(135deg, #fce7f3, #ede9fe)' }}>
            <div style={{ fontSize: '4rem' }}>{content.fruit_emoji ?? '🍼'}</div>
            <h3 className="fw-bold mt-2" style={{ color: '#7c3aed' }}>{content.fruit_name}</h3>
            <div className="d-flex justify-content-center gap-4 mt-2">
              <div>
                <div className="fw-bold">{content.size_cm}cm</div>
                <div className="text-muted small">Tamanho</div>
              </div>
              <div className="border-start" />
              <div>
                <div className="fw-bold">
                  {content.weight_g && content.weight_g >= 1000
                    ? `${(content.weight_g / 1000).toFixed(2)}kg`
                    : `${content.weight_g}g`}
                </div>
                <div className="text-muted small">Peso</div>
              </div>
            </div>
          </div>

          {/* Sintomas comuns */}
          {content.common_symptoms && content.common_symptoms.length > 0 && (
            <div className="card border-warning mb-3 p-3">
              <div className="fw-semibold small mb-2">⚠️ Sintomas comuns nesta semana</div>
              <div className="d-flex flex-wrap gap-2">
                {content.common_symptoms.map((s, i) => (
                  <span key={i} className="badge bg-warning text-dark">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tabs de conteúdo */}
          <ul className="nav nav-tabs mb-3 flex-nowrap overflow-auto">
            {tabs.map(t => (
              <li key={t.key} className="nav-item">
                <button
                  className={`nav-link text-nowrap ${activeTab === t.key ? 'active' : ''}`}
                  style={activeTab === t.key ? { color: '#7c3aed', borderBottomColor: '#7c3aed' } : {}}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="card border-0 shadow-sm p-4">
            {activeTab === 'development' && (
              <div>
                <h6 className="fw-bold mb-3">Desenvolvimento do Bebê</h6>
                <p className="text-muted">{content.development_summary}</p>
              </div>
            )}
            {activeTab === 'organs' && (
              <div>
                <h6 className="fw-bold mb-3">Desenvolvimento dos Órgãos</h6>
                <p className="text-muted">{content.organ_development ?? 'Em breve'}</p>
              </div>
            )}
            {activeTab === 'mom' && (
              <div>
                <h6 className="fw-bold mb-3">Mudanças na Mamãe</h6>
                <p className="text-muted">{content.mom_changes ?? 'Em breve'}</p>
              </div>
            )}
            {activeTab === 'food' && (
              <div>
                <h6 className="fw-bold mb-3">Alimentação Recomendada</h6>
                <p className="text-muted">{content.recommended_food ?? 'Em breve'}</p>
                {content.recommended_exercises && (
                  <>
                    <h6 className="fw-bold mb-2 mt-3">Exercícios</h6>
                    <p className="text-muted">{content.recommended_exercises}</p>
                  </>
                )}
              </div>
            )}
            {activeTab === 'care' && (
              <div>
                <h6 className="fw-bold mb-3">Cuidados Importantes</h6>
                <p className="text-muted">{content.important_care ?? 'Em breve'}</p>
                {content.curiosities && (
                  <div className="p-3 rounded mt-3" style={{ background: '#ede9fe' }}>
                    <div className="fw-semibold small mb-1" style={{ color: '#7c3aed' }}>💡 Curiosidade</div>
                    <p className="mb-0 small">{content.curiosities}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {!content && !isLoading && (
        <div className="text-center py-5 text-muted">
          <p>Conteúdo para a semana {week} ainda não disponível.</p>
        </div>
      )}
    </div>
  )
}
