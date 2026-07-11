import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { saveAs } from 'file-saver'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoading } from '@/components/common/PageLoading'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DietPlanEditor } from '@/features/plans/components/DietPlanEditor'
import { WorkoutPlanEditor } from '@/features/plans/components/WorkoutPlanEditor'
import { ReportRenderer } from '@/features/reports/components/ReportRenderer'
import { formatDateTime, fullName, buildReportTitle } from '@/lib/helpers'
import { normalizePlanSnapshot } from '@/lib/planSnapshot'
import { queryKeys } from '@/lib/queryKeys'
import type { PlanSnapshot, PlanStatus } from '@/types/domain'
import { services } from '@/services/container'

function revisionSummary(snapshot: PlanSnapshot): string {
  const diet = snapshot.diet
  const mealCount = diet
    ? diet.scheduleMode === 'weekly'
      ? diet.weeklyDays.reduce((sum, day) => sum + day.meals.length, 0)
      : diet.mealSlots.reduce((sum, slot) => sum + slot.options.length, 0)
    : 0
  const dayCount = snapshot.workout?.days.length ?? 0
  const parts: string[] = []
  if (mealCount) parts.push(`${mealCount} meal${mealCount === 1 ? '' : 's'}`)
  if (dayCount) parts.push(`${dayCount} training day${dayCount === 1 ? '' : 's'}`)
  return parts.length ? parts.join(' · ') : 'Empty snapshot'
}

export default function PlanEditorPage() {
  const { planId = '' } = useParams()
  const queryClient = useQueryClient()
  const [snapshot, setSnapshot] = useState<PlanSnapshot | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isDirty, setIsDirty] = useState(false)
  const [showAllRevisions, setShowAllRevisions] = useState(false)
  const hydratedRevisionId = useRef<string | null>(null)

  const planQuery = useQuery({ queryKey: queryKeys.plan(planId), queryFn: () => services.plans.getById(planId), enabled: Boolean(planId) })
  const revisionsQuery = useQuery({ queryKey: queryKeys.revisions(planId), queryFn: () => services.plans.listRevisions(planId), enabled: Boolean(planId) })
  const clientQuery = useQuery({
    queryKey: queryKeys.client(planQuery.data?.clientId ?? ''),
    queryFn: () => services.clients.getById(planQuery.data!.clientId),
    enabled: Boolean(planQuery.data?.clientId),
  })
  const measurementQuery = useQuery({
    queryKey: queryKeys.measurementLatest(planQuery.data?.clientId ?? ''),
    queryFn: () => services.measurements.getLatest(planQuery.data!.clientId),
    enabled: Boolean(planQuery.data?.clientId),
  })

  const currentRevision = revisionsQuery.data?.[0]
  const plan = planQuery.data
  const client = clientQuery.data

  useEffect(() => {
    if (!currentRevision || currentRevision.id === hydratedRevisionId.current) return
    hydratedRevisionId.current = currentRevision.id
    setSnapshot(normalizePlanSnapshot(currentRevision.snapshot))
    setIsDirty(false)
  }, [currentRevision?.id])

  const reportQuery = useQuery({
    queryKey: ['report-model', planId, plan?.currentRevisionNumber],
    queryFn: () => services.report.buildReportModel(planId),
    enabled: Boolean(planId && plan),
  })

  const previewModel = useMemo(() => {
    if (!reportQuery.data || !snapshot) return null
    return {
      ...reportQuery.data,
      revision: {
        ...reportQuery.data.revision,
        snapshot: normalizePlanSnapshot(snapshot),
      },
      generatedAt: new Date().toISOString(),
    }
  }, [reportQuery.data, snapshot])

  const saveMutation = useMutation({
    mutationFn: (nextSnapshot: PlanSnapshot) => {
      if (!plan) throw new Error('Plan not found')
      return services.plans.updateRevision(planId, plan.currentRevisionNumber, nextSnapshot)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['report-model', planId] })
      setSaveState('saved')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const newVersionMutation = useMutation({
    mutationFn: (nextSnapshot: PlanSnapshot) => services.plans.createRevision(planId, nextSnapshot),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.plan(planId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.revisions(planId) }),
        queryClient.invalidateQueries({ queryKey: ['report-model', planId] }),
      ])
      hydratedRevisionId.current = null
      toast.success('New revision saved')
      setSaveState('saved')
      setIsDirty(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const statusMutation = useMutation({
    mutationFn: (status: PlanStatus) => services.plans.update(planId, { status }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: queryKeys.plan(planId) }),
  })

  const restoreMutation = useMutation({
    mutationFn: (revisionNumber: number) => services.plans.restoreRevision(planId, revisionNumber),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.plan(planId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.revisions(planId) }),
      ])
      hydratedRevisionId.current = null
      toast.success('Revision restored as new revision')
    },
  })

  useEffect(() => {
    if (!snapshot || !plan || !isDirty) return
    const timeout = setTimeout(() => {
      setSaveState('saving')
      saveMutation.mutate(snapshot, {
        onSuccess: () => setIsDirty(false),
      })
    }, 2000)
    return () => clearTimeout(timeout)
  }, [snapshot, isDirty, plan?.currentRevisionNumber, planId])

  const updateSnapshot = (next: PlanSnapshot) => {
    setSnapshot(next)
    setSaveState('idle')
    setIsDirty(true)
  }

  const exportPdf = async () => {
    if (!previewModel) return
    try {
      const blob = await services.export.exportPdf(previewModel)
      const clientName = fullName(previewModel.client.firstName, previewModel.client.lastName)
      const title = buildReportTitle(plan?.title ?? 'Report', clientName, 'pdf')
      saveAs(blob, `${plan?.title ?? 'report'}.pdf`)
      await services.reports.create({ planRevisionId: previewModel.revision.id, clientId: previewModel.client.id, title, format: 'pdf' })
      toast.success('PDF exported')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'PDF export failed')
    }
  }

  const exportDocx = async () => {
    if (!previewModel) return
    try {
      const blob = await services.export.exportDocx(previewModel)
      const clientName = fullName(previewModel.client.firstName, previewModel.client.lastName)
      const title = buildReportTitle(plan?.title ?? 'Report', clientName, 'docx')
      saveAs(blob, `${plan?.title ?? 'report'}.docx`)
      await services.reports.create({ planRevisionId: previewModel.revision.id, clientId: previewModel.client.id, title, format: 'docx' })
      toast.success('DOCX exported')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'DOCX export failed')
    }
  }

  if (planQuery.isLoading || !plan || !snapshot) return <PageLoading />

  const saveLabel = saveState === 'saving'
    ? 'Saving…'
    : saveState === 'saved'
      ? 'Saved'
      : isDirty
        ? 'Unsaved changes'
        : 'All changes saved'

  const visibleRevisions = showAllRevisions ? revisionsQuery.data ?? [] : (revisionsQuery.data ?? []).slice(0, 5)

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted-foreground">
        <Link to="/clients" className="hover:text-deep-forest">Clients</Link>
        {client ? (
          <>
            <span className="mx-2">/</span>
            <Link to={`/clients/${client.id}`} className="hover:text-deep-forest">{fullName(client.firstName, client.lastName)}</Link>
          </>
        ) : null}
        <span className="mx-2">/</span>
        <span className="text-ink">{plan.title}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-deep-forest">{plan.title}</h1>
          <p className="text-muted-foreground">{client ? fullName(client.firstName, client.lastName) : 'Client'} · Revision {plan.currentRevisionNumber}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={plan.status} onValueChange={(value: PlanStatus) => statusMutation.mutate(value)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{saveLabel}</span>
          <Button
            variant="outline"
            disabled={newVersionMutation.isPending}
            onClick={() => newVersionMutation.mutate(snapshot)}
          >
            Save as new version
          </Button>
        </div>
      </div>

      <Tabs defaultValue="client">
        <TabsList className="bg-paper">
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          {snapshot.diet ? <TabsTrigger value="diet">Diet</TabsTrigger> : null}
          {snapshot.workout ? <TabsTrigger value="workout">Workout</TabsTrigger> : null}
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="history">Revision History</TabsTrigger>
        </TabsList>

        <TabsContent value="client">
          <Card className="border-border bg-paper">
            <CardContent className="grid gap-2 pt-6 text-sm md:grid-cols-2">
              <p>Name: {client ? fullName(client.firstName, client.lastName) : '—'}</p>
              <p>Email: {client?.email || '—'}</p>
              <p>Phone: {client?.phone || '—'}</p>
              <p>Address: {client?.address || '—'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements">
          <Card className="border-border bg-paper">
            <CardContent className="grid gap-2 pt-6 text-sm md:grid-cols-3">
              <p>Weight: {measurementQuery.data?.weight ?? '—'} kg</p>
              <p>Height: {measurementQuery.data?.height ?? '—'} cm</p>
              <p>BMI: {measurementQuery.data?.bmi ?? '—'}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {snapshot.diet ? (
          <TabsContent value="diet">
            <DietPlanEditor
              diet={snapshot.diet}
              onChange={(updates) => updateSnapshot({ ...snapshot, diet: { ...snapshot.diet!, ...updates } })}
            />
          </TabsContent>
        ) : null}

        {snapshot.workout ? (
          <TabsContent value="workout">
            <WorkoutPlanEditor
              workout={snapshot.workout}
              onChange={(updates) => updateSnapshot({ ...snapshot, workout: { ...snapshot.workout!, ...updates } })}
            />
          </TabsContent>
        ) : null}

        <TabsContent value="preview" className="space-y-4">
          <div className="flex gap-2">
            <Button className="bg-deep-forest hover:bg-deep-forest/90" onClick={exportPdf}>Export PDF</Button>
            <Button variant="outline" onClick={exportDocx}>Export DOCX</Button>
          </div>
          {previewModel ? <ReportRenderer model={previewModel} /> : <p className="text-muted-foreground">Configure business settings to preview reports.</p>}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {visibleRevisions.map((revision) => (
            <Card key={revision.id} className="border-border bg-paper">
              <CardContent className="flex items-center justify-between gap-4 pt-6">
                <div>
                  <p className="font-medium">Revision {revision.revisionNumber}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(revision.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">{revisionSummary(revision.snapshot)}</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Restore as New Revision</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Restore revision {revision.revisionNumber}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will create a new revision from the snapshot taken on {formatDateTime(revision.createdAt)}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => restoreMutation.mutate(revision.revisionNumber)}>Restore</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
          {(revisionsQuery.data?.length ?? 0) > 5 ? (
            <Button variant="ghost" onClick={() => setShowAllRevisions((current) => !current)}>
              {showAllRevisions ? 'Show fewer' : `Show all ${revisionsQuery.data?.length} revisions`}
            </Button>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
