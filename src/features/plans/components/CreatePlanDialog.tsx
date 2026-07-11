import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { emptyPlanSnapshot } from '@/lib/helpers'
import { queryKeys } from '@/lib/queryKeys'
import type { PlanType } from '@/types/domain'
import { services } from '@/services/container'

interface CreatePlanDialogProps {
  clientId: string
}

export function CreatePlanDialog({ clientId }: CreatePlanDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<PlanType>('combined')
  const [templateId, setTemplateId] = useState<string>('blank')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const templatesQuery = useQuery({ queryKey: queryKeys.templates, queryFn: () => services.templates.list() })

  const createMutation = useMutation({
    mutationFn: async () => {
      let snapshot = emptyPlanSnapshot(type)
      if (templateId !== 'blank') {
        const template = await services.templates.getById(templateId)
        if (template) snapshot = template.content
      }
      return services.plans.create({ clientId, title, type, snapshot })
    },
    onSuccess: async (plan) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.plans(clientId) })
      toast.success('Plan created')
      setOpen(false)
      navigate(`/plans/${plan.id}`)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-deep-forest hover:bg-deep-forest/90">
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-paper">
        <DialogHeader><DialogTitle>Create Plan</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Plan title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={type} onValueChange={(value: PlanType) => setType(value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="diet">Diet</SelectItem>
              <SelectItem value="workout">Workout</SelectItem>
              <SelectItem value="combined">Combined</SelectItem>
            </SelectContent>
          </Select>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger><SelectValue placeholder="Start from template" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="blank">Blank plan</SelectItem>
              {templatesQuery.data?.map((template) => (
                <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-deep-forest hover:bg-deep-forest/90" disabled={!title || createMutation.isPending} onClick={() => createMutation.mutate()}>
            Create Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
