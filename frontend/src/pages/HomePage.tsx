import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '60px 20px'
    }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div style={{ marginBottom: '24px' }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto' }}>
            <defs>
              <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#003087' }} />
                <stop offset="100%" style={{ stopColor: '#00AEEF' }} />
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#hero-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="3" fill="url(#hero-gradient)" opacity="0.3"/>
          </svg>
        </div>
        <h1 style={{ 
          fontSize: '56px', 
          marginBottom: '24px',
          color: 'var(--text-primary)',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 800,
          letterSpacing: '-2px',
          lineHeight: 1.1
        }}>
          Bajaj Compliance AI
        </h1>
        <p style={{ 
          fontSize: '22px', 
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto 40px',
          lineHeight: 1.6
        }}>
          AI-powered insurance content generation with real-time regulatory compliance validation against IRDAI, Brand Guidelines, and SEO standards.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/agent" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Generate Content
            </button>
          </Link>
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Review Submissions
            </button>
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '80px'
      }}>
        <Link to="/agent" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '32px',
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-color)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'rgba(0, 48, 135, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M16 13H8M16 17H8M10 9H8"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>
              AI Content Generation
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              Generate insurance policy descriptions, terms, and marketing content with AI assistance while ensuring compliance.
            </p>
          </div>
        </Link>

        <div style={{ 
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '32px',
          height: '100%'
        }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'rgba(0, 174, 239, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bajaj-light-blue)" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>
            Regulatory Compliance
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            Real-time validation against IRDAI regulations, brand guidelines, and SEO standards to ensure all content meets requirements.
          </p>
        </div>

        <Link to="/super-admin" style={{ textDecoration: 'none' }}>
          <div style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '32px',
            height: '100%',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-color)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'rgba(188, 155, 51, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--bajaj-gold)" strokeWidth="2">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>
              Rule Management
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
              Configure and manage compliance rules, categories, and validation criteria for precise control over content standards.
            </p>
          </div>
        </Link>
      </div>

      {/* How It Works */}
      <div style={{ 
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '60px 40px',
        marginBottom: '80px'
      }}>
        <h2 style={{ 
          fontSize: '36px', 
          marginBottom: '16px', 
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontWeight: 700
        }}>
          How It Works
        </h2>
        <p style={{ 
          fontSize: '16px', 
          color: 'var(--text-secondary)', 
          textAlign: 'center',
          marginBottom: '48px',
          maxWidth: '600px',
          margin: '0 auto 48px'
        }}>
          Three simple steps to generate compliant insurance content
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'var(--accent-color)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px',
              fontWeight: 700
            }}>
              1
            </div>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Input Your Request
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Describe the insurance content you need or upload existing documents for validation
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'var(--accent-color)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px',
              fontWeight: 700
            }}>
              2
            </div>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
              AI Processing
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Our AI generates content while simultaneously validating against all compliance rules
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'var(--accent-color)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px',
              fontWeight: 700
            }}>
              3
            </div>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
              Review & Deploy
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Receive compliant content ready for review, approval, and deployment
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '40px',
        padding: '40px 0',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ 
            fontSize: '56px', 
            fontWeight: 800, 
            color: 'var(--accent-color)', 
            marginBottom: '8px',
            fontFamily: 'Outfit, sans-serif'
          }}>
            100%
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Compliance Validation
          </div>
        </div>
        <div>
          <div style={{ 
            fontSize: '56px', 
            fontWeight: 800, 
            color: 'var(--accent-color)', 
            marginBottom: '8px',
            fontFamily: 'Outfit, sans-serif'
          }}>
            Real-Time
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Rule Processing
          </div>
        </div>
        <div>
          <div style={{ 
            fontSize: '56px', 
            fontWeight: 800, 
            color: 'var(--accent-color)', 
            marginBottom: '8px',
            fontFamily: 'Outfit, sans-serif'
          }}>
            Multi-Layer
          </div>
          <div style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Regulatory Check
          </div>
        </div>
      </div>
    </div>
  );
}
