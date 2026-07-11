import type {
  BusinessSettings,
  Client,
  DashboardStats,
  Exercise,
  Food,
  Measurement,
  Plan,
  PlanRevision,
  PlanSnapshot,
  PlanTemplate,
  PlanType,
  Report,
  ReportFormat,
  ReportModel,
  SearchResult,
  Session,
} from '@/types/domain'
import type { BusinessSettingsFormValues, ClientFormValues, ExerciseFormValues, FoodFormValues, MeasurementFormValues, PlanFormValues, TemplateFormValues } from '@/lib/schemas'

export interface IAuthService {
  signIn(email: string, password: string): Promise<Session>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  getSession(): Promise<Session | null>
  onAuthStateChange(callback: (session: Session | null) => void): () => void
}

export interface IStorageService {
  uploadBusinessAsset(file: File, kind: 'logo' | 'signature'): Promise<string>
}

export interface ISettingsRepository {
  get(): Promise<BusinessSettings | null>
  upsert(values: BusinessSettingsFormValues): Promise<BusinessSettings>
  updateAssetUrls(updates: { logoUrl?: string | null; signatureUrl?: string | null }): Promise<BusinessSettings>
}

export interface IClientRepository {
  list(): Promise<Client[]>
  getById(id: string): Promise<Client | null>
  create(values: ClientFormValues): Promise<Client>
  update(id: string, values: ClientFormValues): Promise<Client>
  delete(id: string): Promise<void>
  search(query: string): Promise<Client[]>
}

export interface IMeasurementRepository {
  listByClient(clientId: string): Promise<Measurement[]>
  getLatest(clientId: string): Promise<Measurement | null>
  create(clientId: string, values: MeasurementFormValues): Promise<Measurement>
}

export interface IFoodRepository {
  list(): Promise<Food[]>
  getById(id: string): Promise<Food | null>
  create(values: FoodFormValues): Promise<Food>
  update(id: string, values: FoodFormValues): Promise<Food>
  delete(id: string): Promise<void>
  search(query: string): Promise<Food[]>
  toggleFavorite(id: string, isFavorite: boolean): Promise<Food>
}

export interface IExerciseRepository {
  list(): Promise<Exercise[]>
  getById(id: string): Promise<Exercise | null>
  create(values: ExerciseFormValues): Promise<Exercise>
  update(id: string, values: ExerciseFormValues): Promise<Exercise>
  delete(id: string): Promise<void>
  search(query: string): Promise<Exercise[]>
  toggleFavorite(id: string, isFavorite: boolean): Promise<Exercise>
}

export interface IPlanRepository {
  list(clientId?: string): Promise<Plan[]>
  getById(id: string): Promise<Plan | null>
  create(input: { clientId: string; title: string; type: PlanType; snapshot: PlanSnapshot }): Promise<Plan>
  update(id: string, values: Partial<PlanFormValues>): Promise<Plan>
  delete(id: string): Promise<void>
  listRevisions(planId: string): Promise<PlanRevision[]>
  getRevision(planId: string, revisionNumber: number): Promise<PlanRevision | null>
  createRevision(planId: string, snapshot: PlanSnapshot): Promise<PlanRevision>
  updateRevision(planId: string, revisionNumber: number, snapshot: PlanSnapshot): Promise<PlanRevision>
  restoreRevision(planId: string, revisionNumber: number): Promise<PlanRevision>
}

export interface ITemplateRepository {
  list(): Promise<PlanTemplate[]>
  getById(id: string): Promise<PlanTemplate | null>
  create(values: TemplateFormValues & { content: PlanSnapshot }): Promise<PlanTemplate>
  update(id: string, values: TemplateFormValues & { content: PlanSnapshot }): Promise<PlanTemplate>
  delete(id: string): Promise<void>
  search(query: string): Promise<PlanTemplate[]>
}

export interface IReportRepository {
  list(): Promise<Report[]>
  listWithPlanIds(): Promise<RecentReport[]>
  create(input: { planRevisionId: string; clientId: string; title: string; format: ReportFormat }): Promise<Report>
}

export interface ISearchService {
  search(query: string): Promise<SearchResult[]>
}

export interface RecentReport extends Report {
  planId: string
}

export interface IDashboardService {
  getStats(): Promise<DashboardStats>
  getRecentClients(): Promise<Client[]>
  getRecentPlans(): Promise<Plan[]>
  getRecentReports(): Promise<RecentReport[]>
}

export interface IReportService {
  buildReportModel(planId: string, revisionNumber?: number): Promise<ReportModel>
}

export interface IExportService {
  exportPdf(model: ReportModel): Promise<Blob>
  exportDocx(model: ReportModel): Promise<Blob>
}
