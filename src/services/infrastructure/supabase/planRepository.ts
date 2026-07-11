import { getSupabaseClient } from '@/lib/supabase'
import type { PlanFormValues } from '@/lib/schemas'
import type { IPlanRepository } from '@/services/abstractions'
import { normalizePlanSnapshot } from '@/lib/planSnapshot'
import type { PlanSnapshot, PlanType } from '@/types/domain'
import { SupabaseAuthService } from './authService'
import { mapPlan, mapPlanRevision } from './mappers'

export class SupabasePlanRepository implements IPlanRepository {
  private client = getSupabaseClient()
  private auth = new SupabaseAuthService()

  async list(clientId?: string) {
    let query = this.client.from('plans').select('*').order('updated_at', { ascending: false })
    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data.map(mapPlan)
  }

  async getById(id: string) {
    const { data, error } = await this.client.from('plans').select('*').eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapPlan(data) : null
  }

  async create(input: { clientId: string; title: string; type: PlanType; snapshot: PlanSnapshot }) {
    const userId = await this.auth.getUserId()

    const { data: plan, error: planError } = await this.client
      .from('plans')
      .insert({
        client_id: input.clientId,
        practitioner_id: userId,
        title: input.title,
        type: input.type,
        status: 'draft',
        current_revision_number: 1,
      })
      .select('*')
      .single()

    if (planError) throw new Error(planError.message)

    const { error: revisionError } = await this.client.from('plan_revisions').insert({
      plan_id: plan.id,
      practitioner_id: userId,
      revision_number: 1,
      snapshot: normalizePlanSnapshot(input.snapshot),
    })

    if (revisionError) throw new Error(revisionError.message)
    return mapPlan(plan)
  }

  async update(id: string, values: Partial<PlanFormValues>) {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (values.title) payload.title = values.title
    if (values.type) payload.type = values.type
    if (values.status) payload.status = values.status

    const { data, error } = await this.client.from('plans').update(payload).eq('id', id).select('*').single()
    if (error) throw new Error(error.message)
    return mapPlan(data)
  }

  async delete(id: string) {
    const { error } = await this.client.from('plans').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async listRevisions(planId: string) {
    const { data, error } = await this.client
      .from('plan_revisions')
      .select('*')
      .eq('plan_id', planId)
      .order('revision_number', { ascending: false })

    if (error) throw new Error(error.message)
    return data.map(mapPlanRevision)
  }

  async getRevision(planId: string, revisionNumber: number) {
    const { data, error } = await this.client
      .from('plan_revisions')
      .select('*')
      .eq('plan_id', planId)
      .eq('revision_number', revisionNumber)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? mapPlanRevision(data) : null
  }

  async createRevision(planId: string, snapshot: PlanSnapshot) {
    const userId = await this.auth.getUserId()
    const plan = await this.getById(planId)
    if (!plan) throw new Error('Plan not found')

    const normalizedSnapshot = normalizePlanSnapshot(snapshot)
    const nextRevision = plan.currentRevisionNumber + 1

    const { data, error } = await this.client
      .from('plan_revisions')
      .insert({
        plan_id: planId,
        practitioner_id: userId,
        revision_number: nextRevision,
        snapshot: normalizedSnapshot,
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    await this.client
      .from('plans')
      .update({ current_revision_number: nextRevision, updated_at: new Date().toISOString() })
      .eq('id', planId)

    return mapPlanRevision(data)
  }

  async updateRevision(planId: string, revisionNumber: number, snapshot: PlanSnapshot) {
    const normalizedSnapshot = normalizePlanSnapshot(snapshot)

    const { data, error } = await this.client
      .from('plan_revisions')
      .update({ snapshot: normalizedSnapshot })
      .eq('plan_id', planId)
      .eq('revision_number', revisionNumber)
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    await this.client
      .from('plans')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', planId)

    return mapPlanRevision(data)
  }

  async restoreRevision(planId: string, revisionNumber: number) {
    const revision = await this.getRevision(planId, revisionNumber)
    if (!revision) throw new Error('Revision not found')
    return this.createRevision(planId, revision.snapshot)
  }
}
