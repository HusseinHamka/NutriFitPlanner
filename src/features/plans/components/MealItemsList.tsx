import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LibraryFoodPicker } from '@/features/plans/components/LibraryFoodPicker'
import { applyFoodToItem, resolveFoodFromItem } from '@/features/plans/components/mealItemUtils'
import { createMealItem } from '@/lib/planSnapshot'
import type { Food, MealItem } from '@/types/domain'

interface MealItemsListProps {
  items: MealItem[]
  foodsById: Map<string, Food>
  onChange: (items: MealItem[]) => void
}

export function MealItemsList({ items, foodsById, onChange }: MealItemsListProps) {
  const updateItem = (index: number, next: MealItem) => {
    const nextItems = [...items]
    nextItems[index] = next
    onChange(nextItems)
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {items.map((item, itemIndex) => (
        <div key={item.id} className="flex gap-2">
          <div className="grid flex-1 gap-2 md:grid-cols-7">
            {item.mode === 'library' ? (
              <LibraryFoodPicker
                value={item.foodId ? foodsById.get(item.foodId) ?? { id: item.foodId, name: item.foodName } as Food : null}
                onSelect={(food) => updateItem(itemIndex, applyFoodToItem(item, food, item.quantity))}
              />
            ) : (
              <Input
                placeholder="Food"
                value={item.foodName}
                onChange={(e) => updateItem(itemIndex, { ...item, foodName: e.target.value, mode: 'custom', foodId: null })}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateItem(
                itemIndex,
                item.mode === 'library'
                  ? { ...item, mode: 'custom', foodId: null }
                  : { ...item, mode: 'library' },
              )}
            >
              {item.mode === 'library' ? 'Custom' : 'Library'}
            </Button>
            <Input
              placeholder="Qty"
              type="number"
              value={item.quantity ?? ''}
              onChange={(e) => {
                const quantity = e.target.value ? Number(e.target.value) : null
                const food = item.mode === 'library' ? resolveFoodFromItem(item, foodsById) : null
                updateItem(itemIndex, food ? applyFoodToItem(item, food, quantity) : { ...item, quantity })
              }}
            />
            <Input
              placeholder="Unit"
              value={item.unit}
              onChange={(e) => updateItem(itemIndex, { ...item, unit: e.target.value })}
            />
            <Input
              placeholder="Kcal"
              type="number"
              value={item.calories ?? ''}
              onChange={(e) => updateItem(itemIndex, { ...item, calories: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              placeholder="Comment"
              value={item.notes}
              onChange={(e) => updateItem(itemIndex, { ...item, notes: e.target.value })}
            />
          </div>
          <Button variant="ghost" size="icon" aria-label="Remove item" onClick={() => removeItem(itemIndex)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...items, createMealItem(items.length)])}>
        Add Item
      </Button>
    </div>
  )
}
