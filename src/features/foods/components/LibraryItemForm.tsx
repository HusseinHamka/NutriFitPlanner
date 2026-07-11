import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { exerciseSchema, foodSchema, type ExerciseFormValues, type FoodFormValues } from '@/lib/schemas'

export function FoodLibraryForm({ submitting, onSubmit }: { submitting?: boolean; onSubmit: (values: FoodFormValues) => void }) {
  const form = useForm<FoodFormValues>({
    resolver: zodResolver(foodSchema),
    defaultValues: { name: '', category: '', calories: '', protein: '', carbs: '', fat: '', unit: 'g', isFavorite: false, notes: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid gap-4 md:grid-cols-2">
          {(['calories', 'protein', 'carbs', 'fat'] as const).map((name) => (
            <FormField key={name} control={form.control} name={name} render={({ field }) => (
              <FormItem><FormLabel>{name.charAt(0).toUpperCase() + name.slice(1)}</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          ))}
        </div>
        <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Unit</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="isFavorite" render={({ field }) => (
          <FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Favorite</FormLabel></FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" className="bg-deep-forest hover:bg-deep-forest/90" disabled={submitting}>Save</Button>
      </form>
    </Form>
  )
}

export function ExerciseLibraryForm({ submitting, onSubmit }: { submitting?: boolean; onSubmit: (values: ExerciseFormValues) => void }) {
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: '', category: '', muscleGroup: '', isFavorite: false, notes: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="muscleGroup" render={({ field }) => (<FormItem><FormLabel>Muscle Group</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="isFavorite" render={({ field }) => (
          <FormItem className="flex items-center gap-2"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Favorite</FormLabel></FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Button type="submit" className="bg-deep-forest hover:bg-deep-forest/90" disabled={submitting}>Save</Button>
      </form>
    </Form>
  )
}
