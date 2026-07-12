import { useState } from 'react'
import { ChevronDown, Copy, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MealItemsList } from '@/features/plans/components/MealItemsList'
import { createMeal, createWeeklyDietDay } from '@/lib/planSnapshot'
import { dayTotalCalories, mealTotalCalories } from '@/services/report/reportLayout'
import type { DietDay, Food, MealType } from '@/types/domain'
import { cn } from '@/lib/utils'

const MEAL_TYPE_OPTIONS: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Breakfast' },
  { type: 'lunch', label: 'Lunch' },
  { type: 'dinner', label: 'Dinner' },
  { type: 'snack', label: 'Snack' },
  { type: 'custom', label: 'Custom' },
]

interface WeeklyDietEditorProps {
  weeklyDays: DietDay[]
  foodsById: Map<string, Food>
  onChange: (weeklyDays: DietDay[]) => void
}

function reindexDays(days: DietDay[]): DietDay[] {
  return days.map((day, index) => ({ ...day, sortOrder: index }))
}

export function WeeklyDietEditor({ weeklyDays, foodsById, onChange }: WeeklyDietEditorProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set(weeklyDays.map((d) => d.id)))

  const updateDays = (days: DietDay[]) => {
    onChange(reindexDays(days))
  }

  const updateDay = (dayIndex: number, next: DietDay) => {
    const days = [...weeklyDays]
    days[dayIndex] = next
    updateDays(days)
  }

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dayId)) next.delete(dayId)
      else next.add(dayId)
      return next
    })
  }

  const copyDayTo = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return
    const source = weeklyDays[sourceIndex]
    const target = weeklyDays[targetIndex]
    const copiedMeals = source.meals.map((meal, index) => ({
      ...meal,
      id: crypto.randomUUID(),
      sortOrder: index,
      items: meal.items.map((item, itemIndex) => ({
        ...item,
        id: crypto.randomUUID(),
        sortOrder: itemIndex,
      })),
    }))
    updateDay(targetIndex, { ...target, meals: copiedMeals })
  }

  const addDay = () => {
    const nextDay = createWeeklyDietDay(weeklyDays)
    updateDays([...weeklyDays, nextDay])
    setExpandedDays((prev) => new Set(prev).add(nextDay.id))
  }

  const removeDay = (dayIndex: number) => {
    if (weeklyDays.length <= 1) return
    const dayId = weeklyDays[dayIndex].id
    updateDays(weeklyDays.filter((_, index) => index !== dayIndex))
    setExpandedDays((prev) => {
      const next = new Set(prev)
      next.delete(dayId)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {weeklyDays.map((day, dayIndex) => {
        const isExpanded = expandedDays.has(day.id)
        const hasMeals = day.meals.length > 0
        const dayTotal = dayTotalCalories(day)

        return (
          <Card key={day.id} className="border-border bg-paper">
            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  type="button"
                  className="shrink-0"
                  aria-label={isExpanded ? 'Collapse day' : 'Expand day'}
                  onClick={() => toggleDay(day.id)}
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform', !isExpanded && '-rotate-90')} />
                </button>
                <div className="min-w-0 flex-1 space-y-1">
                  <Input
                    value={day.name}
                    aria-label="Day name"
                    className="h-8 max-w-xs font-heading text-base font-semibold"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateDay(dayIndex, { ...day, name: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {hasMeals ? `${day.meals.length} meal${day.meals.length === 1 ? '' : 's'} · ${dayTotal} kcal` : 'No meals yet'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Copy className="mr-1 h-3 w-3" />
                      Copy to
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {weeklyDays.map((target, targetIndex) =>
                      targetIndex !== dayIndex ? (
                        <DropdownMenuItem key={target.id} onClick={() => copyDayTo(dayIndex, targetIndex)}>
                          {target.name}
                        </DropdownMenuItem>
                      ) : null,
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {weeklyDays.length > 1 ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${day.name}`}
                    onClick={() => removeDay(dayIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </CardHeader>

            {isExpanded ? (
              <CardContent className="space-y-4 pt-0">
                {day.meals.map((meal, mealIndex) => (
                  <div key={meal.id} className="rounded-[var(--radius)] border border-border p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <Input
                        value={meal.name}
                        className="max-w-xs"
                        onChange={(e) => {
                          const meals = [...day.meals]
                          meals[mealIndex] = { ...meal, name: e.target.value }
                          updateDay(dayIndex, { ...day, meals })
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove meal"
                        onClick={() => updateDay(dayIndex, { ...day, meals: day.meals.filter((m) => m.id !== meal.id) })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <MealItemsList
                      items={meal.items}
                      foodsById={foodsById}
                      onChange={(items) => {
                        const meals = [...day.meals]
                        meals[mealIndex] = { ...meal, items }
                        updateDay(dayIndex, { ...day, meals })
                      }}
                    />
                    <p className="mt-2 text-sm text-muted-foreground">Meal total: {mealTotalCalories(meal)} kcal</p>
                    <Textarea
                      placeholder="Meal notes"
                      className="mt-2"
                      value={meal.notes}
                      onChange={(e) => {
                        const meals = [...day.meals]
                        meals[mealIndex] = { ...meal, notes: e.target.value }
                        updateDay(dayIndex, { ...day, meals })
                      }}
                    />
                  </div>
                ))}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Add Meal</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {MEAL_TYPE_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.type}
                        onClick={() => {
                          const meals = [...day.meals, createMeal(day.meals.length, option.label, option.type)]
                          updateDay(dayIndex, { ...day, meals })
                        }}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            ) : null}
          </Card>
        )
      })}

      <Button type="button" variant="outline" className="w-full" onClick={addDay}>
        <Plus className="mr-2 h-4 w-4" />
        Add day
      </Button>
    </div>
  )
}
