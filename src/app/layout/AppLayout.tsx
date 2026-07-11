import { NavLink, useLocation, useNavigate } from 'react-router'
import {
  Apple,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { RouteOutlet } from '@/components/common/RouteOutlet'
import { GlobalSearch } from '@/features/search/components/GlobalSearch'
import { useAuth } from '@/features/auth/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, match: (path: string) => path.startsWith('/dashboard') },
  { to: '/clients', label: 'Clients', icon: Users, match: (path: string) => path.startsWith('/clients') || path.startsWith('/plans') },
  { to: '/foods', label: 'Foods', icon: Apple, match: (path: string) => path.startsWith('/foods') },
  { to: '/exercises', label: 'Exercises', icon: Dumbbell, match: (path: string) => path.startsWith('/exercises') },
  { to: '/templates', label: 'Templates', icon: Layers, match: (path: string) => path.startsWith('/templates') },
  { to: '/settings', label: 'Settings', icon: Settings, match: (path: string) => path.startsWith('/settings') },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = item.match(location.pathname)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm transition-colors',
              isActive ? 'bg-soft-sage text-deep-forest' : 'text-muted-foreground hover:bg-soft-sage/60 hover:text-ink',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

export function AppLayout() {
  const { signOut, session } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-paper p-6 md:block">
          <div className="mb-8">
            <p className="font-heading text-2xl text-deep-forest">NutriFit Pro</p>
            <p className="text-sm text-muted-foreground">Professional nutrition planning</p>
          </div>
          <SidebarNav />
          <div className="mt-8 border-t border-border pt-4">
            <p className="mb-2 truncate text-xs text-muted-foreground">{session?.email}</p>
            <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-border bg-paper px-4 py-4 md:px-8">
            <div className="flex items-center gap-2 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-paper">
                  <SheetHeader>
                    <SheetTitle className="font-heading text-left text-deep-forest">NutriFit Pro</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <SidebarNav />
                  </div>
                  <div className="mt-8 border-t border-border pt-4">
                    <p className="mb-2 truncate text-xs text-muted-foreground">{session?.email}</p>
                    <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <p className="font-heading text-lg text-deep-forest">NutriFit Pro</p>
            </div>
            <GlobalSearch />
            <Button variant="outline" size="sm" className="md:hidden" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </header>
          <main className="flex-1 bg-cream p-4 md:p-8">
            <RouteOutlet />
          </main>
        </div>
      </div>
    </div>
  )
}
