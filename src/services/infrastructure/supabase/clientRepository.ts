import { getSupabaseClient } from '@/lib/supabase'
import type { ClientFormValues } from '@/lib/schemas'
import type { IClientRepository } from '@/services/abstractions'
import { SupabaseAuthService } from './authService'
import { mapClient } from './mappers'

export class SupabaseClientRepository implements IClientRepository {
  private client = getSupabaseClient()
  private auth = new SupabaseAuthService()

  async list() {
    const { data, error } = await this.client
      .from('clients')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data.map(mapClient)
  }

  async getById(id: string) {
    const { data, error } = await this.client.from('clients').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapClient(data) : null
  }

  async create(values: ClientFormValues) {
    const userId = await this.auth.getUserId()
    const { data, error } = await this.client
      .from('clients')
      .insert({
        practitioner_id: userId,
        first_name: values.firstName,
        last_name: values.lastName,
        date_of_birth: values.dateOfBirth || null,
        gender: values.gender || null,
        phone: values.phone,
        email: values.email,
        address: values.address,
        notes: values.notes,
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapClient(data)
  }

  async update(id: string, values: ClientFormValues) {
    const { data, error } = await this.client
      .from('clients')
      .update({
        first_name: values.firstName,
        last_name: values.lastName,
        date_of_birth: values.dateOfBirth || null,
        gender: values.gender || null,
        phone: values.phone,
        email: values.email,
        address: values.address,
        notes: values.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapClient(data)
  }

  async delete(id: string) {
    const { error } = await this.client.from('clients').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async search(query: string) {
    const { data, error } = await this.client
      .from('clients')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10)

    if (error) throw new Error(error.message)
    return data.map(mapClient)
  }
}
