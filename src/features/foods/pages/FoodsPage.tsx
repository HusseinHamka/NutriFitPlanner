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
import { FoodLibraryForm } from '@/features/foods/components/LibraryItemForm'
import { queryKeys } from '@/lib/queryKeys'
import type { FoodFormValues } from '@/lib/schemas'
import { services } from '@/services/container'

export default function FoodsPage() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const foodsQuery = useQuery({ queryKey: queryKeys.foods, queryFn: () => services.foods.list() })

  const createMutation = useMutation({
    mutationFn: (values: FoodFormValues) => services.foods.create(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.foods })
      toast.success('Food added')
      setOpen(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) => services.foods.toggleFavorite(id, isFavorite),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: queryKeys.foods }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => services.foods.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.foods })
      toast.success('Food deleted')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const filtered = useMemo(() => {
    const items = foodsQuery.data ?? []
    if (!search.trim()) return items
    const term = search.toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term))
  }, [foodsQuery.data, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-deep-forest">Food Library</h1>
          <p className="text-muted-foreground">Reusable foods for diet plans.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-deep-forest hover:bg-deep-forest/90"><Plus className="mr-2 h-4 w-4" />Add Food</Button>
          </DialogTrigger>
          <DialogContent className="bg-paper">
            <DialogHeader><DialogTitle>Add Food</DialogTitle></DialogHeader>
            <FoodLibraryForm submitting={createMutation.isPending} onSubmit={(values) => createMutation.mutate(values)} />
          </DialogContent>
        </Dialog>
      </div>
      <Input placeholder="Filter foods…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

      {foodsQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : null}

      {!foodsQuery.isLoading && !foodsQuery.data?.length ? (
        <EmptyState
          title="No foods yet"
          description="Add foods to your library for quick meal planning."
          action={
            <Button className="bg-deep-forest hover:bg-deep-forest/90" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Food
            </Button>
          }
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((food) => (
          <Card key={food.id} className="border-border bg-paper">
            <CardContent className="flex items-start justify-between gap-3 pt-6">
              <div>
                <p className="font-medium">{food.name}</p>
                <p className="text-sm text-muted-foreground">{food.category || 'Uncategorized'}</p>
                <p className="mt-2 text-sm">{food.calories ?? '—'} kcal · P {food.protein ?? '—'} · C {food.carbs ?? '—'} · F {food.fat ?? '—'}</p>
                {food.isFavorite ? <Badge className="mt-2">Favorite</Badge> : null}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => favoriteMutation.mutate({ id: food.id, isFavorite: !food.isFavorite })}>
                  <Star className={food.isFavorite ? 'fill-deep-forest text-deep-forest' : ''} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-paper">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete food?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &quot;{food.name}&quot; from your library.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteMutation.mutate(food.id)}>
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
