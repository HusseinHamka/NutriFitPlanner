import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const businessSettingsSchema = z.object({
  professionalName: z.string().min(1, 'Professional name is required'),
  businessName: z.string().min(1, 'Business name is required'),
  title: z.string(),
  phone: z.string(),
  email: z.union([z.string().email('Enter a valid email'), z.literal('')]),
  address: z.string(),
  website: z.string(),
})

export const clientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  phone: z.string(),
  email: z.string(),
  address: z.string(),
  notes: z.string(),
})

export const measurementSchema = z.object({
  measuredAt: z.string().min(1, 'Date is required'),
  weight: z.string().optional(),
  height: z.string().optional(),
  bodyFatPercent: z.string().optional(),
  chest: z.string().optional(),
  waist: z.string().optional(),
  hip: z.string().optional(),
  arm: z.string().optional(),
  thigh: z.string().optional(),
  calf: z.string().optional(),
  neck: z.string().optional(),
  notes: z.string(),
})

export const foodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string(),
  calories: z.string().optional(),
  protein: z.string().optional(),
  carbs: z.string().optional(),
  fat: z.string().optional(),
  unit: z.string(),
  isFavorite: z.boolean(),
  notes: z.string(),
})

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string(),
  muscleGroup: z.string(),
  isFavorite: z.boolean(),
  notes: z.string(),
})

export const planSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['diet', 'workout', 'combined']),
  status: z.enum(['draft', 'active', 'archived', 'completed']),
})

export const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  type: z.enum(['diet', 'workout', 'combined']),
})

export const supplementItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  dose: z.string(),
  timing: z.string(),
  sortOrder: z.number(),
})

export const mealItemSchema = z.object({
  id: z.string(),
  mode: z.enum(['library', 'custom']),
  foodId: z.string().nullable(),
  foodName: z.string(),
  quantity: z.number().nullable(),
  unit: z.string(),
  calories: z.number().nullable(),
  protein: z.number().nullable(),
  carbs: z.number().nullable(),
  fat: z.number().nullable(),
  notes: z.string(),
  sortOrder: z.number(),
})

export const mealSchema = z.object({
  id: z.string(),
  name: z.string(),
  mealType: z.enum(['breakfast', 'snack', 'lunch', 'dinner', 'post_workout', 'custom']),
  sortOrder: z.number(),
  notes: z.string(),
  items: z.array(mealItemSchema),
})

export const dietPlanContentSchema = z.object({
  goals: z.string(),
  calorieTarget: z.number().nullable(),
  proteinTarget: z.number().nullable(),
  carbohydrateTarget: z.number().nullable(),
  fatTarget: z.number().nullable(),
  waterIntake: z.string(),
  preferredFoods: z.string(),
  avoidedFoods: z.string(),
  supplements: z.array(supplementItemSchema),
  recommendations: z.string(),
  notes: z.string(),
  meals: z.array(mealSchema),
})

export const workoutExerciseSchema = z.object({
  id: z.string(),
  mode: z.enum(['library', 'custom']),
  exerciseId: z.string().nullable(),
  exerciseName: z.string(),
  sets: z.number().nullable(),
  reps: z.string(),
  weight: z.string(),
  rest: z.string(),
  tempo: z.string(),
  notes: z.string(),
  sortOrder: z.number(),
})

export const workoutDaySchema = z.object({
  id: z.string(),
  name: z.string(),
  muscleGroups: z.string(),
  sortOrder: z.number(),
  exercises: z.array(workoutExerciseSchema),
})

export const workoutPlanContentSchema = z.object({
  goals: z.string(),
  warmup: z.string(),
  cooldown: z.string(),
  cardio: z.string(),
  notes: z.string(),
  days: z.array(workoutDaySchema),
})

export const planSnapshotSchema = z.object({
  diet: dietPlanContentSchema.nullable(),
  workout: workoutPlanContentSchema.nullable(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>
export type ClientFormValues = z.infer<typeof clientSchema>
export type MeasurementFormValues = z.infer<typeof measurementSchema>
export type FoodFormValues = z.infer<typeof foodSchema>
export type ExerciseFormValues = z.infer<typeof exerciseSchema>
export type PlanFormValues = z.infer<typeof planSchema>
export type TemplateFormValues = z.infer<typeof templateSchema>
