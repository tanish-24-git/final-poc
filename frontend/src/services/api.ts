import axios from 'axios';
import type {
  GenerateContentRequest,
  GenerateContentResponse,
  DocumentCheckResponse,
  ContentSubmission,
  Rule,
  CreateRuleRequest,
  DuplicateCheckResponse,
  ApprovalRequest
} from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agent APIs
export const agentAPI = {
  generateContent: async (data: GenerateContentRequest): Promise<GenerateContentResponse> => {
    const response = await api.post('/agent/generate', data);
    return response.data;
  },

  checkDocument: async (userId: string, file: File): Promise<DocumentCheckResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/agent/check-document?user_id=${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  rewriteContent: async (submissionId: string, violationText: string): Promise<{ compliant_text: string }> => {
    const response = await api.post('/agent/rewrite', {
      submission_id: submissionId,
      violation_text: violationText,
    });
    return response.data;
  },
};

// Admin APIs
export const adminAPI = {
  listContent: async (limit: number = 50, offset: number = 0): Promise<ContentSubmission[]> => {
    const response = await api.get(`/admin/content?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getContentDetail: async (submissionId: string): Promise<ContentSubmission> => {
    const response = await api.get(`/admin/content/${submissionId}`);
    return response.data;
  },

  approveContent: async (submissionId: string, request: ApprovalRequest): Promise<{ message: string }> => {
    const response = await api.post(`/admin/content/${submissionId}/approve`, request);
    return response.data;
  },

  rejectContent: async (submissionId: string, request: ApprovalRequest): Promise<{ message: string }> => {
    const response = await api.post(`/admin/content/${submissionId}/reject`, request);
    return response.data;
  },
};

// Super Admin APIs
export const superAdminAPI = {
  createRule: async (data: CreateRuleRequest, createdBy: string): Promise<Rule> => {
    const response = await api.post(`/super-admin/rules?created_by=${createdBy}`, data);
    return response.data;
  },

  extractRulesFromPDF: async (createdBy: string, file: File): Promise<{ message: string; rules: Rule[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/super-admin/rules/extract?created_by=${createdBy}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  listRules: async (includeInactive: boolean = false): Promise<Rule[]> => {
    const response = await api.get(`/super-admin/rules?include_inactive=${includeInactive}`);
    return response.data;
  },

  updateRule: async (ruleId: string, data: Partial<CreateRuleRequest>, updatedBy: string): Promise<Rule> => {
    const response = await api.put(`/super-admin/rules/${ruleId}?updated_by=${updatedBy}`, data);
    return response.data;
  },

  activateRule: async (ruleId: string, actorId: string): Promise<{ message: string; rule: Rule }> => {
    const response = await api.post(`/super-admin/rules/${ruleId}/activate?actor_id=${actorId}`);
    return response.data;
  },

  deactivateRule: async (ruleId: string, actorId: string): Promise<{ message: string; rule: Rule }> => {
    const response = await api.post(`/super-admin/rules/${ruleId}/deactivate?actor_id=${actorId}`);
    return response.data;
  },

  checkDuplicate: async (ruleText: string): Promise<DuplicateCheckResponse> => {
    const response = await api.post('/super-admin/rules/check-duplicate', {
      rule_text: ruleText,
    });
    return response.data;
  },
};

export default api;
