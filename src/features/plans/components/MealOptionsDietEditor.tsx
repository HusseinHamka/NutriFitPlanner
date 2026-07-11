import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MealItemsList } from '@/features/plans/components/MealItemsList'
import { createMealOption, defaultOptionName } from '@/lib/planSnapshot'
import { optionTotalCalories, slotOptionCalorieSummary } from '@/services/report/reportLayout'
import type { Food, MealSlot } from '@/types/domain'

interface MealOptionsDietEditorProps {
  mealSlots: MealSlot[]
  foodsById: Map<string, Food>
  onChange: (mealSlots: MealSlot[]) => void
}

export function MealOptionsDietEditor({ mealSlots, foodsById, onChange }: MealOptionsDietEditorProps) {
  const updateSlot = (slotIndex: number, next: MealSlot) => {
    const slots = [...mealSlots]
    slots[slotIndex] = next
    onChange(slots)
  }

  return (
    <div className="space-y-4">
      <p className="rounded-[var(--radius)] border border-border bg-soft-sage/30 px-3 py-2 text-sm text-muted-foreground">
        Client chooses one option per meal. Add alternative meal combinations below.
      </p>

      {mealSlots.map((slot, slotIndex) => (
        <Card key={slot.id} className="border-border bg-paper">
          <CardHeader className="pb-3">
            <CardTitle>{slot.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{slotOptionCalorieSummary(slot)}</p>
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
    </div>
  )
}
