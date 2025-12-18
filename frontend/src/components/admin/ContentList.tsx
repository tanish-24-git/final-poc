import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import type { ContentSubmission } from '../../types';

const MOCK_ADMIN_ID = 'admin-user-id';

export function ContentList() {
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<ContentSubmission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const data = await adminAPI.listContent();
      setSubmissions(data);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (id: string) => {
    setSelectedId(id);
    setDetailLoading(true);
    try {
      const data = await adminAPI.getContentDetail(id);
      setDetail(data);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedId) return;

    try {
      await adminAPI.approveContent(selectedId, {
        admin_id: MOCK_ADMIN_ID,
        status: 'approved',
      });
      alert('Content approved successfully');
      loadSubmissions();
      setSelectedId(null);
      setDetail(null);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;

    try {
      await adminAPI.rejectContent(selectedId, {
        admin_id: MOCK_ADMIN_ID,
        status: 'rejected',
      });
      alert('Content rejected successfully');
      loadSubmissions();
      setSelectedId(null);
      setDetail(null);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card">
      <h2>Content Submissions</h2>

      {submissions.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No content submissions yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>Approval</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.submission_id}>
                <td>{sub.input_type}</td>
                <td>
                  <span className={`status-${sub.compliance_status}`}>
                    {sub.compliance_status}
                  </span>
                </td>
                <td>{sub.approval_status || 'Pending'}</td>
                <td>{new Date(sub.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="btn"
                    onClick={() => viewDetail(sub.submission_id)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detail && (
        <div style={{ marginTop: '30px', borderTop: '2px solid var(--border-color)', paddingTop: '20px' }}>
          <h3>Content Detail</h3>
          
          {detailLoading ? (
            <div>Loading details...</div>
          ) : (
            <div>
              <div className="form-group">
                <label>Input Reference:</label>
                <p>{detail.input_reference}</p>
              </div>

              <div className="form-group">
                <label>Final Content:</label>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                  {detail.final_content}
                </div>
              </div>

              <div className="form-group">
                <label>Compliance Status:</label>
                <p className={`status-${detail.compliance_status}`}>
                  {detail.compliance_status.toUpperCase()}
                </p>
              </div>

              <div className="form-group">
                <label>Rules Triggered ({detail.rules_triggered?.length || 0}):</label>
                {detail.rules_triggered && detail.rules_triggered.length > 0 ? (
                  <ul style={{ marginLeft: '20px' }}>
                    {detail.rules_triggered.map((rule, idx) => (
                      <li key={idx} style={{ marginBottom: '10px' }}>
                        <span className={`severity-badge severity-${rule.severity.toLowerCase()}`}>
                          {rule.severity}
                        </span>{' '}
                        <span
                          style={{
                            color: rule.status === 'violated' ? 'var(--error-color)' : 'var(--text-primary)',
                            fontWeight: rule.status === 'violated' ? 'bold' : 'normal',
                          }}
                        >
                          [{rule.status.toUpperCase()}]
                        </span>{' '}
                        [{rule.category}] {rule.rule_text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No rules triggered</p>
                )}
              </div>

              {!detail.approval_status && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-success" onClick={handleApprove}>
                    Approve Content
                  </button>
                  <button className="btn btn-danger" onClick={handleReject}>
                    Reject Content
                  </button>
                </div>
              )}

              {detail.approval_status && (
                <div style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>
                  <strong>Status:</strong> {detail.approval_status}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
