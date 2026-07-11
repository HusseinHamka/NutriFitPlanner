import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ClientForm } from '@/features/clients/components/ClientForm'
import { queryKeys } from '@/lib/queryKeys'
import type { ClientFormValues } from '@/lib/schemas'
import { services } from '@/services/container'

interface CreateClientDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
}

export function CreateClientDialog({ open: controlledOpen, onOpenChange, showTrigger = true }: CreateClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (values: ClientFormValues) => services.clients.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients })
      toast.success('Client created')
      setOpen(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button className="bg-deep-forest hover:bg-deep-forest/90">
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-paper">
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
        </DialogHeader>
        <ClientForm submitting={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
      </DialogContent>
    </Dialog>
  )
}
