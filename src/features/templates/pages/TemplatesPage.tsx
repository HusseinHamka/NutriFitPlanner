import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/common/EmptyState'
import { UseTemplateDialog } from '@/features/templates/components/UseTemplateDialog'
import { emptyPlanSnapshot } from '@/lib/helpers'
import { queryKeys } from '@/lib/queryKeys'
import type { PlanTemplate, PlanType } from '@/types/domain'
import { services } from '@/services/container'

export default function TemplatesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTemplate, setEditTemplate] = useState<PlanTemplate | null>(null)
  const [useTemplate, setUseTemplate] = useState<PlanTemplate | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<PlanType>('combined')
  const queryClient = useQueryClient()

  const templatesQuery = useQuery({ queryKey: queryKeys.templates, queryFn: () => services.templates.list() })

  const createMutation = useMutation({
    mutationFn: () => services.templates.create({ name, description, type, content: emptyPlanSnapshot(type) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      toast.success('Template created')
      setCreateOpen(false)
      setName('')
      setDescription('')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editTemplate) throw new Error('No template selected')
      return services.templates.update(editTemplate.id, {
        name,
        description,
        type,
        content: editTemplate.content,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      toast.success('Template updated')
      setEditTemplate(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.templates.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      toast.success('Template deleted')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const openEdit = (template: PlanTemplate) => {
    setEditTemplate(template)
    setName(template.name)
    setDescription(template.description ?? '')
    setType(template.type)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-deep-forest">Plan Templates</h1>
          <p className="text-muted-foreground">Reusable starting points for new plans.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-deep-forest hover:bg-deep-forest/90"><Plus className="mr-2 h-4 w-4" />New Template</Button>
          </DialogTrigger>
          <DialogContent className="bg-paper">
            <DialogHeader><DialogTitle>New Template</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Select value={type} onValueChange={(value: PlanType) => setType(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diet">Diet</SelectItem>
                  <SelectItem value="workout">Workout</SelectItem>
                  <SelectItem value="combined">Combined</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-deep-forest hover:bg-deep-forest/90" disabled={!name || createMutation.isPending} onClick={() => createMutation.mutate()}>
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {templatesQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : null}

      {!templatesQuery.isLoading && !templatesQuery.data?.length ? (
        <EmptyState
          title="No templates yet"
          description="Create a template to reuse diet and workout content across clients."
          action={
            <Button className="bg-deep-forest hover:bg-deep-forest/90" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          }
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {templatesQuery.data?.map((template) => (
          <Card key={template.id} className="border-border bg-paper">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle>{template.name}</CardTitle>
                {template.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                ) : (
                  <p className="mt-1 text-sm italic text-muted-foreground">No description</p>
                )}
              </div>
              <Badge variant="secondary">{template.type}</Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link to={`/templates/${template.id}`}>Edit Content</Link>
              </Button>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => openEdit(template)}>
                <Pencil className="mr-1 h-3 w-3" />
                Metadata
              </Button>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => setUseTemplate(template)}>
                Use Template
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="shrink-0 text-destructive hover:text-destructive">
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-paper">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete template?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &quot;{template.name}&quot;.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={() => deleteMutation.mutate(template.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(editTemplate)} onOpenChange={(open) => !open && setEditTemplate(null)}>
        <DialogContent className="bg-paper">
          <DialogHeader><DialogTitle>Edit Template Metadata</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Template name" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Select value={type} onValueChange={(value: PlanType) => setType(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="diet">Diet</SelectItem>
                <SelectItem value="workout">Workout</SelectItem>
                <SelectItem value="combined">Combined</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-deep-forest hover:bg-deep-forest/90" disabled={!name || updateMutation.isPending} onClick={() => updateMutation.mutate()}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {useTemplate ? (
        <UseTemplateDialog template={useTemplate} open={Boolean(useTemplate)} onOpenChange={(open) => !open && setUseTemplate(null)} />
      ) : null}
    </div>
  )
}
