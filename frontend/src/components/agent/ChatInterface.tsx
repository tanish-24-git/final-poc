import React, { useState, useEffect, useRef } from 'react';
import { agentAPI } from '../../services/api';
import type { GenerateContentResponse } from '../../types';
import { FormattedContent } from '../common/FormattedContent';

// Hardcoded for demo purposes
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

const QUICK_ACTIONS = [
  { 
    id: 'term',
    title: 'Term Insurance', 
    subtitle: 'Generate compliant policy content', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    prompt: 'Generate a comprehensive description for a Term Insurance Plan including key benefits and exclusions.'
  },
  { 
    id: 'health',
    title: 'Health Policy', 
    subtitle: 'Family floater wording', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    prompt: 'Create detailed policy wording for a Family Floater Health Insurance plan coverage.'
  },
  { 
    id: 'motor',
    title: 'Car Insurance', 
    subtitle: 'Zero-depreciation terms', 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <line x1="16" y1="8" x2="20" y2="8" />
        <line x1="16" y1="16" x2="23" y2="16" />
        <path d="M1 10H16" />
      </svg>
    ),
    prompt: 'Draft the terms and conditions for a Zero Depreciation add-on for Car Insurance.'
  },
];

interface Message {
  role: 'user' | 'system';
  content: string;
  data?: GenerateContentResponse;
  timestamp: Date;
}

export function ChatInterface() {
  const [prompt, setPrompt] = useState('');
  const [useGuard, setUseGuard] = useState(true);
  const [loadingMode, setLoadingMode] = useState<'idle' | 'generating' | 'analyzing'>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerate = async (customPrompt?: string) => {
    const textToProcess = customPrompt || prompt;
    if (!textToProcess.trim()) return;

    setLoadingMode('generating');
    const userMsg: Message = { role: 'user', content: textToProcess, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');

    try {
      const response = await agentAPI.generateContent({
        prompt: textToProcess,
        use_prompt_enhancer: useGuard,
        user_id: MOCK_USER_ID,
      });

      const sysMsg: Message = {
        role: 'system',
        content: response.final_content,
        data: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, sysMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        role: 'system',
        content: `Something went wrong: ${err.message || 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoadingMode('idle');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingMode('analyzing');
    const userMsg: Message = { 
      role: 'user', 
      content: `[Document Upload] ${file.name}\nChecking for compliance violations...`, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('http://localhost:8000/agent/check-document?user_id=' + MOCK_USER_ID, {
         method: 'POST',
         body: formData,
      });
      
      if (!res.ok) {
         const errText = await res.text();
         throw new Error(`Upload failed (${res.status}): ${errText}`);
      }
      const data = await res.json();
      
      // Format the report
      let reportContent = `**Document Analysis Report**\n\n`;
      reportContent += `**Status**: ${data.compliance_status === 'compliant' ? 'COMPLIANT' : 'VIOLATIONS DETECTED'}\n\n`;
      
      if (data.violations.length > 0) {
          reportContent += `**Violations Found**:\n`;
          data.violations.forEach((v: any) => {
              v.violated_rules.forEach((rule: any) => {
                  reportContent += `\n**${rule.category} [VIOLATED]**\n${rule.rule_text}\n> *"${v.chunk_text.substring(0, 100)}..."*\n`;
              });
          });
      } else {
          reportContent += `No violations found. Document appears compliant.\n`;
      }

      const sysMsg: Message = {
        role: 'system',
        content: reportContent,
        data: { 
            submission_id: 'doc-analysis-' + Date.now(),
            final_content: reportContent, 
            compliance_status: data.compliance_status, 
            rules_triggered: data.rules_triggered,
            created_at: new Date().toISOString()
        },
        timestamp: new Date()
      };
      setMessages(prev => [...prev, sysMsg]);

    } catch (err: any) {
      const errorMsg: Message = {
        role: 'system',
        content: `Error checking document: ${err.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoadingMode('idle');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
  };



  return (
    <div className="chat-layout">
      {/* Scrollable Area */}
      <div className="chat-scroll-area">
        {messages.length === 0 && (
          <div className="welcome-hero">
            <div className="hero-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--bajaj-blue)" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="hero-title">B ajaj Compliance AI</h1>
            <p className="hero-subtitle">
              AI-powered insurance content generation with real-time regulatory compliance validation
            </p>

            <div className="cards-grid">
              {QUICK_ACTIONS.map((action) => (
                <div 
                  key={action.id} 
                  className="prompt-card"
                  onClick={() => handleGenerate(action.prompt)}
                >
                  <div className="card-icon">{action.icon}</div>
                  <div className="card-title">{action.title}</div>
                  <div className="card-desc">{action.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="message-row">
            <div className={`avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
              {msg.role === 'user' ? 'U' : 'AI'}
            </div>
            <div className={`message-bubble ${msg.role === 'user' ? 'user' : ''}`}>
              {msg.role === 'user' ? (
                 <div className="user-text">
                    {msg.content}
                 </div>
              ) : (
                <>
                  <FormattedContent content={msg.content} />
                  
                  {msg.data?.rules_triggered && msg.data.rules_triggered.some(r => r.status === 'violated') && (
                    <div className="compliance-report-card">
                      <div className="status-banner violations">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                           <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                           <line x1="12" y1="9" x2="12" y2="13"/>
                           <line x1="12" y1="17" x2="12.01" y2="17"/>
                         </svg>
                         <strong>Compliance Violations Detected</strong>
                      </div>
                      
                      <div className="rules-list" style={{ padding: '12px' }}>
                        {msg.data.rules_triggered.filter(r => r.status === 'violated').map((rule, i) => (
                           <div key={i} className="rule-card violated" style={{ background: 'var(--bg-primary)' }}>
                              <div className="rule-header">
                                 <div style={{ display: 'flex', alignItems: 'center' }}>
                                     <span className={`badge-category badge-${rule.category.toLowerCase().replace(' ', '_')}`}>
                                        {rule.category}
                                     </span>
                                     <span className="rule-status" style={{ fontSize: '11px', fontWeight: 700 }}>
                                        [VIOLATED]
                                     </span>
                                 </div>
                              </div>
                              <div className="rule-text" style={{ marginTop: '4px', fontSize: '13px' }}>
                                {rule.rule_text}
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions & Status */}
                  <div className="message-actions">
                    <div className="status-tags">
                        {msg.data?.compliance_status === 'compliant' && (
                          <span className="status-tag compliant">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '4px' }}>
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Compliant
                          </span>
                        )}
                        {msg.data?.compliance_status === 'violations' && (
                          <span className="status-tag violations">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '4px' }}>
                              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                              <line x1="12" y1="9" x2="12" y2="13"/>
                              <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            VIOLATIONS DETECTED
                          </span>
                        )}
                    </div>
                    
                    <button 
                        className="btn-icon" 
                        onClick={() => copyContent(msg.content)}
                        title="Copy to Clipboard"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        
        {loadingMode !== 'idle' && (
          <div className="message-row">
            <div className="avatar ai">AI</div>
            <div className="message-bubble">
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '16px', height: '16px', border: '2px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {loadingMode === 'analyzing' ? 'Analyzing document...' : 'Generating content...'}
                  </span>
               </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Dock */}
      <div className="input-dock">
        <div className="input-wrapper">
          <textarea
            className="input-field"
            placeholder="Describe the insurance content you need..."
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loadingMode !== 'idle'}
          />
          <div className="input-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Upload Button */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                  accept=".pdf,.docx,.txt"
                />
                <button 
                  className="btn-icon-circle"
                  onClick={triggerFileUpload}
                  title="Upload Document to Check Violations"
                >
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                   </svg>
                </button>

                <div 
                  className="toggle-switch"
                  onClick={() => setUseGuard(!useGuard)}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '18px', 
                    background: useGuard ? 'var(--success)' : 'var(--border-color)', 
                    borderRadius: '10px', 
                    position: 'relative',
                    transition: 'background 0.2s'
                  }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      background: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: useGuard ? '16px' : '2px',
                      transition: 'left 0.2s'
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Compliance Guard
                  </span>
                </div>
            </div>

            <button 
              className="send-btn" 
              onClick={() => handleGenerate()}
              disabled={!prompt.trim() || loadingMode !== 'idle'}
            >
              Generate
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
