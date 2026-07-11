import type {
  IAuthService,
  IClientRepository,
  IDashboardService,
  IExerciseRepository,
  IExportService,
  IFoodRepository,
  IMeasurementRepository,
  IPlanRepository,
  IReportRepository,
  IReportService,
  ISearchService,
  ISettingsRepository,
  IStorageService,
  ITemplateRepository,
} from '@/services/abstractions'
import { DashboardService, ReportService, SearchService } from '@/services/domainServices'
import { ExportService } from '@/services/report/exportService'
import { SupabaseAuthService } from '@/services/infrastructure/supabase/authService'
import { SupabaseClientRepository } from '@/services/infrastructure/supabase/clientRepository'
import { SupabaseExerciseRepository, SupabaseFoodRepository } from '@/services/infrastructure/supabase/libraryRepositories'
import { SupabaseMeasurementRepository } from '@/services/infrastructure/supabase/measurementRepository'
import { SupabasePlanRepository } from '@/services/infrastructure/supabase/planRepository'
import { SupabaseSettingsRepository } from '@/services/infrastructure/supabase/settingsRepository'
import { SupabaseStorageService } from '@/services/infrastructure/supabase/storageService'
import { SupabaseReportRepository, SupabaseTemplateRepository } from '@/services/infrastructure/supabase/templateReportRepositories'

class ServiceContainer {
  readonly auth: IAuthService = new SupabaseAuthService()
  readonly storage: IStorageService = new SupabaseStorageService()
  readonly settings: ISettingsRepository = new SupabaseSettingsRepository()
  readonly clients: IClientRepository = new SupabaseClientRepository()
  readonly measurements: IMeasurementRepository = new SupabaseMeasurementRepository()
  readonly foods: IFoodRepository = new SupabaseFoodRepository()
  readonly exercises: IExerciseRepository = new SupabaseExerciseRepository()
  readonly plans: IPlanRepository = new SupabasePlanRepository()
  readonly templates: ITemplateRepository = new SupabaseTemplateRepository()
  readonly reports: IReportRepository = new SupabaseReportRepository()
  readonly search: ISearchService = new SearchService()
  readonly dashboard: IDashboardService = new DashboardService()
  readonly report: IReportService = new ReportService()
  readonly export: IExportService = new ExportService()
}

export const services = new ServiceContainer()
