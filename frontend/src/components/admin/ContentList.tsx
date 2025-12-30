import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import type { ContentSubmission } from '../../types';
import { FormattedContent } from '../common/FormattedContent';

const MOCK_ADMIN_ID = '00000000-0000-0000-0000-000000000002';

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
      alert(`Error: ${JSON.stringify(error.response?.data?.detail || error.message)}`);
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
      alert(`Error: ${JSON.stringify(error.response?.data?.detail || error.message)}`);
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
      alert(`Error: ${JSON.stringify(error.response?.data?.detail || error.message)}`);
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
      alert(`Error: ${JSON.stringify(error.response?.data?.detail || error.message)}`);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading submissions...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Content Submissions</h2>
        <p>Review and approve generated insurance content.</p>
      </div>

      <div className="table-card">
        {submissions.length === 0 ? (
          <div className="empty-table">No submissions found.</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '15%' }}>Type</th>
                  <th style={{ width: '15%' }}>Status</th>
                  <th style={{ width: '15%' }}>Approval</th>
                  <th style={{ width: '25%' }}>Created At</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.submission_id}>
                    <td><span className="type-badge">{sub.input_type || 'General'}</span></td>
                    <td>
                      <span className={`status-badge-sm ${sub.compliance_status}`}>
                        {sub.compliance_status || 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={`approval-badge ${sub.approval_status || 'pending'}`}>
                         {sub.approval_status || 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(sub.created_at).toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-link"
                        onClick={() => viewDetail(sub.submission_id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="drawer-overlay" onClick={() => { setSelectedId(null); setDetail(null); }}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
             <div className="drawer-header">
                <h3>Submission Details</h3>
                <button className="close-btn" onClick={() => { setSelectedId(null); setDetail(null); }}>×</button>
             </div>
             
             {detailLoading ? (
               <div className="loading-state">Loading details...</div>
             ) : (
               <div className="drawer-body">
                  <div className="detail-section">
                    <label>Input Reference</label>
                    <div className="info-box">{detail.input_reference}</div>
                  </div>

                  <div className="detail-section">
                     <label>Compliance Analysis</label>
                     <div className="compliance-summary">
                        <div className={`status-banner ${detail.compliance_status}`}>
                             <strong>Status:</strong> {detail.compliance_status.toUpperCase()}
                        </div>
                        
                        {detail.rules_triggered && detail.rules_triggered.length > 0 ? (
                          <div className="rules-list">
                             {detail.rules_triggered.map((rule, idx) => (
                               <div key={idx} className={`rule-card ${rule.status}`}>
                                  <div className="rule-header">
                                     <div style={{ display: 'flex', alignItems: 'center' }}>
                                         <span className={`badge-category badge-${rule.category.toLowerCase().replace(' ', '_')}`}>
                                            {rule.category}
                                         </span>
                                         <span className="rule-status">[{rule.status.toUpperCase()}]</span>
                                     </div>
                                     <span className={`severity-dot ${rule.severity}`}></span>
                                  </div>
                                  <div className="rule-text">{rule.rule_text}</div>
                               </div>
                             ))}
                          </div>
                        ) : (
                          <div className="no-issues">No compliance issues detected.</div>
                        )}
                     </div>
                  </div>

                  <div className="detail-section">
                    <label>Final Content</label>
                    <div className="content-preview">
                      <FormattedContent content={detail.final_content} />
                    </div>
                  </div>

                  <div className="drawer-footer">
                    {!detail.approval_status ? (
                       <>
                         <button className="btn-approve" onClick={handleApprove}>Approve</button>
                         <button className="btn-reject" onClick={handleReject}>Reject</button>
                       </>
                    ) : (
                       <div className="status-locked">
                          This content has been <strong>{detail.approval_status}</strong>.
                       </div>
                    )}
                  </div>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
