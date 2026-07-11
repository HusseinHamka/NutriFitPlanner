import { fullName } from '@/lib/helpers'
import { normalizePlanSnapshot } from '@/lib/planSnapshot'
import type { IDashboardService, IReportService, ISearchService } from '@/services/abstractions'
import type { ReportModel } from '@/types/domain'
import { SupabaseClientRepository } from './infrastructure/supabase/clientRepository'
import { SupabaseMeasurementRepository } from './infrastructure/supabase/measurementRepository'
import { SupabaseExerciseRepository, SupabaseFoodRepository } from './infrastructure/supabase/libraryRepositories'
import { SupabasePlanRepository } from './infrastructure/supabase/planRepository'
import { SupabaseReportRepository, SupabaseTemplateRepository } from './infrastructure/supabase/templateReportRepositories'
import { SupabaseSettingsRepository } from './infrastructure/supabase/settingsRepository'

export class SearchService implements ISearchService {
  constructor(
    private clients = new SupabaseClientRepository(),
    private foods = new SupabaseFoodRepository(),
    private exercises = new SupabaseExerciseRepository(),
    private templates = new SupabaseTemplateRepository(),
  ) {}

  async search(query: string) {
    if (!query.trim()) return []

    const [clients, foods, exercises, templates] = await Promise.all([
      this.clients.search(query),
      this.foods.search(query),
      this.exercises.search(query),
      this.templates.search(query),
    ])

    return [
      ...clients.map((client) => ({
        id: client.id,
        type: 'client' as const,
        title: fullName(client.firstName, client.lastName),
        subtitle: client.email || client.phone || 'Client',
        href: `/clients/${client.id}`,
      })),
      ...foods.map((food) => ({
        id: food.id,
        type: 'food' as const,
        title: food.name,
        subtitle: food.category || 'Food',
        href: '/foods',
      })),
      ...exercises.map((exercise) => ({
        id: exercise.id,
        type: 'exercise' as const,
        title: exercise.name,
        subtitle: exercise.muscleGroup || 'Exercise',
        href: '/exercises',
      })),
      ...templates.map((template) => ({
        id: template.id,
        type: 'template' as const,
        title: template.name,
        subtitle: template.description || 'Template',
        href: '/templates',
      })),
    ]
  }
}

export class DashboardService implements IDashboardService {
  constructor(
    private clients = new SupabaseClientRepository(),
    private plans = new SupabasePlanRepository(),
    private reports = new SupabaseReportRepository(),
  ) {}

  async getStats() {
    const plans = await this.plans.list()
    const clients = await this.clients.list()

    return {
      clientCount: clients.length,
      activePlans: plans.filter((plan) => plan.status === 'active').length,
      draftPlans: plans.filter((plan) => plan.status === 'draft').length,
      archivedPlans: plans.filter((plan) => plan.status === 'archived').length,
    }
  }

  async getRecentClients() {
    const clients = await this.clients.list()
    return clients.slice(0, 5)
  }

  async getRecentPlans() {
    const plans = await this.plans.list()
    return plans.slice(0, 5)
  }

  async getRecentReports() {
    const reports = await this.reports.listWithPlanIds()
    return reports.slice(0, 5)
  }
}

export class ReportService implements IReportService {
  constructor(
    private plans = new SupabasePlanRepository(),
    private clients = new SupabaseClientRepository(),
    private measurements = new SupabaseMeasurementRepository(),
    private settings = new SupabaseSettingsRepository(),
  ) {}

  async buildReportModel(planId: string, revisionNumber?: number): Promise<ReportModel> {
    const plan = await this.plans.getById(planId)
    if (!plan) throw new Error('Plan not found')

    const revision = await this.plans.getRevision(planId, revisionNumber ?? plan.currentRevisionNumber)
    if (!revision) throw new Error('Revision not found')

    const [client, measurement, business] = await Promise.all([
      this.clients.getById(plan.clientId),
      this.measurements.getLatest(plan.clientId),
      this.settings.get(),
    ])

    if (!client) throw new Error('Client not found')
    if (!business) throw new Error('Business settings are required before generating reports')

    return {
      business,
      client,
      measurement,
      plan,
      revision: {
        ...revision,
        snapshot: normalizePlanSnapshot(revision.snapshot),
      },
      generatedAt: new Date().toISOString(),
    }
  }
}
