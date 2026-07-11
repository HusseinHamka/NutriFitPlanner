import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateClientDialog } from '@/features/clients/components/CreateClientDialog'
import { formatDate, formatPlanStatus, fullName } from '@/lib/helpers'
import { queryKeys } from '@/lib/queryKeys'
import { services } from '@/services/container'

export default function DashboardPage() {
  const statsQuery = useQuery({ queryKey: queryKeys.dashboard, queryFn: () => services.dashboard.getStats() })
  const clientsQuery = useQuery({ queryKey: [...queryKeys.clients, 'recent'], queryFn: () => services.dashboard.getRecentClients() })
  const plansQuery = useQuery({ queryKey: [...queryKeys.plans(), 'recent'], queryFn: () => services.dashboard.getRecentPlans() })
  const reportsQuery = useQuery({ queryKey: [...queryKeys.reports, 'recent'], queryFn: () => services.dashboard.getRecentReports() })

  const stats = statsQuery.data
  const loading = statsQuery.isLoading

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-deep-forest">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your practice activity.</p>
        </div>
        <CreateClientDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24" />)
          : [
              { label: 'Clients', value: stats?.clientCount ?? 0 },
              { label: 'Active Plans', value: stats?.activePlans ?? 0 },
              { label: 'Draft Plans', value: stats?.draftPlans ?? 0 },
              { label: 'Archived Plans', value: stats?.archivedPlans ?? 0 },
            ].map((item) => (
              <Card key={item.label} className="border-border bg-paper" aria-label={`${item.label}: ${item.value}`}>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-3xl font-semibold text-deep-forest" aria-hidden="true">{item.value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-paper lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientsQuery.isLoading ? (
              <>
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </>
            ) : null}
            {clientsQuery.data?.map((client) => (
              <Link key={client.id} to={`/clients/${client.id}`} className="block rounded-[var(--radius)] border border-border p-3 hover:bg-soft-sage/40">
                <p className="font-medium">{fullName(client.firstName, client.lastName)}</p>
                <p className="text-sm text-muted-foreground">{formatDate(client.updatedAt)}</p>
              </Link>
            ))}
            {!clientsQuery.isLoading && !clientsQuery.data?.length ? (
              <p className="text-sm text-muted-foreground">No clients yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border bg-paper lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plansQuery.isLoading ? (
              <>
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </>
            ) : null}
            {plansQuery.data?.map((plan) => (
              <Link key={plan.id} to={`/plans/${plan.id}`} className="block rounded-[var(--radius)] border border-border p-3 hover:bg-soft-sage/40">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{plan.title}</p>
                  <Badge variant="secondary">{formatPlanStatus(plan.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{plan.type}</p>
              </Link>
            ))}
            {!plansQuery.isLoading && !plansQuery.data?.length ? (
              <p className="text-sm text-muted-foreground">No plans yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border bg-paper lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportsQuery.isLoading ? (
              <>
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </>
            ) : null}
            {reportsQuery.data?.map((report) => (
              report.planId ? (
                <Link
                  key={report.id}
                  to={`/plans/${report.planId}`}
                  className="block rounded-[var(--radius)] border border-border p-3 hover:bg-soft-sage/40"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-deep-forest" />
                    <p className="font-medium">{report.title}</p>
                    <Badge variant="secondary">{report.format.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(report.generatedAt)}</p>
                </Link>
              ) : (
                <div key={report.id} className="rounded-[var(--radius)] border border-border p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-deep-forest" />
                    <p className="font-medium">{report.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(report.generatedAt)} · {report.format}</p>
                </div>
              )
            ))}
            {!reportsQuery.isLoading && !reportsQuery.data?.length ? (
              <p className="text-sm text-muted-foreground">No reports yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
