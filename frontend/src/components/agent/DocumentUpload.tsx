import React, { useState } from 'react';
import { agentAPI } from '../../services/api';
import type { DocumentCheckResponse, ViolationDetail } from '../../types';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const  [result, setResult] = useState<DocumentCheckResponse | null>(null);
  const [rewriteLoading, setRewriteLoading] = useState<number | null>(null);
  const [rewrittenTexts, setRewrittenTexts] = useState<Record<number, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setRewrittenTexts({});
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const response = await agentAPI.checkDocument(MOCK_USER_ID, file);
      setResult(response);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (violation: ViolationDetail, index: number) => {
    if (!result) return;

    setRewriteLoading(index);
    try {
      const response = await agentAPI.rewriteContent(
        result.submission_id,
        violation.chunk_text
      );
      setRewrittenTexts(prev => ({
        ...prev,
        [index]: response.compliant_text,
      }));
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setRewriteLoading(null);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Document Compliance Check</h2>
        <p>Upload documents to verify compliance with IRDAI, Brand, and SEO regulations</p>
      </div>

      <div className="table-card" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Upload Document
          </label>
          <input
            type="file"
            accept=".pdf,.docx,.doc,.md,.txt"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px dashed var(--border-color)',
              borderRadius: '8px',
              background: 'var(--bg-secondary)',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          />
          {file && (
            <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Selected: {file.name}
            </p>
          )}
        </div>

        <button
          className="btn-regenerate"
          onClick={handleUpload}
          disabled={!file || loading}
          style={{ marginBottom: '24px' }}
        >
          {loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              Checking...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Check Compliance
            </>
          )}
        </button>

        {result && (
          <div>
            <div style={{ 
              padding: '16px', 
              background: result.compliance_status === 'compliant' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${result.compliance_status === 'compliant' ? 'var(--success)' : 'var(--error)'}`,
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {result.compliance_status === 'compliant' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                )}
                <h3 style={{ margin: 0, fontSize: '18px', color: result.compliance_status === 'compliant' ? 'var(--success)' : 'var(--error)' }}>
                  {result.compliance_status.toUpperCase()}
                </h3>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                {result.rules_triggered.length} rules triggered
              </p>
            </div>

            {result.violations.length > 0 ? (
              <div>
                <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Violations Found</h4>
                {result.violations.map((violation, idx) => (
                  <div key={idx} className="violation-card">
                    <div className="violation-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <strong style={{ color: 'var(--text-primary)' }}>Violating Text</strong>
                        {violation.page_number && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            (Page {violation.page_number})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="violation-text-content">
                      {violation.chunk_text}
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        Violated Rules:
                      </strong>
                      <ul className="violated-rules-list">
                        {violation.violated_rules.map((rule, rIdx) => (
                          <li key={rIdx}>
                            <span className={`badge-category badge-${rule.category.toLowerCase().replace(' ', '_')}`}>
                              {rule.category}
                            </span>{' '}
                            <span style={{ color: 'var(--text-primary)' }}>{rule.rule_text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="regeneration-section">
                      <button
                        className="btn-regenerate"
                        onClick={() => handleRegenerate(violation, idx)}
                        disabled={rewriteLoading === idx}
                      >
                        {rewriteLoading === idx ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                            </svg>
                            Regenerate Compliant Version
                          </>
                        )}
                      </button>

                      {rewrittenTexts[idx] && (
                        <div className="regenerated-content">
                          <div className="regenerated-header">
                            <div className="regenerated-label">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Compliant Version
                            </div>
                            <button className="btn-copy" onClick={() => copyText(rewrittenTexts[idx])}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              Copy
                            </button>
                          </div>
                          <div className="regenerated-text">
                            {rewrittenTexts[idx]}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: 'var(--success)', 
                background: 'rgba(16, 185, 129, 0.05)',
                borderRadius: '8px'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto', marginBottom: '16px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  No violations found - document is compliant!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
