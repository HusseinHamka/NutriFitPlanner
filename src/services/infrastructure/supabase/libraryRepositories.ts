import { getSupabaseClient } from '@/lib/supabase'
import type { ExerciseFormValues, FoodFormValues } from '@/lib/schemas'
import type { IExerciseRepository, IFoodRepository } from '@/services/abstractions'
import { SupabaseAuthService } from './authService'
import { mapExercise, mapFood } from './mappers'

function toNullableNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  return Number(value)
}

export class SupabaseFoodRepository implements IFoodRepository {
  private client = getSupabaseClient()
  private auth = new SupabaseAuthService()

  async list() {
    const { data, error } = await this.client.from('foods').select('*').order('name')
    if (error) throw new Error(error.message)
    return data.map(mapFood)
  }

  async getById(id: string) {
    const { data, error } = await this.client.from('foods').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapFood(data) : null
  }

  async create(values: FoodFormValues) {
    const userId = await this.auth.getUserId()
    const { data, error } = await this.client
      .from('foods')
      .insert({
        practitioner_id: userId,
        name: values.name,
        category: values.category,
        calories: toNullableNumber(values.calories),
        protein: toNullableNumber(values.protein),
        carbs: toNullableNumber(values.carbs),
        fat: toNullableNumber(values.fat),
        unit: values.unit,
        is_favorite: values.isFavorite,
        is_custom: true,
        notes: values.notes,
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapFood(data)
  }

  async update(id: string, values: FoodFormValues) {
    const { data, error } = await this.client
      .from('foods')
      .update({
        name: values.name,
        category: values.category,
        calories: toNullableNumber(values.calories),
        protein: toNullableNumber(values.protein),
        carbs: toNullableNumber(values.carbs),
        fat: toNullableNumber(values.fat),
        unit: values.unit,
        is_favorite: values.isFavorite,
        notes: values.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapFood(data)
  }

  async delete(id: string) {
    const { error } = await this.client.from('foods').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async search(query: string) {
    const { data, error } = await this.client
      .from('foods')
      .select('*')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(10)

    if (error) throw new Error(error.message)
    return data.map(mapFood)
  }

  async toggleFavorite(id: string, isFavorite: boolean) {
    const { data, error } = await this.client
      .from('foods')
      .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapFood(data)
  }
}

export class SupabaseExerciseRepository implements IExerciseRepository {
  private client = getSupabaseClient()
  private auth = new SupabaseAuthService()

  async list() {
    const { data, error } = await this.client.from('exercises').select('*').order('name')
    if (error) throw new Error(error.message)
    return data.map(mapExercise)
  }

  async getById(id: string) {
    const { data, error } = await this.client.from('exercises').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapExercise(data) : null
  }

  async create(values: ExerciseFormValues) {
    const userId = await this.auth.getUserId()
    const { data, error } = await this.client
      .from('exercises')
      .insert({
        practitioner_id: userId,
        name: values.name,
        category: values.category,
        muscle_group: values.muscleGroup,
        is_favorite: values.isFavorite,
        is_custom: true,
        notes: values.notes,
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapExercise(data)
  }

  async update(id: string, values: ExerciseFormValues) {
    const { data, error } = await this.client
      .from('exercises')
      .update({
        name: values.name,
        category: values.category,
        muscle_group: values.muscleGroup,
        is_favorite: values.isFavorite,
        notes: values.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapExercise(data)
  }

  async delete(id: string) {
    const { error } = await this.client.from('exercises').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async search(query: string) {
    const { data, error } = await this.client
      .from('exercises')
      .select('*')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%,muscle_group.ilike.%${query}%`)
      .limit(10)

    if (error) throw new Error(error.message)
    return data.map(mapExercise)
  }

  async toggleFavorite(id: string, isFavorite: boolean) {
    const { data, error } = await this.client
      .from('exercises')
      .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapExercise(data)
  }
}
