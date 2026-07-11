import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fullName } from '@/lib/helpers'
import { queryKeys } from '@/lib/queryKeys'
import type { PlanTemplate } from '@/types/domain'
import { services } from '@/services/container'

interface UseTemplateDialogProps {
  template: PlanTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UseTemplateDialog({ template, open, onOpenChange }: UseTemplateDialogProps) {
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState(`${template.name} Plan`)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const clientsQuery = useQuery({ queryKey: queryKeys.clients, queryFn: () => services.clients.list() })

  const createMutation = useMutation({
    mutationFn: () =>
      services.plans.create({
        clientId,
        title,
        type: template.type,
        snapshot: template.content,
      }),
    onSuccess: async (plan) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.plans(clientId) })
      toast.success('Plan created from template')
      onOpenChange(false)
      navigate(`/plans/${plan.id}`)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-paper">
        <DialogHeader>
          <DialogTitle>Use Template: {template.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clientsQuery.data?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {fullName(client.firstName, client.lastName)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Plan title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button
            className="bg-deep-forest hover:bg-deep-forest/90"
            disabled={!clientId || !title || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            Create Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
