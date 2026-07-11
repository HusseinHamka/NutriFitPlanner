import { calculateBmi } from '@/lib/helpers'
import { getSupabaseClient } from '@/lib/supabase'
import type { MeasurementFormValues } from '@/lib/schemas'
import type { IMeasurementRepository } from '@/services/abstractions'
import { SupabaseAuthService } from './authService'
import { mapMeasurement } from './mappers'

function toNullableNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  return Number(value)
}

export class SupabaseMeasurementRepository implements IMeasurementRepository {
  private client = getSupabaseClient()
  private auth = new SupabaseAuthService()

  async listByClient(clientId: string) {
    const { data, error } = await this.client
      .from('measurements')
      .select('*')
      .eq('client_id', clientId)
      .order('measured_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data.map(mapMeasurement)
  }

  async getLatest(clientId: string) {
    const { data, error } = await this.client
      .from('measurements')
      .select('*')
      .eq('client_id', clientId)
      .order('measured_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapMeasurement(data) : null
  }

  async create(clientId: string, values: MeasurementFormValues) {
    const userId = await this.auth.getUserId()
    const weight = toNullableNumber(values.weight)
    const height = toNullableNumber(values.height)
    const bmi = weight && height ? calculateBmi(weight, height) : null

    const { data, error } = await this.client
      .from('measurements')
      .insert({
        client_id: clientId,
        practitioner_id: userId,
        measured_at: values.measuredAt,
        weight,
        height,
        bmi,
        body_fat_percent: toNullableNumber(values.bodyFatPercent),
        chest: toNullableNumber(values.chest),
        waist: toNullableNumber(values.waist),
        hip: toNullableNumber(values.hip),
        arm: toNullableNumber(values.arm),
        thigh: toNullableNumber(values.thigh),
        calf: toNullableNumber(values.calf),
        neck: toNullableNumber(values.neck),
        notes: values.notes,
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapMeasurement(data)
  }
}
