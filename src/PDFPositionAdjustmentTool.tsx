import React from 'react';

// PDF Position Adjustment Tool - Saved for future use
// This tool allows you to adjust player positions on the PDF diamond graphic

interface PDFPositionAdjustmentToolProps {
  editablePositions: { [key: string]: { top: number; left: number } };
  onUpdatePosition: (position: string, field: 'top' | 'left', value: number) => void;
  onLockPositions: () => void;
  onResetPositions: () => void;
}

const PDFPositionAdjustmentTool: React.FC<PDFPositionAdjustmentToolProps> = ({
  editablePositions,
  onUpdatePosition,
  onLockPositions,
  onResetPositions
}) => {
  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      maxWidth: '300px',
      zIndex: 10001
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
        Adjust Player Positions
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '15px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Position</div>
        <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Top (px)</div>
        <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#666' }}>Left (px)</div>
        
        {Object.entries(editablePositions).map(([position, coords]) => {
          const typedCoords = coords as { top: number; left: number };
          return (
          <React.Fragment key={position}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#007bff' }}>
              {position}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button
                onClick={() => onUpdatePosition(position, 'top', typedCoords.top - 5)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                −
              </button>
              <input
                type="number"
                value={typedCoords.top}
                onChange={(e) => onUpdatePosition(position, 'top', parseInt(e.target.value) || 0)}
                style={{
                  width: '50px',
                  padding: '2px',
                  border: '1px solid #ccc',
                  borderRadius: '2px',
                  fontSize: '11px',
                  textAlign: 'center'
                }}
              />
              <button
                onClick={() => onUpdatePosition(position, 'top', typedCoords.top + 5)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                +
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button
                onClick={() => onUpdatePosition(position, 'left', typedCoords.left - 5)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                −
              </button>
              <input
                type="number"
                value={typedCoords.left}
                onChange={(e) => onUpdatePosition(position, 'left', parseInt(e.target.value) || 0)}
                style={{
                  width: '50px',
                  padding: '2px',
                  border: '1px solid #ccc',
                  borderRadius: '2px',
                  fontSize: '11px',
                  textAlign: 'center'
                }}
              />
              <button
                onClick={() => onUpdatePosition(position, 'left', typedCoords.left + 5)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                +
              </button>
            </div>
          </React.Fragment>
          );
        })}
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onLockPositions}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          🔒 Lock Positions
        </button>
        <button
          onClick={onResetPositions}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          ↺ Reset
        </button>
      </div>
      
      <div style={{ fontSize: '10px', color: '#666', marginTop: '8px' }}>
        Adjust values and click "Lock Positions" to save changes
      </div>
    </div>
  );
};

export default PDFPositionAdjustmentTool;
