import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageLoading } from '@/components/common/PageLoading'
import { ClientForm } from '@/features/clients/components/ClientForm'
import { MeasurementForm } from '@/features/measurements/components/MeasurementForm'
import { CreatePlanDialog } from '@/features/plans/components/CreatePlanDialog'
import { formatDate, formatPlanStatus, fullName } from '@/lib/helpers'
import { queryKeys } from '@/lib/queryKeys'
import type { ClientFormValues, MeasurementFormValues } from '@/lib/schemas'
import { services } from '@/services/container'

export default function ClientDetailPage() {
  const { clientId = '' } = useParams()
  const navigate = useNavigate()
  const [measurementOpen, setMeasurementOpen] = useState(false)
  const queryClient = useQueryClient()

  const clientQuery = useQuery({
    queryKey: queryKeys.client(clientId),
    queryFn: () => services.clients.getById(clientId),
    enabled: Boolean(clientId),
  })

  const measurementsQuery = useQuery({
    queryKey: queryKeys.measurementsList(clientId),
    queryFn: () => services.measurements.listByClient(clientId),
    enabled: Boolean(clientId),
  })

  const plansQuery = useQuery({
    queryKey: queryKeys.plans(clientId),
    queryFn: () => services.plans.list(clientId),
    enabled: Boolean(clientId),
  })

  const updateMutation = useMutation({
    mutationFn: (values: ClientFormValues) => services.clients.update(clientId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.client(clientId) })
      toast.success('Client updated')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const measurementMutation = useMutation({
    mutationFn: (values: MeasurementFormValues) => services.measurements.create(clientId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.measurementsList(clientId) })
      toast.success('Measurement recorded')
      setMeasurementOpen(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteClientMutation = useMutation({
    mutationFn: () => services.clients.delete(clientId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      toast.success('Client deleted')
      navigate('/clients')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deletePlanMutation = useMutation({
    mutationFn: (planId: string) => services.plans.delete(planId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.plans(clientId) })
      toast.success('Plan deleted')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (clientQuery.isLoading) return <PageLoading />
  const client = clientQuery.data
  if (clientQuery.isError || !client) {
    return <p className="text-muted-foreground">Client not found.</p>
  }

  const latestMeasurement = measurementsQuery.data?.[0]
  const measurements = Array.isArray(measurementsQuery.data) ? measurementsQuery.data : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-deep-forest">{fullName(client.firstName, client.lastName)}</h1>
          <p className="text-muted-foreground">Client since {formatDate(client.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CreatePlanDialog clientId={client.id} />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-paper">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="border-border bg-paper">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle>Profile</CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Client
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-paper">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete client?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {fullName(client.firstName, client.lastName)} and all associated plans. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => deleteClientMutation.mutate()}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardHeader>
            <CardContent>
              <ClientForm initialValues={client} submitting={updateMutation.isPending} onSubmit={(values) => updateMutation.mutate(values)} />
            </CardContent>
          </Card>
          {latestMeasurement ? (
            <Card className="border-border bg-paper">
              <CardHeader><CardTitle>Current Measurement</CardTitle></CardHeader>
              <CardContent className="grid gap-2 text-sm md:grid-cols-4">
                <p>Weight: {latestMeasurement.weight ?? '—'} kg</p>
                <p>Height: {latestMeasurement.height ?? '—'} cm</p>
                <p>BMI: {latestMeasurement.bmi ?? '—'}</p>
                <p>Date: {formatDate(latestMeasurement.measuredAt)}</p>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <Dialog open={measurementOpen} onOpenChange={setMeasurementOpen}>
            <DialogTrigger asChild>
              <Button className="bg-deep-forest hover:bg-deep-forest/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Measurement
              </Button>
            </DialogTrigger>
            <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden bg-paper p-0">
              <DialogHeader className="px-6 pt-6"><DialogTitle>Add Measurement</DialogTitle></DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <MeasurementForm
                  formId="add-measurement-form"
                  submitting={measurementMutation.isPending}
                  onSubmit={(values) => measurementMutation.mutate(values)}
                />
              </div>
              <div className="sticky bottom-0 border-t border-border bg-paper px-6 py-4">
                <Button
                  type="submit"
                  form="add-measurement-form"
                  className="w-full bg-deep-forest hover:bg-deep-forest/90"
                  disabled={measurementMutation.isPending}
                >
                  {measurementMutation.isPending ? 'Saving...' : 'Save Measurement'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="space-y-3">
            {measurements.map((measurement) => (
              <Card key={measurement.id} className="border-border bg-paper">
                <CardContent className="grid gap-2 pt-6 text-sm md:grid-cols-4">
                  <p className="font-medium">{formatDate(measurement.measuredAt)}</p>
                  <p>Weight: {measurement.weight ?? '—'} kg</p>
                  <p>Height: {measurement.height ?? '—'} cm</p>
                  <p>BMI: {measurement.bmi ?? '—'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-3">
          {plansQuery.data?.map((plan) => (
            <Card key={plan.id} className="border-border bg-paper">
              <CardContent className="flex items-center justify-between gap-3 pt-6">
                <Link to={`/plans/${plan.id}`} className="min-w-0 flex-1 hover:text-deep-forest">
                  <p className="font-medium">{plan.title}</p>
                  <p className="text-sm text-muted-foreground">{plan.type} · Revision {plan.currentRevisionNumber}</p>
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{formatPlanStatus(plan.status)}</Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-paper">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &quot;{plan.title}&quot; and all revisions.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive hover:bg-destructive/90"
                          onClick={() => deletePlanMutation.mutate(plan.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
          {!plansQuery.data?.length ? <p className="text-muted-foreground">No plans yet.</p> : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
