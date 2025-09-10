import React, { useEffect, useRef } from 'react';

interface StrategyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StrategyInfoModal: React.FC<StrategyInfoModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleHelpClick = () => {
    window.open('/help', '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          outline: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{
          margin: '0 0 1.5rem 0',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center'
        }}>
          Strategy Comparison
        </h2>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <img
                src="/mlblogo.png"
                alt="MLB Logo"
                style={{
                  width: '60px',
                  height: '45px',
                  objectFit: 'contain',
                  marginRight: '0.75rem'
                }}
              />
              <h3 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#007bff'
              }}>
                Traditional Baseball Strategy
              </h3>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.95rem',
              color: '#666',
              lineHeight: '1.5'
            }}>
              Simple, proven approach that's easy to understand and explain to players and parents
            </p>
          </div>

          <div style={{
            padding: '1rem',
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            backgroundColor: '#f8f9fa'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <img
                src="/situational strategy.png"
                alt="Situational Strategy Logo"
                style={{
                  width: '60px',
                  height: '45px',
                  objectFit: 'contain',
                  marginRight: '0.75rem'
                }}
              />
              <h3 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#28a745'
              }}>
                Situational Analytics Strategy
              </h3>
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.95rem',
              color: '#666',
              lineHeight: '1.5'
            }}>
              Advanced metrics for situational play and game theory
            </p>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          paddingTop: '1rem',
          borderTop: '1px solid #e9ecef'
        }}>
          <button
            onClick={handleHelpClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            More info ↗
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyInfoModal;
