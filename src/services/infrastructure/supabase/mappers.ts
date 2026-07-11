import { normalizePlanSnapshot } from '@/lib/planSnapshot'
import type {
  BusinessSettings,
  Client,
  Exercise,
  Food,
  Measurement,
  Plan,
  PlanRevision,
  PlanSnapshot,
  PlanTemplate,
  Report,
  Session,
} from '@/types/domain'

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  return Number(value)
}

export function mapSession(user: { id: string; email?: string }): Session {
  return { userId: user.id, email: user.email ?? '' }
}

export function mapBusinessSettings(row: Record<string, unknown>): BusinessSettings {
  return {
    id: row.id as string,
    practitionerId: row.practitioner_id as string,
    professionalName: row.professional_name as string,
    businessName: row.business_name as string,
    title: row.title as string,
    phone: row.phone as string,
    email: row.email as string,
    address: row.address as string,
    website: row.website as string,
    logoUrl: (row.logo_url as string | null) ?? null,
    signatureUrl: (row.signature_url as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function mapClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    practitionerId: row.practitioner_id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    dateOfBirth: (row.date_of_birth as string | null) ?? null,
    gender: (row.gender as Client['gender']) ?? null,
    phone: row.phone as string,
    email: row.email as string,
    address: row.address as string,
    notes: row.notes as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function mapMeasurement(row: Record<string, unknown>): Measurement {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    practitionerId: row.practitioner_id as string,
    measuredAt: row.measured_at as string,
    weight: toNumber(row.weight as number | string | null),
    height: toNumber(row.height as number | string | null),
    bmi: toNumber(row.bmi as number | string | null),
    bodyFatPercent: toNumber(row.body_fat_percent as number | string | null),
    chest: toNumber(row.chest as number | string | null),
    waist: toNumber(row.waist as number | string | null),
    hip: toNumber(row.hip as number | string | null),
    arm: toNumber(row.arm as number | string | null),
    thigh: toNumber(row.thigh as number | string | null),
    calf: toNumber(row.calf as number | string | null),
    neck: toNumber(row.neck as number | string | null),
    notes: row.notes as string,
    createdAt: row.created_at as string,
  }
}

export function mapFood(row: Record<string, unknown>): Food {
  return {
    id: row.id as string,
    practitionerId: row.practitioner_id as string,
    name: row.name as string,
    category: row.category as string,
    calories: toNumber(row.calories as number | string | null),
    protein: toNumber(row.protein as number | string | null),
    carbs: toNumber(row.carbs as number | string | null),
    fat: toNumber(row.fat as number | string | null),
    unit: row.unit as string,
    isFavorite: row.is_favorite as boolean,
    isCustom: row.is_custom as boolean,
    notes: row.notes as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function mapExercise(row: Record<string, unknown>): Exercise {
  return {
    id: row.id as string,
    practitionerId: row.practitioner_id as string,
    name: row.name as string,
    category: row.category as string,
    muscleGroup: row.muscle_group as string,
    isFavorite: row.is_favorite as boolean,
    isCustom: row.is_custom as boolean,
    notes: row.notes as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function mapPlan(row: Record<string, unknown>): Plan {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    practitionerId: row.practitioner_id as string,
    title: row.title as string,
    type: row.type as Plan['type'],
    status: row.status as Plan['status'],
    currentRevisionNumber: row.current_revision_number as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function mapPlanRevision(row: Record<string, unknown>): PlanRevision {
  return {
    id: row.id as string,
    planId: row.plan_id as string,
    practitionerId: row.practitioner_id as string,
    revisionNumber: row.revision_number as number,
    snapshot: normalizePlanSnapshot(row.snapshot as PlanSnapshot),
    createdAt: row.created_at as string,
  }
}

export function mapTemplate(row: Record<string, unknown>): PlanTemplate {
  return {
    id: row.id as string,
    practitionerId: row.practitioner_id as string,
    name: row.name as string,
    description: row.description as string,
    type: row.type as PlanTemplate['type'],
    content: normalizePlanSnapshot(row.content as PlanSnapshot),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function mapReport(row: Record<string, unknown>): Report {
  return {
    id: row.id as string,
    planRevisionId: row.plan_revision_id as string,
    practitionerId: row.practitioner_id as string,
    clientId: row.client_id as string,
    title: row.title as string,
    format: row.format as Report['format'],
    generatedAt: row.generated_at as string,
  }
}
