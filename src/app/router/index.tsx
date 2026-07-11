import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const ClientsPage = lazy(() => import('@/features/clients/pages/ClientsPage'))
const ClientDetailPage = lazy(() => import('@/features/clients/pages/ClientDetailPage'))
const FoodsPage = lazy(() => import('@/features/foods/pages/FoodsPage'))
const ExercisesPage = lazy(() => import('@/features/exercises/pages/ExercisesPage'))
const TemplatesPage = lazy(() => import('@/features/templates/pages/TemplatesPage'))
const TemplateEditorPage = lazy(() => import('@/features/templates/pages/TemplateEditorPage'))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'))
const PlanEditorPage = lazy(() => import('@/features/plans/pages/PlanEditorPage'))

import { Loader2 } from 'lucide-react'

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Loading page...
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailPage />} />
            <Route path="/plans/:planId" element={<PlanEditorPage />} />
            <Route path="/foods" element={<FoodsPage />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/:templateId" element={<TemplateEditorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
