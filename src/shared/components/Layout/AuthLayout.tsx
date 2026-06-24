import { Outlet } from 'react-router-dom'
import { Baby } from 'lucide-react'

export function AuthLayout() {
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #dbeafe 100%)' }}
    >
      <div className="w-100" style={{ maxWidth: 440 }}>
        <div className="text-center mb-4">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #f9a8d4, #c084fc)' }}
          >
            <Baby size={32} className="text-white" />
          </div>
          <h1 className="fw-bold mb-1" style={{ color: '#7c3aed' }}>Baby Journey</h1>
          <p className="text-muted small">Acompanhe cada momento da sua gravidez</p>
        </div>
        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
