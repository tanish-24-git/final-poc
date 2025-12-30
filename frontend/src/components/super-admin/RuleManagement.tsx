import React, { useState, useEffect } from 'react';
import { superAdminAPI } from '../../services/api';
import type { Rule, CreateRuleRequest, DuplicateCheckResponse } from '../../types';



export function RuleManagement() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateRuleRequest>({
    rule_text: '',
    category: 'IRDAI',
    severity: 'MEDIUM',
  });
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResponse | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    loadRules();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await superAdminAPI.getDebugUser();
      setUserId(data.user_id);
    } catch (error) {
      console.error('Failed to load debug user:', error);
    }
  };

  const loadRules = async () => {
    try {
      const data = await superAdminAPI.listRules(true);
      setRules(data);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicate = async () => {
    if (!formData.rule_text.trim()) return;

    try {
      const result = await superAdminAPI.checkDuplicate(formData.rule_text);
      setDuplicateCheck(result);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleCreateRule = async () => {
    if (duplicateCheck?.is_duplicate) {
      if (!window.confirm('Duplicate rules detected. Do you still want to create this rule?')) {
        return;
      }
    }

    try {
      await superAdminAPI.createRule(formData, userId);
      alert('Rule created successfully');
      setFormData({ rule_text: '', category: 'IRDAI', severity: 'MEDIUM' });
      setDuplicateCheck(null);
      setShowForm(false);
      loadRules();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleExtractFromPDF = async () => {
    if (!pdfFile) return;

    setExtracting(true);
    try {
      const result = await superAdminAPI.extractRulesFromPDF(userId, pdfFile);
      alert(result.message);
      setPdfFile(null);
      loadRules();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setExtracting(false);
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await superAdminAPI.deactivateRule(ruleId, userId);
      } else {
        await superAdminAPI.activateRule(ruleId, userId);
      }
      loadRules();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Rule Management</h2>
        <p>Manage compliance rules, severity levels, and categories.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                System ID: {userId ? userId.substring(0, 8) + '...' : 'Loading...'}
            </span>
             <button className="btn-icon-circle" onClick={() => loadRules()} title="Refresh Rules">
                ⟳
             </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
         {/* Manual Creation Card */}
         <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Create New Rule</h3>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Rule Text</label>
              <textarea
                className="input-field"
                style={{ border: '1px solid var(--border-color)', borderRadius: '8px', minHeight: '80px', fontSize: '14px' }}
                value={formData.rule_text}
                onChange={(e) => setFormData({ ...formData, rule_text: e.target.value })}
                placeholder="Enter compliance rule text..."
              />
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Category</label>
                   <select
                    className="input-field"
                    style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    <option value="IRDAI">IRDAI</option>
                    <option value="Brand">Brand</option>
                    <option value="SEO">SEO</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Severity</label>
                    <select
                        className="input-field"
                        style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px' }}
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-link" onClick={checkDuplicate}>Check Duplicates</button>
                <button 
                  className="send-btn" 
                  onClick={handleCreateRule}
                  disabled={!formData.rule_text.trim()}
                  style={{ marginLeft: 'auto' }}
                >
                   Create Rule
                </button>
            </div>
            
            {duplicateCheck && (
               <div className={`info-box ${duplicateCheck.is_duplicate ? 'violations' : 'compliant'}`} style={{ marginTop: '16px' }}>
                 {duplicateCheck.is_duplicate ? (
                    <div>
                        <strong>⚠ Duplicate Detected</strong>
                        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                           {duplicateCheck.matches.map((m, i) => (
                               <li key={i}>{m.rule_text} ({Math.round(m.similarity_score * 100)}%)</li>
                           ))}
                        </ul>
                    </div>
                 ) : (
                    <div style={{ color: 'var(--success)' }}>✓ Unique Rule</div>
                 )}
               </div>
            )}
         </div>

         {/* PDF Extraction Card */}
         <div className="table-card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Extract from Document</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
               Upload a regulatory PDF to automatically extract and create compliance rules.
            </p>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="input-field"
              style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', marginBottom: '16px' }}
            />
            <button
                className="send-btn"
                onClick={handleExtractFromPDF}
                disabled={!pdfFile || extracting}
                style={{ width: '100%', justifyContent: 'center' }}
            >
                {extracting ? 'Processing Document...' : 'Extract Rules'}
            </button>
         </div>
      </div>

      <div className="table-card">
        <div className="admin-header" style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', marginBottom: 0 }}>
             <h3 style={{ margin: 0 }}>Active Rules Database</h3>
             <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total: {rules.length} Rules</span>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Rule Text</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.rule_id}>
                  <td>
                    <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{rule.rule_text}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>ID: {rule.rule_id} • v{rule.version}</div>
                  </td>
                  <td>
                    <span className={`badge-category badge-${rule.category.toLowerCase()}`}>
                        {rule.category}
                    </span>
                  </td>
                  <td>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`severity-dot ${rule.severity.toLowerCase()}`}></span>
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{rule.severity}</span>
                     </div>
                  </td>
                  <td>
                     <span className={`status-badge-sm ${rule.is_active ? 'compliant' : 'pending'}`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                     </span>
                  </td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => toggleRuleStatus(rule.rule_id, rule.is_active)}
                      style={{ color: rule.is_active ? 'var(--error)' : 'var(--success)' }}
                    >
                      {rule.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                  <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                          No rules found. Create one or extract from PDF.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
