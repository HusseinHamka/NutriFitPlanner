import type { PlanSnapshot, PlanType } from '@/types/domain'

export function createId(): string {
  return crypto.randomUUID()
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Number((weightKg / (heightM * heightM)).toFixed(1))
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}

export function calculateAge(dateOfBirth: string | null | undefined): string {
  if (!dateOfBirth) return '—'
  const birth = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return `${age} yrs`
}

export function formatLongDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatGender(gender: string | null | undefined): string {
  if (!gender) return '—'
  return gender
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function formatPlanStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function buildReportTitle(planTitle: string, clientName: string, format: 'pdf' | 'docx'): string {
  const stamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${planTitle} – ${clientName} (${format.toUpperCase()} · ${stamp})`
}

export function emptyDietContent() {
  return {
    goals: '',
    calorieTarget: null,
    proteinTarget: null,
    carbohydrateTarget: null,
    fatTarget: null,
    waterIntake: '',
    preferredFoods: '',
    avoidedFoods: '',
    supplements: [],
    recommendations: '',
    notes: '',
    meals: [],
  }
}

export function emptyWorkoutContent() {
  return {
    goals: '',
    warmup: '',
    cooldown: '',
    cardio: '',
    notes: '',
    days: [],
  }
}

export function emptyPlanSnapshot(type: PlanType): PlanSnapshot {
  return {
    diet: type === 'workout' ? null : emptyDietContent(),
    workout: type === 'diet' ? null : emptyWorkoutContent(),
  }
}
