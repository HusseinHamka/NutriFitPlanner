import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoading } from '@/components/common/PageLoading'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DietPlanEditor } from '@/features/plans/components/DietPlanEditor'
import { WorkoutPlanEditor } from '@/features/plans/components/WorkoutPlanEditor'
import { normalizePlanSnapshot } from '@/lib/planSnapshot'
import { queryKeys } from '@/lib/queryKeys'
import type { PlanSnapshot } from '@/types/domain'
import { services } from '@/services/container'

export default function TemplateEditorPage() {
  const { templateId = '' } = useParams()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [snapshot, setSnapshot] = useState<PlanSnapshot | null>(null)

  const templateQuery = useQuery({
    queryKey: queryKeys.template(templateId),
    queryFn: () => services.templates.getById(templateId),
    enabled: Boolean(templateId),
  })

  const template = templateQuery.data

  useEffect(() => {
    if (!template) return
    setName(template.name)
    setDescription(template.description ?? '')
    setSnapshot(normalizePlanSnapshot(template.content))
  }, [template?.id])

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!template || !snapshot) throw new Error('Template not loaded')
      return services.templates.update(templateId, {
        name,
        description,
        type: template.type,
        content: snapshot,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      await queryClient.invalidateQueries({ queryKey: queryKeys.template(templateId) })
      toast.success('Template saved')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (templateQuery.isLoading) return <PageLoading />
  if (templateQuery.isError || !template || !snapshot) {
    return <p className="text-muted-foreground">Template not found.</p>
  }

  const showDiet = template.type === 'diet' || template.type === 'combined'
  const showWorkout = template.type === 'workout' || template.type === 'combined'

  const updateDiet = (updates: Partial<NonNullable<PlanSnapshot['diet']>>) => {
    if (!snapshot.diet) return
    setSnapshot({ ...snapshot, diet: { ...snapshot.diet, ...updates } })
  }

  const updateWorkout = (updates: Partial<NonNullable<PlanSnapshot['workout']>>) => {
    if (!snapshot.workout) return
    setSnapshot({ ...snapshot, workout: { ...snapshot.workout, ...updates } })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link to="/templates" className="hover:text-deep-forest">Templates</Link>
            {' / '}
            {template.name}
          </p>
          <h1 className="font-heading text-3xl text-deep-forest">Edit Template</h1>
        </div>
        <Button
          className="bg-deep-forest hover:bg-deep-forest/90"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? 'Saving…' : 'Save Template'}
        </Button>
      </div>

      <Card className="border-border bg-paper">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          <Input placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </CardContent>
      </Card>

      <Tabs defaultValue={showDiet ? 'diet' : 'workout'}>
        <TabsList className="bg-paper">
          {showDiet ? <TabsTrigger value="diet">Diet</TabsTrigger> : null}
          {showWorkout ? <TabsTrigger value="workout">Workout</TabsTrigger> : null}
        </TabsList>
        {showDiet && snapshot.diet ? (
          <TabsContent value="diet">
            <DietPlanEditor diet={snapshot.diet} onChange={updateDiet} />
          </TabsContent>
        ) : null}
        {showWorkout && snapshot.workout ? (
          <TabsContent value="workout">
            <WorkoutPlanEditor workout={snapshot.workout} onChange={updateWorkout} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}
