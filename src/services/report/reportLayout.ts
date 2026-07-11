import { calculateAge, formatGender, formatLongDate, fullName } from '@/lib/helpers'
import type { BusinessSettings, DietDay, Meal, MealOption, MealSlot, PlanType, ReportModel } from '@/types/domain'

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
