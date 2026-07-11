import { createId } from '@/lib/helpers'
import type {
  DietPlanContent,
  Food,
  Meal,
  MealItem,
  PlanSnapshot,
  SupplementItem,
  WorkoutDay,
  WorkoutExercise,
  WorkoutPlanContent,
} from '@/types/domain'

export function scaleFoodMacros(
  food: Pick<Food, 'calories' | 'protein' | 'carbs' | 'fat' | 'unit'>,
  quantity: number | null,
): Pick<MealItem, 'calories' | 'protein' | 'carbs' | 'fat'> {
  const qty = quantity ?? 1
  const baseAmount = food.unit === 'g' ? 100 : 1
  const scale = qty / baseAmount

  return {
    calories: food.calories != null ? Math.round(food.calories * scale) : null,
    protein: food.protein != null ? Math.round(food.protein * scale) : null,
    carbs: food.carbs != null ? Math.round(food.carbs * scale) : null,
    fat: food.fat != null ? Math.round(food.fat * scale) : null,
  }
}

export function isMeaningfulMealItem(item: Pick<MealItem, 'foodName' | 'quantity' | 'calories'>): boolean {
  return Boolean(item.foodName.trim() || item.quantity != null || (item.calories != null && item.calories > 0))
}

export function createSupplementItem(sortOrder: number): SupplementItem {
  return { id: createId(), name: '', dose: '', timing: '', sortOrder }
}

export function createMealItem(sortOrder: number): MealItem {
  return {
    id: createId(),
    mode: 'custom',
    foodId: null,
    foodName: '',
    quantity: null,
    unit: 'g',
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    notes: '',
    sortOrder,
  }
}

export function createMeal(sortOrder: number, name = 'Breakfast'): Meal {
  return {
    id: createId(),
    name,
    mealType: 'breakfast',
    sortOrder,
    notes: '',
    items: [],
  }
}

export function createWorkoutExercise(sortOrder: number): WorkoutExercise {
  return {
    id: createId(),
    mode: 'custom',
    exerciseId: null,
    exerciseName: '',
    sets: null,
    reps: '',
    weight: '',
    rest: '',
    tempo: '',
    notes: '',
    sortOrder,
  }
}

export function createWorkoutDay(sortOrder: number, name?: string): WorkoutDay {
  return {
    id: createId(),
    name: name ?? `Day ${sortOrder + 1}`,
    muscleGroups: '',
    sortOrder,
    exercises: [],
  }
}

function parseLegacySupplements(value: string): SupplementItem[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      if (line.includes('|')) {
        const [name = '', dose = '', timing = ''] = line.split('|').map((part) => part.trim())
        return { id: createId(), name, dose, timing, sortOrder: index }
      }
      if (line.includes('\t')) {
        const [name = '', dose = '', timing = ''] = line.split('\t').map((part) => part.trim())
        return { id: createId(), name, dose, timing, sortOrder: index }
      }
      if (line.includes(' - ')) {
        const [name = '', dose = '', timing = ''] = line.split(' - ').map((part) => part.trim())
        return { id: createId(), name, dose, timing, sortOrder: index }
      }
      return { id: createId(), name: line, dose: '', timing: '', sortOrder: index }
    })
}

function normalizeSupplements(value: unknown): SupplementItem[] {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({
      id: typeof item?.id === 'string' ? item.id : createId(),
      name: typeof item?.name === 'string' ? item.name : '',
      dose: typeof item?.dose === 'string' ? item.dose : '',
      timing: typeof item?.timing === 'string' ? item.timing : '',
      sortOrder: typeof item?.sortOrder === 'number' ? item.sortOrder : index,
    }))
  }

  if (typeof value === 'string') {
    return parseLegacySupplements(value)
  }

  return []
}

function normalizeMealItem(item: Partial<MealItem>, index: number): MealItem {
  return {
    id: item.id ?? createId(),
    mode: item.mode === 'library' ? 'library' : 'custom',
    foodId: item.foodId ?? null,
    foodName: item.foodName ?? '',
    quantity: item.quantity ?? null,
    unit: item.unit ?? 'g',
    calories: item.calories ?? null,
    protein: item.protein ?? null,
    carbs: item.carbs ?? null,
    fat: item.fat ?? null,
    notes: item.notes ?? '',
    sortOrder: item.sortOrder ?? index,
  }
}

function normalizeWorkoutDayName(name: string | undefined, index: number): string {
  const expected = `Day ${index + 1}`
  if (!name?.trim()) return expected
  if (name.trim() === 'Day 1' && index > 0) return expected
  return name
}

function normalizeMeal(meal: Partial<Meal>, index: number): Meal {
  const items = Array.isArray(meal.items)
    ? meal.items.map(normalizeMealItem).filter(isMeaningfulMealItem)
    : []
  return {
    id: meal.id ?? createId(),
    name: meal.name ?? `Meal ${index + 1}`,
    mealType: meal.mealType ?? 'custom',
    sortOrder: meal.sortOrder ?? index,
    notes: meal.notes ?? '',
    items,
  }
}

function normalizeWorkoutExercise(exercise: Partial<WorkoutExercise>, index: number): WorkoutExercise {
  return {
    id: exercise.id ?? createId(),
    mode: exercise.mode === 'library' ? 'library' : 'custom',
    exerciseId: exercise.exerciseId ?? null,
    exerciseName: exercise.exerciseName ?? '',
    sets: exercise.sets ?? null,
    reps: exercise.reps ?? '',
    weight: exercise.weight ?? '',
    rest: exercise.rest ?? '',
    tempo: exercise.tempo ?? '',
    notes: exercise.notes ?? '',
    sortOrder: exercise.sortOrder ?? index,
  }
}

function normalizeWorkoutDay(day: Partial<WorkoutDay>, index: number): WorkoutDay {
  return {
    id: day.id ?? createId(),
    name: normalizeWorkoutDayName(day.name, index),
    muscleGroups: day.muscleGroups ?? '',
    sortOrder: day.sortOrder ?? index,
    exercises: Array.isArray(day.exercises) ? day.exercises.map(normalizeWorkoutExercise) : [],
  }
}

export function normalizeDietContent(diet: Partial<DietPlanContent> | null | undefined): DietPlanContent | null {
  if (!diet) return null

  return {
    goals: diet.goals ?? '',
    calorieTarget: diet.calorieTarget ?? null,
    proteinTarget: diet.proteinTarget ?? null,
    carbohydrateTarget: diet.carbohydrateTarget ?? null,
    fatTarget: diet.fatTarget ?? null,
    waterIntake: diet.waterIntake ?? '',
    preferredFoods: diet.preferredFoods ?? '',
    avoidedFoods: diet.avoidedFoods ?? '',
    supplements: normalizeSupplements(diet.supplements),
    recommendations: diet.recommendations ?? '',
    notes: diet.notes ?? '',
    meals: Array.isArray(diet.meals) ? diet.meals.map(normalizeMeal) : [],
  }
}

export function normalizeWorkoutContent(
  workout: Partial<WorkoutPlanContent> | null | undefined,
): WorkoutPlanContent | null {
  if (!workout) return null

  return {
    goals: workout.goals ?? '',
    warmup: workout.warmup ?? '',
    cooldown: workout.cooldown ?? '',
    cardio: workout.cardio ?? '',
    notes: workout.notes ?? '',
    days: Array.isArray(workout.days) ? workout.days.map(normalizeWorkoutDay) : [],
  }
}

export function normalizePlanSnapshot(snapshot: PlanSnapshot): PlanSnapshot {
  return {
    diet: normalizeDietContent(snapshot.diet),
    workout: normalizeWorkoutContent(snapshot.workout),
  }
}
