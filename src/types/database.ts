// Generated from Supabase project `nutrifit-pro` (ref: qkgjgeygczeczvlssgsa)
// Regenerate with Supabase MCP: generate_typescript_types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      business_settings: { Row: Record<string, unknown> }
      clients: { Row: Record<string, unknown> }
      exercises: { Row: Record<string, unknown> }
      foods: { Row: Record<string, unknown> }
      measurements: { Row: Record<string, unknown> }
      plan_revisions: { Row: Record<string, unknown> }
      plan_templates: { Row: Record<string, unknown> }
      plans: { Row: Record<string, unknown> }
      reports: { Row: Record<string, unknown> }
    }
    Enums: {
      gender_type: 'male' | 'female' | 'other' | 'prefer_not_to_say'
      plan_status: 'draft' | 'active' | 'archived' | 'completed'
      plan_type: 'diet' | 'workout' | 'combined'
      report_format: 'preview' | 'pdf' | 'docx'
    }
  }
}
