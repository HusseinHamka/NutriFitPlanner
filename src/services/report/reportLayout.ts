import { calculateAge, formatGender, formatLongDate, fullName } from '@/lib/helpers'
import { isMeaningfulMealItem } from '@/lib/planSnapshot'
import type {
  BusinessSettings,
  DietDay,
  DietPlanContent,
  Meal,
  MealOption,
  MealSlot,
  PlanType,
  ReportModel,
  WorkoutPlanContent,
} from '@/types/domain'

export const REPORT_COLORS = {
  cream: '#F5F0E8',
  paper: '#FBF8F3',
  softSage: '#DCE5D4',
  sageLight: '#E8EFE4',
  sageAccent: '#A8C0A0',
  deepForest: '#2D5A3D',
  ink: '#2A2F2A',
  muted: '#6B7268',
  border: '#D8D2C8',
} as const

export function planBadgeLabel(type: PlanType): string {
  if (type === 'diet') return 'NUTRITION PLAN'
  if (type === 'workout') return 'TRAINING PLAN'
  return 'NUTRITION & TRAINING PLAN'
}

export function mealTotalCalories(meal: Meal): number {
  return meal.items.reduce((sum, item) => sum + (item.calories ?? 0), 0)
}

export function optionTotalCalories(option: MealOption): number {
  return option.items.reduce((sum, item) => sum + (item.calories ?? 0), 0)
}

export function dayTotalCalories(day: DietDay): number {
  return day.meals.reduce((sum, meal) => sum + mealTotalCalories(meal), 0)
}

export function slotOptionCalorieSummary(slot: MealSlot): string {
  const totals = slot.options.map((option) => optionTotalCalories(option)).filter((total) => total > 0)
  if (!totals.length) return 'No calories entered yet'
  if (totals.length === 1) return `${totals[0]} kcal per option`
  const min = Math.min(...totals)
  const max = Math.max(...totals)
  return min === max ? `${min} kcal per option` : `${min}–${max} kcal across options`
}

export function trainerNotes(model: ReportModel): string {
  const dietNotes = model.revision.snapshot.diet?.notes?.trim() ?? ''
  const workoutNotes = model.revision.snapshot.workout?.notes?.trim() ?? ''
  return [workoutNotes, dietNotes].filter(Boolean).join('\n\n')
}

export function clientSummary(model: ReportModel) {
  return {
    name: fullName(model.client.firstName, model.client.lastName),
    age: calculateAge(model.client.dateOfBirth),
    sex: formatGender(model.client.gender),
    height: model.measurement?.height != null ? `${model.measurement.height} cm` : '—',
    weight: model.measurement?.weight != null ? `${model.measurement.weight} kg` : '—',
    preparedOn: formatLongDate(model.generatedAt),
  }
}

export function practitionerSubtitle(business: BusinessSettings): string {
  const parts = [business.title, business.businessName].filter(Boolean)
  const unique = [...new Set(parts.filter((part) => part !== business.professionalName))]
  return unique.join(' · ').toUpperCase()
}

export function formatWaterIntake(value: string): string {
  if (!value.trim()) return '—'
  const normalized = value.trim()
  if (/ml|l|liter|litre|cup|glass/i.test(normalized)) return normalized
  return `${normalized} ml/day`
}

function mealHasContent(meal: Meal): boolean {
  return meal.items.some(isMeaningfulMealItem) || meal.notes.trim().length > 0
}

export function mealHasReportContent(meal: Meal): boolean {
  return mealHasContent(meal)
}

export function optionHasReportContent(option: MealOption): boolean {
  return optionHasContent(option)
}

function optionHasContent(option: MealOption): boolean {
  return option.items.some(isMeaningfulMealItem) || option.notes.trim().length > 0
}

/** Nutrition goals block: goals text or any target metric. */
export function hasNutritionGoals(diet: DietPlanContent): boolean {
  return diet.goals.trim().length > 0 || diet.calorieTarget != null || diet.waterIntake.trim().length > 0
}

/** Meal schedule block: at least one meal/option carries real data. */
export function hasMealSchedule(diet: DietPlanContent): boolean {
  if (diet.scheduleMode === 'weekly') {
    return diet.weeklyDays.some((day) => day.meals.some(mealHasContent))
  }
  return diet.mealSlots.some((slot) => slot.options.some(optionHasContent))
}

export function dietDayHasContent(day: DietDay): boolean {
  return day.meals.some(mealHasContent)
}

export function mealSlotHasContent(slot: MealSlot): boolean {
  return slot.options.some(optionHasContent)
}

export function hasWorkoutGoals(workout: WorkoutPlanContent): boolean {
  return workout.goals.trim().length > 0
}

export function hasWorkoutSchedule(workout: WorkoutPlanContent): boolean {
  return workout.days.length > 0
}

export function hasWorkoutSessions(workout: WorkoutPlanContent): boolean {
  return workout.days.some((day) => day.exercises.some((exercise) => exercise.exerciseName.trim().length > 0))
}

export function hasWorkoutStructure(workout: WorkoutPlanContent): boolean {
  const meaningful = (value: string) => {
    const trimmed = value.trim()
    return trimmed.length > 0 && trimmed !== '-'
  }
  return meaningful(workout.warmup) || meaningful(workout.cooldown) || meaningful(workout.cardio)
}

/** Whether the workout carries any renderable content across all sections. */
export function hasWorkoutContent(workout: WorkoutPlanContent): boolean {
  return (
    hasWorkoutGoals(workout) ||
    hasWorkoutSchedule(workout) ||
    hasWorkoutSessions(workout) ||
    hasWorkoutStructure(workout)
  )
}
