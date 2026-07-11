import { scaleFoodMacros } from '@/lib/planSnapshot'
import type { Food, MealItem } from '@/types/domain'

export function applyFoodToItem(
  item: MealItem,
  food: Pick<Food, 'calories' | 'protein' | 'carbs' | 'fat' | 'unit'> & { id?: string; name?: string },
  quantity: number | null,
): MealItem {
  const macros = scaleFoodMacros(food, quantity)
  return {
    ...item,
    mode: food.id ? 'library' : item.mode,
    foodId: food.id ?? item.foodId,
    foodName: food.name ?? item.foodName,
    unit: food.unit || item.unit,
    ...macros,
  }
}

export function resolveFoodFromItem(
  item: MealItem,
  foodsById: Map<string, Food>,
): Pick<Food, 'calories' | 'protein' | 'carbs' | 'fat' | 'unit'> | null {
  if (item.foodId) {
    const food = foodsById.get(item.foodId)
    if (food) return food
  }
  if (!item.foodName) return null
  return {
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    unit: item.unit,
  }
}
