export type PlanType = 'diet' | 'workout' | 'combined'
export type PlanStatus = 'draft' | 'active' | 'archived' | 'completed'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type MealType = 'breakfast' | 'snack' | 'lunch' | 'dinner' | 'post_workout' | 'custom'
export type DietScheduleMode = 'weekly' | 'meal_options'
export type ReportFormat = 'preview' | 'pdf' | 'docx'

export interface BusinessSettings {
  id: string
  practitionerId: string
  professionalName: string
  businessName: string
  title: string
  phone: string
  email: string
  address: string
  website: string
  logoUrl: string | null
  signatureUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  practitionerId: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  gender: Gender | null
  phone: string
  email: string
  address: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Measurement {
  id: string
  clientId: string
  practitionerId: string
  measuredAt: string
  weight: number | null
  height: number | null
  bmi: number | null
  bodyFatPercent: number | null
  chest: number | null
  waist: number | null
  hip: number | null
  arm: number | null
  thigh: number | null
  calf: number | null
  neck: number | null
  notes: string
  createdAt: string
}

export interface Food {
  id: string
  practitionerId: string
  name: string
  category: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  unit: string
  isFavorite: boolean
  isCustom: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Exercise {
  id: string
  practitionerId: string
  name: string
  category: string
  muscleGroup: string
  isFavorite: boolean
  isCustom: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

export interface SupplementItem {
  id: string
  name: string
  dose: string
  timing: string
  sortOrder: number
}

export interface MealItem {
  id: string
  mode: 'library' | 'custom'
  foodId: string | null
  foodName: string
  quantity: number | null
  unit: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  notes: string
  sortOrder: number
}

export interface Meal {
  id: string
  name: string
  mealType: MealType
  sortOrder: number
  notes: string
  items: MealItem[]
}

export interface MealOption {
  id: string
  name: string
  sortOrder: number
  notes: string
  items: MealItem[]
}

export interface MealSlot {
  id: string
  mealType: MealType
  name: string
  sortOrder: number
  options: MealOption[]
}

export interface DietDay {
  id: string
  name: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  sortOrder: number
  meals: Meal[]
}

export interface WorkoutExercise {
  id: string
  mode: 'library' | 'custom'
  exerciseId: string | null
  exerciseName: string
  sets: number | null
  reps: string
  weight: string
  rest: string
  tempo: string
  notes: string
  sortOrder: number
}

export interface WorkoutDay {
  id: string
  name: string
  muscleGroups: string
  sortOrder: number
  exercises: WorkoutExercise[]
}

export interface DietPlanContent {
  goals: string
  calorieTarget: number | null
  proteinTarget: number | null
  carbohydrateTarget: number | null
  fatTarget: number | null
  waterIntake: string
  preferredFoods: string
  avoidedFoods: string
  supplements: SupplementItem[]
  recommendations: string
  notes: string
  scheduleMode: DietScheduleMode
  weeklyDays: DietDay[]
  mealSlots: MealSlot[]
  /** @deprecated Legacy flat meals — migrated to mealSlots on load */
  meals: Meal[]
}

export interface WorkoutPlanContent {
  goals: string
  warmup: string
  cooldown: string
  cardio: string
  notes: string
  days: WorkoutDay[]
}

export interface PlanSnapshot {
  diet: DietPlanContent | null
  workout: WorkoutPlanContent | null
}

export interface Plan {
  id: string
  clientId: string
  practitionerId: string
  title: string
  type: PlanType
  status: PlanStatus
  currentRevisionNumber: number
  createdAt: string
  updatedAt: string
}

export interface PlanRevision {
  id: string
  planId: string
  practitionerId: string
  revisionNumber: number
  snapshot: PlanSnapshot
  createdAt: string
}

export interface PlanTemplate {
  id: string
  practitionerId: string
  name: string
  description: string
  type: PlanType
  content: PlanSnapshot
  createdAt: string
  updatedAt: string
}

export interface Report {
  id: string
  planRevisionId: string
  practitionerId: string
  clientId: string
  title: string
  format: ReportFormat
  generatedAt: string
}

export interface ReportModel {
  business: BusinessSettings
  client: Client
  measurement: Measurement | null
  plan: Plan
  revision: PlanRevision
  generatedAt: string
}

export interface SearchResult {
  id: string
  type: 'client' | 'food' | 'exercise' | 'template'
  title: string
  subtitle: string
  href: string
}

export interface DashboardStats {
  clientCount: number
  activePlans: number
  draftPlans: number
  archivedPlans: number
}

export interface Session {
  userId: string
  email: string
}
