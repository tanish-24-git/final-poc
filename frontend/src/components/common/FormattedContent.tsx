import React from 'react';

export const FormattedContent = ({ content }: { content: string }) => {
  const formatText = (text: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((para, idx) => {
      // Check if it's a bullet point list
      if (para.includes('\n-') || para.includes('\n•') || para.includes('\n*')) {
        const lines = para.split('\n');
        const items = lines.filter(line => line.trim().match(/^[-•*]/));
        
        if (items.length > 0) {
          return (
            <ul key={idx} style={{ marginBottom: '16px', paddingLeft: '24px', lineHeight: '1.8' }}>
              {items.map((item, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>
                  {item.replace(/^[-•*]\s*/, '')}
                </li>
              ))}
            </ul>
          );
        }
      }
      
      // Check if it's a numbered list
      if (para.match(/^\d+\./m)) {
        const lines = para.split('\n');
        const items = lines.filter(line => line.trim().match(/^\d+\./));
        
        if (items.length > 0) {
          return (
            <ol key={idx} style={{ marginBottom: '16px', paddingLeft: '24px', lineHeight: '1.8' }}>
              {items.map((item, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>
                  {item.replace(/^\d+\.\s*/, '')}
                </li>
              ))}
            </ol>
          );
        }
      }
      
      // Check if it's a heading (starts with ** or #)
      if (para.trim().startsWith('**') && para.trim().endsWith('**')) {
        const heading = para.replace(/\*\*/g, '');
        return (
          <h3 key={idx} style={{ 
            marginTop: '24px', 
            marginBottom: '16px', 
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--accent-color)',
            fontFamily: 'Outfit, sans-serif'
          }}>
            {heading}
          </h3>
        );
      }
      
      if (para.trim().startsWith('#')) {
        const heading = para.replace(/^#+\s*/, '');
        return (
          <h3 key={idx} style={{ 
            marginTop: '24px', 
            marginBottom: '16px', 
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--accent-color)',
            fontFamily: 'Outfit, sans-serif'
          }}>
            {heading}
          </h3>
        );
      }
      
      // Regular paragraph
      if (para.trim()) {
        const parts = para.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={idx} style={{ marginBottom: '16px', lineHeight: '1.7', fontSize: '15px' }}>
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.replace(/\*\*/g, '')}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
      
      return null;
    });
  };

  return <div className="formatted-content" style={{ fontSize: '15px' }}>{formatText(content)}</div>;
};
