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
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Rule Management</h2>
          <span style={{ fontSize: '12px', color: '#666' }}>
            User ID: {userId ? userId.substring(0, 8) + '...' : 'Loading...'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create New Rule'}
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <h3>Create New Rule</h3>

            <div className="form-group">
              <label>Rule Text</label>
              <textarea
                className="textarea"
                value={formData.rule_text}
                onChange={(e) => setFormData({ ...formData, rule_text: e.target.value })}
                placeholder="Enter rule text..."
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="IRDAI">IRDAI</option>
                <option value="Brand">Brand</option>
                <option value="SEO">SEO</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity</label>
              <select
                className="input"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            <button className="btn" onClick={checkDuplicate} style={{ marginRight: '10px' }}>
              Check for Duplicates
            </button>

            {duplicateCheck && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: duplicateCheck.is_duplicate ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)', borderRadius: '4px' }}>
                {duplicateCheck.is_duplicate ? (
                  <div>
                    <strong style={{ color: 'var(--error-color)' }}>⚠ Duplicate Detected!</strong>
                    <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                      {duplicateCheck.matches.map((match, idx) => (
                        <li key={idx}>
                          {match.match_type === 'exact' ? '🔴 Exact Match' : '🟡 Semantic Match'} (
                          {(match.similarity_score * 100).toFixed(0)}%): {match.rule_text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <strong style={{ color: 'var(--success-color)' }}>✓ No duplicates found</strong>
                )}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleCreateRule}
              style={{ marginTop: '10px' }}
              disabled={!formData.rule_text.trim()}
            >
              Create Rule
            </button>
          </div>
        )}

        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          <h3>Extract Rules from PDF</h3>
          <div className="form-group">
            <label>Upload PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="input"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleExtractFromPDF}
            disabled={!pdfFile || extracting}
          >
            {extracting ? 'Extracting...' : 'Extract Rules'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3>All Rules ({rules.length})</h3>
        {loading ? (
          <div>Loading...</div>
        ) : rules.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No rules created yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rule Text</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Version</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.rule_id}>
                  <td style={{ maxWidth: '400px' }}>{rule.rule_text}</td>
                  <td>{rule.category}</td>
                  <td>
                    <span className={`severity-badge severity-${rule.severity.toLowerCase()}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td>v{rule.version}</td>
                  <td>{rule.is_active ? '✓ Active' : '✗ Inactive'}</td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => toggleRuleStatus(rule.rule_id, rule.is_active)}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      {rule.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
