import { calculateAge, formatGender, formatLongDate, fullName } from '@/lib/helpers'
import type { BusinessSettings, Meal, PlanType, ReportModel } from '@/types/domain'

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
