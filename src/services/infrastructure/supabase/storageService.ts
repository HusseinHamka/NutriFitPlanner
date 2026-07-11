import { getSupabaseClient } from '@/lib/supabase'
import type { IStorageService } from '@/services/abstractions'
import { SupabaseAuthService } from './authService'

export class SupabaseStorageService implements IStorageService {
  private client = getSupabaseClient()
  private auth = new SupabaseAuthService()

  async uploadBusinessAsset(file: File, kind: 'logo' | 'signature'): Promise<string> {
    const userId = await this.auth.getUserId()
    const extension = file.name.split('.').pop() ?? 'png'
    const path = `${userId}/${kind}.${extension}`

    const { error } = await this.client.storage.from('business-assets').upload(path, file, {
      upsert: true,
      contentType: file.type,
    })

    if (error) throw new Error(error.message)

    const { data, error: signedError } = await this.client.storage
      .from('business-assets')
      .createSignedUrl(path, 60 * 60 * 24 * 365)

    if (signedError || !data?.signedUrl) throw new Error(signedError?.message ?? 'Unable to create signed URL')
    return data.signedUrl
  }
}
