import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string) {
    const response = await this.client.post('/auth/register', { email, password });
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Complaint endpoints
  async getComplaints(params?: {
    category?: string;
    priority?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get('/complaints', { params });
    return response.data;
  }

  async getComplaint(id: number) {
    const response = await this.client.get(`/complaints/${id}`);
    return response.data;
  }

  async createComplaint(description: string, evidenceFiles?: File[]) {
    const formData = new FormData();
    formData.append('description', description);
    if (evidenceFiles) {
      evidenceFiles.forEach((file) => {
        formData.append('evidence_files', file);
      });
    }
    const response = await this.client.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async supportComplaint(complaintId: number, comment?: string, evidenceFiles?: File[]) {
    const formData = new FormData();
    if (comment) formData.append('comment', comment);
    if (evidenceFiles) {
      evidenceFiles.forEach((file) => {
        formData.append('evidence_files', file);
      });
    }
    const response = await this.client.post(`/complaints/${complaintId}/support`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Admin endpoints
  async assignComplaint(complaintId: number) {
    const response = await this.client.post(`/admin/complaints/${complaintId}/assign`);
    return response.data;
  }

  async updateComplaintStatus(complaintId: number, status: string) {
    const response = await this.client.patch(`/admin/complaints/${complaintId}/status`, { status });
    return response.data;
  }

  async addProgressUpdate(complaintId: number, message: string) {
    const response = await this.client.post(`/admin/complaints/${complaintId}/progress`, { message });
    return response.data;
  }

  async resolveComplaint(complaintId: number, resolutionText: string, evidenceFiles?: File[]) {
    const formData = new FormData();
    formData.append('resolution_text', resolutionText);
    if (evidenceFiles) {
      evidenceFiles.forEach((file) => {
        formData.append('evidence_files', file);
      });
    }
    const response = await this.client.post(`/admin/complaints/${complaintId}/resolve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const api = new ApiService();