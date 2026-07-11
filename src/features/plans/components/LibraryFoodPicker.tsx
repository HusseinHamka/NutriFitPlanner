import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'
import type { Food } from '@/types/domain'
import { services } from '@/services/container'

interface LibraryFoodPickerProps {
  value: Food | null
  onSelect: (food: Food) => void
}

export function LibraryFoodPicker({ value, onSelect }: LibraryFoodPickerProps) {
  const [open, setOpen] = useState(false)
  const foodsQuery = useQuery({ queryKey: queryKeys.foods, queryFn: () => services.foods.list() })

  const foods = useMemo(() => foodsQuery.data ?? [], [foodsQuery.data])

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
          <CommandInput placeholder="Search foods..." />
          <CommandList>
            <CommandEmpty>{foodsQuery.isLoading ? 'Loading...' : 'No foods found.'}</CommandEmpty>
            <CommandGroup>
              {foods.map((food) => (
                <CommandItem
                  key={food.id}
                  value={`${food.name} ${food.category}`}
                  onSelect={() => {
                    onSelect(food)
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value?.id === food.id ? 'opacity-100' : 'opacity-0')} />
                  <div>
                    <p>{food.name}</p>
                    <p className="text-xs text-muted-foreground">{food.category}{food.calories != null ? ` · ${food.calories} kcal` : ''}</p>
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
