// Type definitions for the Compliance AI POC

export interface User {
  user_id: string;
  username: string;
  role: 'agent' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

export interface Rule {
  rule_id: string;
  rule_text: string;
  category: 'IRDAI' | 'Brand' | 'SEO';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  is_active: boolean;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RuleTriggered {
  rule_id: string;
  rule_text: string;
  category: string;
  severity: string;
  status: 'triggered' | 'violated';
}

export interface ContentSubmission {
  submission_id: string;
  user_id: string;
  input_type: 'prompt' | 'document';
  input_reference: string;
  final_content: string;
  compliance_status: 'compliant' | 'violations' | 'pending';
  rules_triggered: RuleTriggered[];
  approval_status?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ViolationDetail {
  chunk_text: string;
  violated_rules: RuleTriggered[];
  page_number?: number;
  section?: string;
}

export interface DuplicateMatch {
  rule_id: string;
  rule_text: string;
  similarity_score: number;
  match_type: 'exact' | 'semantic';
}

// Request types
export interface GenerateContentRequest {
  prompt: string;
  use_prompt_enhancer: boolean;
  user_id: string;
}

export interface CheckDocumentRequest {
  user_id: string;
  file: File;
}

export interface CreateRuleRequest {
  rule_text: string;
  category: 'IRDAI' | 'Brand' | 'SEO';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ApprovalRequest {
  admin_id: string;
  status: 'approved' | 'rejected';
  notes?: string;
}

// Response types
export interface GenerateContentResponse {
  submission_id: string;
  final_content: string;
  compliance_status: 'compliant' | 'violations' | 'pending';
  rules_triggered: RuleTriggered[];
  created_at: string;
}

export interface DocumentCheckResponse {
  submission_id: string;
  compliance_status: 'compliant' | 'violations' | 'pending';
  violations: ViolationDetail[];
  rules_triggered: RuleTriggered[];
}

export interface DuplicateCheckResponse {
  is_duplicate: boolean;
  matches: DuplicateMatch[];
}
