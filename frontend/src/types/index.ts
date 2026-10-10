export interface User {
  id: number;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface Complaint {
  id: number;
  student_id: number;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  created_at: string;
  updated_at: string;
  support_count: number;
  student_email?: string;
  ai_category?: string;
  ai_priority?: string;
  similarity_matches?: SimilarComplaint[];
}

export interface SimilarComplaint {
  id: number;
  description: string;
  similarity_score: number;
}

export interface CreateComplaintRequest {
  description: string;
  evidence_files?: File[];
}

export interface SupportComplaintRequest {
  comment?: string;
  evidence_files?: File[];
}

export interface ComplaintDetail extends Complaint {
  progress_updates: ProgressUpdate[];
  resolution?: Resolution;
  supports: Support[];
}

export interface ProgressUpdate {
  id: number;
  complaint_id: number;
  admin_id: number;
  message: string;
  created_at: string;
  admin_email?: string;
}

export interface Resolution {
  id: number;
  complaint_id: number;
  admin_id: number;
  resolution_text: string;
  resolved_at: string;
  admin_email?: string;
  evidence?: Evidence[];
}

export interface Support {
  id: number;
  complaint_id: number;
  student_id: number;
  comment?: string;
  created_at: string;
  student_email?: string;
  evidence?: Evidence[];
}

export interface Evidence {
  id: number;
  complaint_id?: number;
  support_id?: number;
  resolution_id?: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

export interface ComplaintFilters {
  category?: string;
  priority?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}