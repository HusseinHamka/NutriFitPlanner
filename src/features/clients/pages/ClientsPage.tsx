import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateClientDialog } from '@/features/clients/components/CreateClientDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { formatDate, fullName } from '@/lib/helpers'
import { queryKeys } from '@/lib/queryKeys'
import { services } from '@/services/container'

export default function ClientsPage() {
  const [search, setSearch] = useState('')

  const clientsQuery = useQuery({ queryKey: queryKeys.clients, queryFn: () => services.clients.list() })

  const filteredClients = useMemo(() => {
    const clients = clientsQuery.data ?? []
    if (!search.trim()) return clients
    const term = search.toLowerCase()
    return clients.filter((client) =>
      fullName(client.firstName, client.lastName).toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term),
    )
  }, [clientsQuery.data, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-deep-forest">Clients</h1>
          <p className="text-muted-foreground">Manage client profiles and plans.</p>
        </div>
        <CreateClientDialog />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Filter clients…" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>

      {clientsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-36" />
          ))}
        </div>
      ) : null}

      {!clientsQuery.isLoading && !clientsQuery.data?.length ? (
        <EmptyState title="No clients yet" description="Add your first client to start building plans." action={<CreateClientDialog />} />
      ) : null}

      {!clientsQuery.isLoading && clientsQuery.data?.length && !filteredClients.length ? (
        <p className="text-muted-foreground">No clients match your filter.</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredClients.map((client) => (
          <Link key={client.id} to={`/clients/${client.id}`}>
            <Card className="border-border bg-paper transition-colors hover:bg-soft-sage/30">
              <CardHeader>
                <CardTitle>{fullName(client.firstName, client.lastName)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{client.email || 'No email'}</p>
                <p>{client.phone || 'No phone'}</p>
                <p>Updated {formatDate(client.updatedAt)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
