import React, { useState } from 'react';
import { agentAPI } from '../../services/api';
import type { DocumentCheckResponse, ViolationDetail } from '../../types';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'; // Valid AGENT UUID

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentCheckResponse | null>(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
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

  const handleRewrite = async (violation: ViolationDetail, index: number) => {
    if (!result) return;

    setRewriteLoading(true);
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
      setRewriteLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Document Compliance Check</h2>
      
      <div className="form-group">
        <label>Upload Document (PDF, DOCX, MD, TXT)</label>
        <input
          type="file"
          accept=".pdf,.docx,.doc,.md,.txt"
          onChange={handleFileChange}
          className="input"
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? 'Checking...' : 'Check Compliance'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>
            Compliance Status:{' '}
            <span className={`status-${result.compliance_status}`}>
              {result.compliance_status.toUpperCase()}
            </span>
          </h3>

          <p style={{ color: 'var(--text-secondary)' }}>
            {result.rules_triggered.length} rules triggered
          </p>

          {result.violations.length > 0 ? (
            <div>
              <h4>Violations Found:</h4>
              {result.violations.map((violation, idx) => (
                <div key={idx} className="violation-text" style={{ marginBottom: '20px' }}>
                  <div>
                    <strong>Violating Text:</strong>
                    {violation.page_number && (
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '10px' }}>
                        (Page {violation.page_number})
                      </span>
                    )}
                  </div>
                  <p>{violation.chunk_text}</p>

                  <div style={{ marginTop: '10px' }}>
                    <strong>Violated Rules:</strong>
                    <ul style={{ marginLeft: '20px' }}>
                      {violation.violated_rules.map((rule, rIdx) => (
                        <li key={rIdx}>
                          <span className={`severity-badge severity-${rule.severity.toLowerCase()}`}>
                            {rule.severity}
                          </span>{' '}
                          [{rule.category}] {rule.rule_text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="btn"
                    onClick={() => handleRewrite(violation, idx)}
                    disabled={rewriteLoading}
                    style={{ marginTop: '10px' }}
                  >
                    {rewriteLoading ? 'Rewriting...' : 'Rewrite Compliantly'}
                  </button>

                  {rewrittenTexts[idx] && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                      <strong>Compliant Version:</strong>
                      <p>{rewrittenTexts[idx]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--success-color)', marginTop: '10px' }}>
              ✓ No violations found - document is compliant!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
