import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Star, Trash2 } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ExerciseLibraryForm } from '@/features/foods/components/LibraryItemForm'
import { queryKeys } from '@/lib/queryKeys'
import type { ExerciseFormValues } from '@/lib/schemas'
import { services } from '@/services/container'

export default function ExercisesPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const exercisesQuery = useQuery({ queryKey: queryKeys.exercises, queryFn: () => services.exercises.list() })

  const createMutation = useMutation({
    mutationFn: (values: ExerciseFormValues) => services.exercises.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.exercises })
      toast.success('Exercise added')
      setOpen(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => services.exercises.toggleFavorite(id, isFavorite),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: queryKeys.exercises }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.exercises.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.exercises })
      toast.success('Exercise deleted')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const filtered = useMemo(() => {
    const items = exercisesQuery.data ?? []
    if (!search.trim()) return items
    const term = search.toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(term) || item.muscleGroup.toLowerCase().includes(term))
  }, [exercisesQuery.data, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-deep-forest">Exercise Library</h1>
          <p className="text-muted-foreground">Reusable exercises for workout plans.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-deep-forest hover:bg-deep-forest/90"><Plus className="mr-2 h-4 w-4" />Add Exercise</Button>
          </DialogTrigger>
          <DialogContent className="bg-paper">
            <DialogHeader><DialogTitle>Add Exercise</DialogTitle></DialogHeader>
            <ExerciseLibraryForm submitting={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
          </DialogContent>
        </Dialog>
      </div>
      <Input placeholder="Filter exercises…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

      {exercisesQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : null}

      {!exercisesQuery.isLoading && !exercisesQuery.data?.length ? (
        <EmptyState
          title="No exercises yet"
          description="Add exercises to your library for workout plans."
          action={
            <Button className="bg-deep-forest hover:bg-deep-forest/90" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          }
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((exercise) => (
          <Card key={exercise.id} className="border-border bg-paper">
            <CardContent className="flex items-start justify-between gap-3 pt-6">
              <div>
                <p className="font-medium">{exercise.name}</p>
                <p className="text-sm text-muted-foreground">{exercise.muscleGroup || 'General'}</p>
                <p className="mt-2 text-sm">{exercise.category || 'Uncategorized'}</p>
                {exercise.isFavorite ? <Badge className="mt-2">Favorite</Badge> : null}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => favoriteMutation.mutate({ id: exercise.id, isFavorite: !exercise.isFavorite })}>
                  <Star className={exercise.isFavorite ? 'fill-deep-forest text-deep-forest' : ''} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-paper">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete exercise?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &quot;{exercise.name}&quot; from your library.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteMutation.mutate(exercise.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
