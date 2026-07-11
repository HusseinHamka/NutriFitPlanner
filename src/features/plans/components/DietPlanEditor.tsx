import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MealOptionsDietEditor } from '@/features/plans/components/MealOptionsDietEditor'
import { WeeklyDietEditor } from '@/features/plans/components/WeeklyDietEditor'
import { applyFoodToItem } from '@/features/plans/components/mealItemUtils'
import {
  createEmptyMealSlots,
  createEmptyWeeklyDays,
  createSupplementItem,
} from '@/lib/planSnapshot'
import { queryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'
import type { DietPlanContent, DietScheduleMode, Food, MealItem } from '@/types/domain'
import { services } from '@/services/container'

interface DietPlanEditorProps {
  diet: DietPlanContent
  onChange: (updates: Partial<DietPlanContent>) => void
}

function hydrateMealItems(items: MealItem[], foodsById: Map<string, Food>): { items: MealItem[]; changed: boolean } {
  let changed = false
  const nextItems = items.map((item) => {
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
  })
  return { items: nextItems, changed }
}

export function DietPlanEditor({ diet, onChange }: DietPlanEditorProps) {
  const foodsQuery = useQuery({ queryKey: queryKeys.foods, queryFn: () => services.foods.list() })
  const foodsById = useMemo(
    () => new Map<string, Food>((foodsQuery.data ?? []).map((food) => [food.id, food])),
    [foodsQuery.data],
  )
  const hydratedFoodMacros = useRef(false)
  const [pendingMode, setPendingMode] = useState<DietScheduleMode | null>(null)

  useEffect(() => {
    if (!foodsQuery.data?.length || hydratedFoodMacros.current) return

    let changed = false
    const weeklyDays = diet.weeklyDays.map((day) => {
      const meals = day.meals.map((meal) => {
        const result = hydrateMealItems(meal.items, foodsById)
        if (result.changed) changed = true
        return result.changed ? { ...meal, items: result.items } : meal
      })
      return meals.some((meal, index) => meal !== day.meals[index]) ? { ...day, meals } : day
    })

    const mealSlots = diet.mealSlots.map((slot) => {
      const options = slot.options.map((option) => {
        const result = hydrateMealItems(option.items, foodsById)
        if (result.changed) changed = true
        return result.changed ? { ...option, items: result.items } : option
      })
      return options.some((option, index) => option !== slot.options[index]) ? { ...slot, options } : slot
    })

    hydratedFoodMacros.current = true
    if (changed) onChange({ weeklyDays, mealSlots })
  }, [diet.mealSlots, diet.weeklyDays, foodsById, foodsQuery.data, onChange])

  useEffect(() => {
    hydratedFoodMacros.current = false
  }, [diet.goals, diet.scheduleMode])

  const confirmModeSwitch = () => {
    if (!pendingMode) return
    onChange({
      scheduleMode: pendingMode,
      weeklyDays: createEmptyWeeklyDays(),
      mealSlots: createEmptyMealSlots(),
      meals: [],
    })
    setPendingMode(null)
  }

  return (
    <div className="space-y-4">
      <Card className="border-border bg-paper">
        <CardHeader><CardTitle>Schedule Layout</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="inline-flex rounded-[var(--radius)] border border-border p-1">
            <Button
              type="button"
              variant={diet.scheduleMode === 'weekly' ? 'default' : 'ghost'}
              className={cn(diet.scheduleMode === 'weekly' && 'bg-deep-forest hover:bg-deep-forest/90')}
              onClick={() => {
                if (diet.scheduleMode !== 'weekly') setPendingMode('weekly')
              }}
            >
              Weekly schedule
            </Button>
            <Button
              type="button"
              variant={diet.scheduleMode === 'meal_options' ? 'default' : 'ghost'}
              className={cn(diet.scheduleMode === 'meal_options' && 'bg-deep-forest hover:bg-deep-forest/90')}
              onClick={() => {
                if (diet.scheduleMode !== 'meal_options') setPendingMode('meal_options')
              }}
            >
              Meal options
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {diet.scheduleMode === 'weekly'
              ? 'Plan meals day by day (Monday through Sunday).'
              : 'Define alternative meal combinations per slot — client picks one option per meal.'}
          </p>
        </CardContent>
      </Card>

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

      {diet.scheduleMode === 'weekly' ? (
        <WeeklyDietEditor
          weeklyDays={diet.weeklyDays}
          foodsById={foodsById}
          onChange={(weeklyDays) => onChange({ weeklyDays })}
        />
      ) : (
        <MealOptionsDietEditor
          mealSlots={diet.mealSlots}
          foodsById={foodsById}
          onChange={(mealSlots) => onChange({ mealSlots })}
        />
      )}

      <Card className="border-border bg-paper">
        <CardHeader><CardTitle>Recommendations & Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Recommendations" value={diet.recommendations} onChange={(e) => onChange({ recommendations: e.target.value })} />
          <Textarea placeholder="Diet notes" value={diet.notes} onChange={(e) => onChange({ notes: e.target.value })} />
        </CardContent>
      </Card>

      <AlertDialog open={pendingMode !== null} onOpenChange={(open) => !open && setPendingMode(null)}>
        <AlertDialogContent className="bg-paper">
          <AlertDialogHeader>
            <AlertDialogTitle>Change schedule layout?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching layout will clear the current meal schedule. Nutrition goals, supplements, and notes will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-deep-forest hover:bg-deep-forest/90" onClick={confirmModeSwitch}>
              Switch layout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
