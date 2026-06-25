import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'
import { ROUTES } from '@/shared/constants/routes'
import {
  Baby,
  LayoutDashboard,
  Calendar,
  FlaskConical,
  Syringe,
  Activity,
  Camera,
  BookOpen,
  Baby as KickIcon,
  Timer,
  ShoppingCart,
  Globe,
  Stethoscope,
  FileText,
  FolderOpen,
  LogOut,
  Bell,
  ChevronDown,
  Sparkles,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications'

const navItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.BABY_DEVELOPMENT, icon: Baby, label: 'Bebê' },
  { to: ROUTES.TIMELINE, icon: Activity, label: 'Timeline' },
  { to: ROUTES.APPOINTMENTS, icon: Calendar, label: 'Consultas' },
  { to: ROUTES.EXAMS, icon: FlaskConical, label: 'Exames' },
  { to: ROUTES.VACCINES, icon: Syringe, label: 'Vacinas' },
  { to: ROUTES.SYMPTOMS, icon: Stethoscope, label: 'Sintomas' },
  { to: ROUTES.PHOTOS, icon: Camera, label: 'Fotos' },
  { to: ROUTES.DIARY, icon: BookOpen, label: 'Diário' },
  { to: ROUTES.KICKS, icon: KickIcon, label: 'Chutes' },
  { to: ROUTES.CONTRACTIONS, icon: Timer, label: 'Contrações' },
  { to: ROUTES.LAYETTE, icon: ShoppingCart, label: 'Enxoval' },
  { to: ROUTES.HOSPITAL_BAG, icon: FileText, label: 'Mala' },
  { to: ROUTES.LAYETTE_INTELLIGENCE, icon: Sparkles, label: 'Inteligência' },
  { to: ROUTES.INTERNATIONAL_MOVE, icon: Globe, label: 'Mudança' },
  { to: ROUTES.DOCUMENTS, icon: FolderOpen, label: 'Documentos' },
  { to: ROUTES.NOTIFICATIONS, icon: Bell, label: 'Notificações' },
  { to: ROUTES.REPORTS, icon: BarChart3, label: 'Relatórios' },
]

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadCount()

  async function handleSignOut() {
    await signOut()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`bg-white border-end d-flex flex-column position-fixed top-0 start-0 h-100 ${sidebarOpen ? 'd-flex' : 'd-none d-md-flex'}`}
        style={{ width: 240, zIndex: 1045, overflowY: 'auto' }}
      >
        {/* Logo */}
        <div className="px-3 py-4 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #f9a8d4, #c084fc)' }}
            >
              <Baby size={18} className="text-white" />
            </div>
            <span className="fw-bold fs-6" style={{ color: '#7c3aed' }}>Baby Journey</span>
          </div>
        </div>

        {/* Nav items */}
        <ul className="nav flex-column px-2 py-3 flex-grow-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to} className="nav-item mb-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 rounded px-3 py-2 ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                }
                style={{ fontSize: '0.875rem' }}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User footer */}
        <div className="px-3 py-3 border-top">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}
            >
              {profile?.full_name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="flex-grow-1 overflow-hidden">
              <div className="text-truncate fw-semibold" style={{ fontSize: '0.8rem' }}>
                {profile?.full_name ?? 'Usuário'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                {profile?.role === 'partner' ? 'Casal' : profile?.role === 'platform_admin' ? 'Admin' : 'Familiar'}
              </div>
            </div>
            <button
              className="btn btn-sm text-muted p-1"
              onClick={handleSignOut}
              title="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-grow-1 d-flex flex-column" style={{ marginLeft: 0 }}>
        {/* Mobile topbar */}
        <header className="d-md-none bg-white border-bottom px-3 py-2 d-flex align-items-center justify-content-between sticky-top">
          <button
            className="btn btn-sm text-secondary p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronDown size={20} />
          </button>
          <span className="fw-bold" style={{ color: '#7c3aed' }}>Baby Journey</span>
          <NavLink to={ROUTES.NOTIFICATIONS} className="btn btn-sm text-secondary p-1 position-relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 end-0 badge rounded-pill bg-danger"
                style={{ fontSize: '0.55rem', padding: '2px 4px', minWidth: 16 }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        </header>

        {/* Desktop: push content right of sidebar */}
        <div className="d-none d-md-block" style={{ marginLeft: 240 }}>
          <main className="p-4">
            <Outlet />
          </main>
        </div>

        {/* Mobile content */}
        <div className="d-md-none">
          <main className="p-3">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
