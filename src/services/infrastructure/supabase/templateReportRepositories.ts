import { getSupabaseClient } from '@/lib/supabase'
import { normalizePlanSnapshot } from '@/lib/planSnapshot'
import type { TemplateFormValues } from '@/lib/schemas'
import type { IReportRepository, ITemplateRepository, RecentReport } from '@/services/abstractions'
import type { PlanSnapshot, ReportFormat } from '@/types/domain'
import { SupabaseAuthService } from './authService'
import { mapReport, mapTemplate } from './mappers'

export class SupabaseTemplateRepository implements ITemplateRepository {
  private client = getSupabaseClient()
  private auth = new SupabaseAuthService()

  async list() {
    const { data, error } = await this.client.from('plan_templates').select('*').order('name')
    if (error) throw new Error(error.message)
    return data.map(mapTemplate)
  }

  async getById(id: string) {
    const { data, error } = await this.client.from('plan_templates').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapTemplate(data) : null
  }

  async create(values: TemplateFormValues & { content: PlanSnapshot }) {
    const userId = await this.auth.getUserId()
    const { data, error } = await this.client
      .from('plan_templates')
      .insert({
        practitioner_id: userId,
        name: values.name,
        description: values.description,
        type: values.type,
        content: normalizePlanSnapshot(values.content),
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapTemplate(data)
  }

  async update(id: string, values: TemplateFormValues & { content: PlanSnapshot }) {
    const { data, error } = await this.client
      .from('plan_templates')
      .update({
        name: values.name,
        description: values.description,
        type: values.type,
        content: normalizePlanSnapshot(values.content),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapTemplate(data)
  }

  async delete(id: string) {
    const { error } = await this.client.from('plan_templates').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async search(query: string) {
    const { data, error } = await this.client
      .from('plan_templates')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10)

    if (error) throw new Error(error.message)
    return data.map(mapTemplate)
  }
}

export class SupabaseReportRepository implements IReportRepository {
  private client = getSupabaseClient()
  private auth = new SupabaseAuthService()

  async list() {
    const { data, error } = await this.client
      .from('reports')
      .select('*')
      .order('generated_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data.map(mapReport)
  }

  async listWithPlanIds(): Promise<RecentReport[]> {
    const { data, error } = await this.client
      .from('reports')
      .select('*, plan_revisions(plan_id)')
      .order('generated_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data.map((row) => ({
      ...mapReport(row),
      planId: (row.plan_revisions as { plan_id: string } | null)?.plan_id ?? '',
    }))
  }

  async create(input: { planRevisionId: string; clientId: string; title: string; format: ReportFormat }) {
    const userId = await this.auth.getUserId()
    const { data, error } = await this.client
      .from('reports')
      .insert({
        practitioner_id: userId,
        plan_revision_id: input.planRevisionId,
        client_id: input.clientId,
        title: input.title,
        format: input.format,
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return mapReport(data)
  }
}
