export type RoleName = 'citizen' | 'department_officer' | 'department_head' | 'system_admin';

export interface UserRole {
  role: RoleName;
  department_id?: string | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  preferred_language: string;
  phone_number?: string | null;
  account_status: string;
  roles: UserRole[];
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  jurisdiction: string;
  contact_email?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  parent_category_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export type ComplaintStatus =
  | 'submitted'
  | 'acknowledged'
  | 'under_review'
  | 'assigned'
  | 'awaiting_information'
  | 'in_progress'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'rejected';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface StatusHistoryItem {
  id: string;
  previous_status?: string | null;
  new_status: string;
  changed_by_name?: string | null;
  public_comment?: string | null;
  created_at: string;
}

export interface ComplaintComment {
  id: string;
  author_id?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  body: string;
  visibility: 'public' | 'internal';
  created_at: string;
}

export interface ComplaintAttachment {
  id: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}

export interface ComplaintFeedback {
  id: string;
  rating: number;
  feedback_text?: string | null;
  created_at: string;
}

export interface Complaint {
  id: string;
  ticket_id: string;
  title: string;
  original_language: string;
  original_description?: string;
  translated_description?: string | null;
  ai_summary?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  assigned_department_id?: string | null;
  department_name?: string | null;
  assigned_officer_id?: string | null;
  assigned_officer_name?: string | null;
  ai_suggested_urgency?: string | null;
  ai_confidence?: number | null;
  priority: PriorityLevel;
  status: ComplaintStatus;
  state?: string | null;
  district?: string | null;
  locality?: string | null;
  submitted_at: string;
  updated_at: string;
  due_at?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  resolution_summary?: string | null;
  status_history?: StatusHistoryItem[];
  comments?: ComplaintComment[];
  attachments?: ComplaintAttachment[];
  feedback?: ComplaintFeedback | null;
}

export interface LanguageCapability {
  code: string;
  name: string;
  native_name: string;
  ui_supported: boolean;
  speech_supported: boolean;
  translation_supported: boolean;
}

export interface AIAnalysisResult {
  detected_language: string;
  language_name: string;
  translated_text?: string | null;
  suggested_category: string;
  suggested_category_id?: string | null;
  suggested_department: string;
  suggested_department_id?: string | null;
  suggested_urgency: PriorityLevel;
  summary: string;
  confidence: number;
  reasoning_summary: string;
  requires_human_review: boolean;
  provider: string;
  model: string;
}

export interface NotificationItem {
  id: string;
  complaint_id?: string | null;
  channel: string;
  title: string;
  message: string;
  status: 'sent' | 'read' | 'pending';
  read_at?: string | null;
  created_at: string;
}

export interface AdminMetrics {
  total_users: number;
  total_citizens: number;
  total_department_staff: number;
  total_complaints: number;
  open_complaints: number;
  in_progress_complaints: number;
  resolved_complaints: number;
  escalated_complaints: number;
  avg_resolution_hours: number;
  resolution_rate_percent: number;
  total_departments: number;
  total_categories: number;
}
