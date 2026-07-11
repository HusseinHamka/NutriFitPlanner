import { getSupabaseClient } from '@/lib/supabase'
import type { BusinessSettingsFormValues } from '@/lib/schemas'
import type { ISettingsRepository } from '@/services/abstractions'
import { SupabaseAuthService } from './authService'
import { mapBusinessSettings } from './mappers'

export class SupabaseSettingsRepository implements ISettingsRepository {
  private client = getSupabaseClient()
  private auth = new SupabaseAuthService()

  async get() {
    const userId = await this.auth.getUserId()
    const { data, error } = await this.client
      .from('business_settings')
      .select('*')
      .eq('practitioner_id', userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapBusinessSettings(data) : null
  }

  async upsert(values: BusinessSettingsFormValues) {
    const userId = await this.auth.getUserId()
    const payload = {
      practitioner_id: userId,
      professional_name: values.professionalName,
      business_name: values.businessName,
      title: values.title,
      phone: values.phone,
      email: values.email,
      address: values.address,
      website: values.website,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await this.client
      .from('business_settings')
      .upsert(payload, { onConflict: 'practitioner_id' })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapBusinessSettings(data)
  }

  async updateAssetUrls(updates: { logoUrl?: string | null; signatureUrl?: string | null }) {
    const userId = await this.auth.getUserId()
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl
    if (updates.signatureUrl !== undefined) payload.signature_url = updates.signatureUrl

    const { data, error } = await this.client
      .from('business_settings')
      .update(payload)
      .eq('practitioner_id', userId)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapBusinessSettings(data)
  }
}
