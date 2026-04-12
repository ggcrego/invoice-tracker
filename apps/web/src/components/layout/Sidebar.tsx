import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  BookOpen,
  Building2,
  Receipt,
  Tags,
  Wrench,
  Users,
  GitBranch,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const employeeNav = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'My Invoices', href: '/invoices', icon: FileText },
  { label: 'New Invoice', href: '/invoices/new', icon: PlusCircle },
  { label: 'Tool Directory', href: '/directory', icon: BookOpen },
]

const approverNav = [
  { label: 'Approvals', href: '/approvals', icon: CheckSquare },
]

const adminNav = [
  { label: 'Company Details', href: '/admin/company', icon: Building2 },
  { label: 'GST Details', href: '/admin/gst', icon: Receipt },
  { label: 'Expense Categories', href: '/admin/categories', icon: Tags },
  { label: 'Tool Catalog', href: '/admin/tools', icon: Wrench },
  { label: 'Manage Employees', href: '/admin/employees', icon: Users },
  { label: 'Team Assignments', href: '/admin/teams', icon: GitBranch },
]

export function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  const navItems = [
    ...employeeNav,
    ...(user.has_team_members ? approverNav : []),
  ]

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">ExpenseTrack</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              location.pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        {user.role === 'admin' && (
          <>
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admin Settings
            </div>
            {adminNav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  )
}
