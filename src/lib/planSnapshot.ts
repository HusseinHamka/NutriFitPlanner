import { createId } from '@/lib/helpers'
import type {
  DietDay,
  DietPlanContent,
  DietScheduleMode,
  Food,
  Meal,
  MealItem,
  MealOption,
  MealSlot,
  MealType,
  PlanSnapshot,
  SupplementItem,
  WorkoutDay,
  WorkoutExercise,
  WorkoutPlanContent,
} from '@/types/domain'

export const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export const MEAL_SLOT_DEFS: { mealType: MealType; name: string }[] = [
  { mealType: 'breakfast', name: 'Breakfast' },
  { mealType: 'lunch', name: 'Lunch' },
  { mealType: 'dinner', name: 'Dinner' },
  { mealType: 'snack', name: 'Snack' },
]

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

export function inferMealTypeFromName(name: string): MealType {
  const lower = name.toLowerCase()
  if (lower.includes('breakfast')) return 'breakfast'
  if (lower.includes('lunch') || lower.includes('launch')) return 'lunch'
  if (lower.includes('dinner')) return 'dinner'
  if (lower.includes('snack')) return 'snack'
  return 'custom'
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

export function createMeal(sortOrder: number, name = 'Breakfast', mealType: MealType = 'breakfast'): Meal {
  return {
    id: createId(),
    name,
    mealType,
    sortOrder,
    notes: '',
    items: [],
  }
}

export function createMealOption(name: string, sortOrder: number): MealOption {
  return {
    id: createId(),
    name,
    sortOrder,
    notes: '',
    items: [],
  }
}

export function createMealSlot(mealType: MealType, name: string, sortOrder: number): MealSlot {
  return {
    id: createId(),
    mealType,
    name,
    sortOrder,
    options: [createMealOption('Option A', 0)],
  }
}

export function createDietDay(
  sortOrder: number,
  name?: string,
  dayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6,
): DietDay {
  const weekday = dayOfWeek != null && dayOfWeek >= 0 && dayOfWeek <= 6 ? dayOfWeek : undefined
  const defaultName =
    name?.trim()
    || (weekday != null ? WEEKDAY_NAMES[weekday] : `Day ${sortOrder + 1}`)

  return {
    id: createId(),
    name: defaultName,
    ...(weekday != null ? { dayOfWeek: weekday } : {}),
    sortOrder,
    meals: [],
  }
}

export function createEmptyWeeklyDays(): DietDay[] {
  return WEEKDAY_NAMES.map((name, index) =>
    createDietDay(index, name, index as 0 | 1 | 2 | 3 | 4 | 5 | 6),
  )
}

export function createWeeklyDietDay(existingDays: DietDay[]): DietDay {
  return createDietDay(existingDays.length, `Day ${existingDays.length + 1}`)
}

export function createEmptyMealSlots(): MealSlot[] {
  return MEAL_SLOT_DEFS.map((def, index) => createMealSlot(def.mealType, def.name, index))
}

export function defaultOptionName(sortOrder: number): string {
  return `Option ${String.fromCharCode(65 + sortOrder)}`
}

export function migrateLegacyMealsToMealOptions(meals: Meal[]): MealSlot[] {
  const grouped = new Map<MealType, Meal[]>()

  for (const meal of meals) {
    const type =
      meal.mealType !== 'custom' && meal.mealType !== 'post_workout'
        ? meal.mealType
        : inferMealTypeFromName(meal.name)
    const list = grouped.get(type) ?? []
    list.push(meal)
    grouped.set(type, list)
  }

  return MEAL_SLOT_DEFS.map((def, index) => {
    const legacyMeals = grouped.get(def.mealType) ?? []
    const options =
      legacyMeals.length > 0
        ? legacyMeals.map((meal, optionIndex) => ({
            id: meal.id ?? createId(),
            name: meal.name || defaultOptionName(optionIndex),
            sortOrder: optionIndex,
            notes: meal.notes ?? '',
            items: meal.items,
          }))
        : [createMealOption('Option A', 0)]

    return {
      id: createId(),
      mealType: def.mealType,
      name: def.name,
      sortOrder: index,
      options,
    }
  })
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

function normalizeMealOption(option: Partial<MealOption>, index: number): MealOption {
  const items = Array.isArray(option.items)
    ? option.items.map(normalizeMealItem).filter(isMeaningfulMealItem)
    : []
  return {
    id: option.id ?? createId(),
    name: option.name ?? defaultOptionName(index),
    sortOrder: option.sortOrder ?? index,
    notes: option.notes ?? '',
    items,
  }
}

function normalizeMealSlot(slot: Partial<MealSlot>, index: number): MealSlot {
  const def = MEAL_SLOT_DEFS[index] ?? MEAL_SLOT_DEFS[0]
  const options = Array.isArray(slot.options) && slot.options.length > 0
    ? slot.options.map(normalizeMealOption)
    : [createMealOption('Option A', 0)]

  return {
    id: slot.id ?? createId(),
    mealType: slot.mealType ?? def.mealType,
    name: slot.name ?? def.name,
    sortOrder: slot.sortOrder ?? index,
    options,
  }
}

function normalizeDietDay(day: Partial<DietDay>, index: number): DietDay {
  const sortOrder = typeof day.sortOrder === 'number' ? day.sortOrder : index
  const hasWeekday =
    typeof day.dayOfWeek === 'number' && day.dayOfWeek >= 0 && day.dayOfWeek <= 6
  const weekday = hasWeekday ? (day.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6) : undefined
  const name =
    typeof day.name === 'string' && day.name.trim()
      ? day.name.trim()
      : weekday != null
        ? WEEKDAY_NAMES[weekday]
        : `Day ${sortOrder + 1}`

  return {
    id: day.id ?? createId(),
    name,
    ...(weekday != null ? { dayOfWeek: weekday } : {}),
    sortOrder,
    meals: Array.isArray(day.meals) ? day.meals.map(normalizeMeal) : [],
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

  const base = {
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
  }

  const legacyMeals = Array.isArray(diet.meals) ? diet.meals.map(normalizeMeal) : []
  const hasLegacyMeals = legacyMeals.length > 0
  const explicitMode = diet.scheduleMode === 'weekly' || diet.scheduleMode === 'meal_options'
    ? diet.scheduleMode
    : null

  let scheduleMode: DietScheduleMode
  let weeklyDays: DietDay[]
  let mealSlots: MealSlot[]

  if (hasLegacyMeals && !explicitMode) {
    scheduleMode = 'meal_options'
    mealSlots = migrateLegacyMealsToMealOptions(legacyMeals)
    weeklyDays = createEmptyWeeklyDays()
  } else if (explicitMode === 'weekly') {
    scheduleMode = 'weekly'
    weeklyDays =
      Array.isArray(diet.weeklyDays) && diet.weeklyDays.length > 0
        ? diet.weeklyDays
            .map(normalizeDietDay)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        : createEmptyWeeklyDays()
    mealSlots = createEmptyMealSlots()
  } else {
    scheduleMode = 'meal_options'
    mealSlots =
      Array.isArray(diet.mealSlots) && diet.mealSlots.length > 0
        ? diet.mealSlots.map(normalizeMealSlot)
        : createEmptyMealSlots()
    weeklyDays = createEmptyWeeklyDays()
  }

  return {
    ...base,
    scheduleMode,
    weeklyDays,
    mealSlots,
    meals: [],
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
