import React from 'react';

interface ConfidenceSymbolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConfidenceSymbolsModal: React.FC<ConfidenceSymbolsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            margin: 0,
            color: '#333',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            Confidence Symbols
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ lineHeight: '1.6' }}>
          <ul style={{ paddingLeft: '0', margin: 0, textAlign: 'left' }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong>(NO SYMBOL) Full Confidence (15+ plate appearances)</strong>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong>⚡ Medium Confidence (8-14 plate appearances)</strong>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong>⚠️ Low Confidence (4-7 plate appearances)</strong>
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong>🚫 Excluded (Under 4 plate appearances)</strong>
            </li>
          </ul>
          
          <div style={{ 
            marginTop: '1rem', 
            textAlign: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #e9ecef'
          }}>
            <a 
              href="/help" 
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                const newWindow = window.open('/help', '_blank');
                if (newWindow) {
                  newWindow.onload = () => {
                    setTimeout(() => {
                      newWindow.location.hash = '#confidence-system';
                    }, 100);
                  };
                }
              }}
              style={{ 
                color: '#007bff', 
                textDecoration: 'underline',
                fontSize: '0.9rem',
                cursor: 'pointer',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.backgroundColor = 'transparent';
              }}
            >
              More info ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceSymbolsModal;
