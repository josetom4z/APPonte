import { api } from './api';
import {
  RequestItem,
  RequestCommentItem,
  PaginatedResponse,
  RequestCategory,
  Department,
} from '../types';

export const requestService = {
  async getFeed(params?: {
    tenantId?: string;
    departmentId?: string;
    categoryId?: string;
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    authorId?: string;
    assignedToUserId?: string;
  }): Promise<PaginatedResponse<RequestItem>> {
    return api.get('/requests', { params });
  },

  async getForMap(params?: {
    tenantId?: string;
    status?: string;
    categoryId?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
  }): Promise<RequestItem[]> {
    return api.get('/requests/map', { params });
  },

  async getById(idOrProtocol: string): Promise<RequestItem> {
    return api.get(`/requests/${idOrProtocol}`);
  },

  async create(data: any): Promise<RequestItem> {
    return api.post('/requests', data);
  },

  async updateStatus(
    id: string,
    data: {
      status: string;
      comment?: string;
      evidenceMedia?: any[];
      assignedToUserId?: string;
    },
  ): Promise<RequestItem> {
    return api.patch(`/requests/${id}/status`, data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return api.delete(`/requests/${id}`);
  },

  // Comments
  async getComments(requestId: string): Promise<RequestCommentItem[]> {
    return api.get(`/request-comments/by-request/${requestId}`);
  },

  async addComment(data: {
    requestId: string;
    content: string;
    media?: any[];
    isInternal?: boolean;
  }): Promise<RequestCommentItem> {
    return api.post('/request-comments', data);
  },

  async deleteComment(commentId: string): Promise<{ message: string }> {
    return api.delete(`/request-comments/${commentId}`);
  },

  // Supports
  async toggleSupport(requestId: string): Promise<{ supported: boolean; supportsCount: number }> {
    return api.post(`/request-supports/${requestId}/toggle`);
  },

  async checkSupport(requestId: string): Promise<{ supported: boolean }> {
    return api.get(`/request-supports/${requestId}/status`);
  },

  async getMySupports(): Promise<string[]> {
    return api.get('/request-supports/my-supports');
  },

  // Categories and Departments
  async getCategories(tenantId: string, departmentId?: string): Promise<RequestCategory[]> {
    return api.get(`/request-categories/by-tenant/${tenantId}`, {
      params: { departmentId },
    });
  },

  async getDepartments(tenantId: string): Promise<Department[]> {
    return api.get(`/departments/by-tenant/${tenantId}`);
  },

  // File Upload
  async uploadFile(
    file: File | Blob,
    customFilename?: string,
  ): Promise<{ url: string; filename: string; type: string }> {
    const formData = new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      formData.append('file', file, customFilename || `foto-${Date.now()}.jpg`);
    }
    return api.post('/uploads/file', formData);
  },
};
