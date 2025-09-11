import React, { useState } from 'react';

interface PDFCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: PDFExportOptions) => void;
  teamName: string;
}

export interface PDFExportOptions {
  coachName: string;
  opponent: string;
  date: string;
  showFieldingPositions: boolean;
}

const PDFCustomizationModal: React.FC<PDFCustomizationModalProps> = ({
  isOpen,
  onClose,
  onExport,
  teamName
}) => {
  const [coachName, setCoachName] = useState('');
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [showFieldingPositions, setShowFieldingPositions] = useState(true);

  const handleExport = () => {
    onExport({
      coachName,
      opponent,
      date,
      showFieldingPositions
    });
  };

  const handleCancel = () => {
    // Reset to defaults
    setCoachName('');
    setOpponent('');
    setDate(new Date().toLocaleDateString());
    setShowFieldingPositions(true);
    onClose();
  };

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
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Customize PDF Export
          </h2>
          <button
            onClick={handleCancel}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Coach Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>
              Coach Name
            </label>
            <input
              type="text"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Enter coach name"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Opponent */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>
              Opponent
            </label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="Enter opponent team name"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Date */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>
              Game Date
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="MM/DD/YYYY"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          {/* Fielding Positions Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '4px'
              }}>
                Show Fielding Positions
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666'
              }}>
                Include the baseball diamond with player positions
              </div>
            </div>
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '60px',
              height: '34px'
            }}>
              <input
                type="checkbox"
                checked={showFieldingPositions}
                onChange={(e) => setShowFieldingPositions(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: showFieldingPositions ? '#007bff' : '#ccc',
                transition: '0.4s',
                borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '26px',
                  width: '26px',
                  left: '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%',
                  transform: showFieldingPositions ? 'translateX(26px)' : 'translateX(0)'
                }} />
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginTop: '30px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '12px 24px',
              border: '2px solid #6c757d',
              backgroundColor: 'white',
              color: '#6c757d',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#6c757d';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFCustomizationModal;
