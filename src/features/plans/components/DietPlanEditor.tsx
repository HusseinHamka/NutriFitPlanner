import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LibraryFoodPicker } from '@/features/plans/components/LibraryFoodPicker'
import {
  createMeal,
  createMealItem,
  createSupplementItem,
  scaleFoodMacros,
} from '@/lib/planSnapshot'
import { queryKeys } from '@/lib/queryKeys'
import { mealTotalCalories } from '@/services/report/reportLayout'
import type { DietPlanContent, Food, MealItem } from '@/types/domain'
import { services } from '@/services/container'

interface DietPlanEditorProps {
  diet: DietPlanContent
  onChange: (updates: Partial<DietPlanContent>) => void
}

function applyFoodToItem(item: MealItem, food: Pick<Food, 'calories' | 'protein' | 'carbs' | 'fat' | 'unit'> & { id?: string; name?: string }, quantity: number | null): MealItem {
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

export function DietPlanEditor({ diet, onChange }: DietPlanEditorProps) {
  const foodsQuery = useQuery({ queryKey: queryKeys.foods, queryFn: () => services.foods.list() })
  const foodsById = useMemo(() => new Map((foodsQuery.data ?? []).map((food) => [food.id, food])), [foodsQuery.data])
  const hydratedFoodMacros = useRef(false)

  useEffect(() => {
    if (!foodsQuery.data?.length || hydratedFoodMacros.current) return

    let changed = false
    const meals = diet.meals.map((meal) => ({
      ...meal,
      items: meal.items.map((item) => {
        if (item.mode !== 'library' || !item.foodId) return item
        const food = foodsById.get(item.foodId)
        if (!food) return item
        const next = applyFoodToItem(item, food, item.quantity)
        if (
          next.calories !== item.calories
          || next.protein !== item.protein
          || next.carbs !== item.carbs
          || next.fat !== item.fat
          || next.foodName !== item.foodName
        ) {
          changed = true
          return next
        }
        return item
      }),
    }))

    hydratedFoodMacros.current = true
    if (changed) onChange({ meals })
  }, [diet.meals, foodsById, foodsQuery.data, onChange])

  useEffect(() => {
    hydratedFoodMacros.current = false
  }, [diet.goals, diet.meals.length])

  const resolveFood = (item: MealItem): Pick<Food, 'calories' | 'protein' | 'carbs' | 'fat' | 'unit'> | null => {
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

  return (
    <div className="space-y-4">
      <Card className="border-border bg-paper">
        <CardHeader><CardTitle>Nutrition Goals</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Goals (e.g. Muscle Gain)" value={diet.goals} onChange={(e) => onChange({ goals: e.target.value })} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="calorie-target">Daily calories</Label>
              <Input id="calorie-target" type="number" value={diet.calorieTarget ?? ''} onChange={(e) => onChange({ calorieTarget: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="water-intake">Water intake</Label>
              <Input id="water-intake" placeholder="e.g. 4000 ml/day" value={diet.waterIntake} onChange={(e) => onChange({ waterIntake: e.target.value })} />
              <p className="text-xs text-muted-foreground">Shown on report cover page</p>
              {!diet.waterIntake.trim() ? (
                <p className="text-xs text-amber-700">Leave blank and the report will show a dash for water intake.</p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="protein-target">Protein (g)</Label>
              <Input id="protein-target" type="number" value={diet.proteinTarget ?? ''} onChange={(e) => onChange({ proteinTarget: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs-target">Carbs (g)</Label>
              <Input id="carbs-target" type="number" value={diet.carbohydrateTarget ?? ''} onChange={(e) => onChange({ carbohydrateTarget: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat-target">Fat (g)</Label>
              <Input id="fat-target" type="number" value={diet.fatTarget ?? ''} onChange={(e) => onChange({ fatTarget: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>
          <Textarea placeholder="Preferred foods" value={diet.preferredFoods} onChange={(e) => onChange({ preferredFoods: e.target.value })} />
          <Textarea placeholder="Avoided foods" value={diet.avoidedFoods} onChange={(e) => onChange({ avoidedFoods: e.target.value })} />
        </CardContent>
      </Card>

      <Card className="border-border bg-paper">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Supplements</CardTitle>
          <Button variant="outline" onClick={() => onChange({ supplements: [...diet.supplements, createSupplementItem(diet.supplements.length)] })}>
            Add Supplement
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {diet.supplements.map((supplement, supplementIndex) => (
            <div key={supplement.id} className="flex gap-2">
              <div className="grid flex-1 gap-2 md:grid-cols-3">
                <Input placeholder="Name" value={supplement.name} onChange={(e) => {
                  const supplements = [...diet.supplements]
                  supplements[supplementIndex] = { ...supplement, name: e.target.value }
                  onChange({ supplements })
                }} />
                <Input placeholder="Dose" value={supplement.dose} onChange={(e) => {
                  const supplements = [...diet.supplements]
                  supplements[supplementIndex] = { ...supplement, dose: e.target.value }
                  onChange({ supplements })
                }} />
                <Input placeholder="Timing" value={supplement.timing} onChange={(e) => {
                  const supplements = [...diet.supplements]
                  supplements[supplementIndex] = { ...supplement, timing: e.target.value }
                  onChange({ supplements })
                }} />
              </div>
              <Button variant="ghost" size="icon" aria-label="Remove supplement" onClick={() => onChange({ supplements: diet.supplements.filter((s) => s.id !== supplement.id) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {diet.meals.map((meal, mealIndex) => (
        <Card key={meal.id} className="border-border bg-paper">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <Input value={meal.name} onChange={(e) => {
              const meals = [...diet.meals]
              meals[mealIndex] = { ...meal, name: e.target.value }
              onChange({ meals })
            }} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                const items = [...meal.items, createMealItem(meal.items.length)]
                const meals = [...diet.meals]
                meals[mealIndex] = { ...meal, items }
                onChange({ meals })
              }}>Add Item</Button>
              <Button variant="ghost" size="icon" aria-label="Remove meal" onClick={() => onChange({ meals: diet.meals.filter((m) => m.id !== meal.id) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {meal.items.map((item, itemIndex) => (
              <div key={item.id} className="flex gap-2">
                <div className="grid flex-1 gap-2 md:grid-cols-6">
                  {item.mode === 'library' ? (
                    <LibraryFoodPicker
                      value={item.foodId ? foodsById.get(item.foodId) ?? { id: item.foodId, name: item.foodName } as Food : null}
                      onSelect={(food) => {
                        const items = [...meal.items]
                        items[itemIndex] = applyFoodToItem(item, food, item.quantity)
                        const meals = [...diet.meals]
                        meals[mealIndex] = { ...meal, items }
                        onChange({ meals })
                      }}
                    />
                  ) : (
                    <Input placeholder="Food" value={item.foodName} onChange={(e) => {
                      const items = [...meal.items]
                      items[itemIndex] = { ...item, foodName: e.target.value, mode: 'custom', foodId: null }
                      const meals = [...diet.meals]
                      meals[mealIndex] = { ...meal, items }
                      onChange({ meals })
                    }} />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const items = [...meal.items]
                      items[itemIndex] = item.mode === 'library'
                        ? { ...item, mode: 'custom', foodId: null }
                        : { ...item, mode: 'library' }
                      const meals = [...diet.meals]
                      meals[mealIndex] = { ...meal, items }
                      onChange({ meals })
                    }}
                  >
                    {item.mode === 'library' ? 'Custom' : 'Library'}
                  </Button>
                  <Input placeholder="Qty" type="number" value={item.quantity ?? ''} onChange={(e) => {
                    const quantity = e.target.value ? Number(e.target.value) : null
                    const items = [...meal.items]
                    const food = item.mode === 'library' ? resolveFood(item) : null
                    items[itemIndex] = food
                      ? applyFoodToItem(item, food, quantity)
                      : { ...item, quantity }
                    const meals = [...diet.meals]
                    meals[mealIndex] = { ...meal, items }
                    onChange({ meals })
                  }} />
                  <Input placeholder="Unit" value={item.unit} onChange={(e) => {
                    const items = [...meal.items]
                    items[itemIndex] = { ...item, unit: e.target.value }
                    const meals = [...diet.meals]
                    meals[mealIndex] = { ...meal, items }
                    onChange({ meals })
                  }} />
                  <Input placeholder="Kcal" type="number" value={item.calories ?? ''} onChange={(e) => {
                    const items = [...meal.items]
                    items[itemIndex] = { ...item, calories: e.target.value ? Number(e.target.value) : null }
                    const meals = [...diet.meals]
                    meals[mealIndex] = { ...meal, items }
                    onChange({ meals })
                  }} />
                </div>
                <Button variant="ghost" size="icon" aria-label="Remove item" onClick={() => {
                  const meals = [...diet.meals]
                  meals[mealIndex] = { ...meal, items: meal.items.filter((i) => i.id !== item.id) }
                  onChange({ meals })
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">Meal total: {mealTotalCalories(meal)} kcal</p>
            <Textarea placeholder="Meal notes" value={meal.notes} onChange={(e) => {
              const meals = [...diet.meals]
              meals[mealIndex] = { ...meal, notes: e.target.value }
              onChange({ meals })
            }} />
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={() => onChange({ meals: [...diet.meals, createMeal(diet.meals.length)] })}>Add Meal</Button>

      <Card className="border-border bg-paper">
        <CardHeader><CardTitle>Recommendations & Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Recommendations" value={diet.recommendations} onChange={(e) => onChange({ recommendations: e.target.value })} />
          <Textarea placeholder="Diet notes" value={diet.notes} onChange={(e) => onChange({ notes: e.target.value })} />
        </CardContent>
      </Card>
    </div>
  )
}
