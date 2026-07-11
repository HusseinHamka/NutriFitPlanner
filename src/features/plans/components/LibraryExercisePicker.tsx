import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'
import type { Exercise } from '@/types/domain'
import { services } from '@/services/container'

interface LibraryExercisePickerProps {
  value: Exercise | null
  onSelect: (exercise: Exercise) => void
}

export function LibraryExercisePicker({ value, onSelect }: LibraryExercisePickerProps) {
  const [open, setOpen] = useState(false)
  const exercisesQuery = useQuery({ queryKey: queryKeys.exercises, queryFn: () => services.exercises.list() })

  const exercises = useMemo(() => exercisesQuery.data ?? [], [exercisesQuery.data])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          {value ? value.name : 'Pick from library...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search exercises..." />
          <CommandList>
            <CommandEmpty>{exercisesQuery.isLoading ? 'Loading...' : 'No exercises found.'}</CommandEmpty>
            <CommandGroup>
              {exercises.map((exercise) => (
                <CommandItem
                  key={exercise.id}
                  value={`${exercise.name} ${exercise.muscleGroup}`}
                  onSelect={() => {
                    onSelect(exercise)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value?.id === exercise.id ? 'opacity-100' : 'opacity-0')} />
                  <div>
                    <p>{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{exercise.muscleGroup}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
