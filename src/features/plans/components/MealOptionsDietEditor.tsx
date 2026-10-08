import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MealItemsList } from '@/features/plans/components/MealItemsList'
import { createCustomMealSlot, createMealOption, defaultOptionName } from '@/lib/planSnapshot'
import { optionTotalCalories, slotOptionCalorieSummary } from '@/services/report/reportLayout'
import type { Food, MealSlot } from '@/types/domain'

interface MealOptionsDietEditorProps {
  mealSlots: MealSlot[]
  foodsById: Map<string, Food>
  onChange: (mealSlots: MealSlot[]) => void
}

function reindexSlots(slots: MealSlot[]): MealSlot[] {
  return slots.map((slot, index) => ({ ...slot, sortOrder: index }))
}

export function MealOptionsDietEditor({ mealSlots, foodsById, onChange }: MealOptionsDietEditorProps) {
  const updateSlots = (slots: MealSlot[]) => {
    onChange(reindexSlots(slots))
  }

  const updateSlot = (slotIndex: number, next: MealSlot) => {
    const slots = [...mealSlots]
    slots[slotIndex] = next
    updateSlots(slots)
  }

  const addMeal = () => {
    updateSlots([...mealSlots, createCustomMealSlot(mealSlots)])
  }

  const removeMeal = (slotIndex: number) => {
    if (mealSlots.length <= 1) return
    updateSlots(mealSlots.filter((_, index) => index !== slotIndex))
  }

  return (
    <div className="space-y-4">
      <p className="rounded-[var(--radius)] border border-border bg-soft-sage/30 px-3 py-2 text-sm text-muted-foreground">
        Client chooses one option per meal. Rename meals, add custom meals, and create alternative combinations below.
      </p>

      {mealSlots.map((slot, slotIndex) => (
        <Card key={slot.id} className="border-border bg-paper">
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
            <div className="min-w-0 flex-1 space-y-1">
              <Input
                value={slot.name}
                aria-label="Meal name"
                className="h-8 max-w-xs font-heading text-base font-semibold"
                onChange={(e) => updateSlot(slotIndex, { ...slot, name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{slotOptionCalorieSummary(slot)}</p>
            </div>
            {mealSlots.length > 1 ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${slot.name}`}
                onClick={() => removeMeal(slotIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {slot.options.map((option, optionIndex) => (
              <div key={option.id} className="rounded-[var(--radius)] border border-border p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <Input
                    value={option.name}
                    className="max-w-xs"
                    onChange={(e) => {
                      const options = [...slot.options]
                      options[optionIndex] = { ...option, name: e.target.value }
                      updateSlot(slotIndex, { ...slot, options })
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove option"
                    disabled={slot.options.length <= 1}
                    onClick={() => updateSlot(slotIndex, { ...slot, options: slot.options.filter((o) => o.id !== option.id) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <MealItemsList
                  items={option.items}
                  foodsById={foodsById}
                  onChange={(items) => {
                    const options = [...slot.options]
                    options[optionIndex] = { ...option, items }
                    updateSlot(slotIndex, { ...slot, options })
                  }}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Option total: {optionTotalCalories(option)} kcal
                </p>
                <Textarea
                  placeholder="Option notes"
                  className="mt-2"
                  value={option.notes}
                  onChange={(e) => {
                    const options = [...slot.options]
                    options[optionIndex] = { ...option, notes: e.target.value }
                    updateSlot(slotIndex, { ...slot, options })
                  }}
                />
              </div>
            ))}

            <Button
              variant="outline"
              onClick={() => {
                const options = [...slot.options, createMealOption(defaultOptionName(slot.options.length), slot.options.length)]
                updateSlot(slotIndex, { ...slot, options })
              }}
            >
              Add Option
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" className="w-full" onClick={addMeal}>
        <Plus className="mr-2 h-4 w-4" />
        Add meal
      </Button>
    </div>
  )
}
