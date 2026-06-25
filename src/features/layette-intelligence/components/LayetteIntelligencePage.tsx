import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Redireciona para a aba de inteligência do módulo de enxoval unificado.
 * Esta página foi absorvida pelo LayettePage (/layette?tab=inteligencia).
 */
export function LayetteIntelligencePage() {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/layette?tab=inteligencia', { replace: true })
  }, [navigate])

  return (
    <div className="d-flex justify-content-center py-5">
      <div className="spinner-border" style={{ color: '#7c3aed' }} />
    </div>
  )
}
