import React from 'react';
import { Player } from './StorageService';

interface BattingOrderPDFProps {
  battingOrder: Player[];
  teamName: string;
  teamInfo?: {
    name: string;
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  diamondGraphic?: string;
  isPreview?: boolean;
  playerPositions?: { [key: string]: { top: number; left: number } };
  coachName?: string;
  opponent?: string;
  date?: string;
  showFieldingPositions?: boolean;
}

const BattingOrderPDF: React.FC<BattingOrderPDFProps> = ({ 
  battingOrder, 
  teamName, 
  teamInfo,
  diamondGraphic = '/baseball-diamond.png', // Default diamond graphic
  isPreview = false,
  playerPositions,
  coachName,
  opponent,
  date,
  showFieldingPositions = true
}) => {
  // Map batting order positions to fielding positions
  const getPlayerAtPosition = (fieldingPosition: string): Player | null => {
    const positionMap: { [key: string]: number } = {
      'P': 0,   // Pitcher - batting position 1
      'C': 1,   // Catcher - batting position 2
      '1B': 2,  // First Base - batting position 3
      '2B': 3,  // Second Base - batting position 4
      '3B': 4,  // Third Base - batting position 5
      'SS': 5,  // Shortstop - batting position 6
      'LF': 6,  // Left Field - batting position 7
      'CF': 7,  // Center Field - batting position 8
      'RF': 8   // Right Field - batting position 9
    };
    
    const battingIndex = positionMap[fieldingPosition];
    return battingIndex !== undefined && battingIndex < battingOrder.length 
      ? battingOrder[battingIndex] 
      : null;
  };

  const playerNameStyle: React.CSSProperties = {
    position: 'absolute',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    transform: 'translate(-50%, -50%)',
    whiteSpace: 'nowrap',
    maxWidth: '80px',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  return (
    <div 
      id="pdf-lineup-card"
      style={{
        position: 'relative',
        width: '1100px',
        height: '850px',
        display: 'block', // Always show the component
        backgroundColor: 'white',
        border: '4px solid #dc3545',
        fontFamily: 'Arial, sans-serif',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        width: '100%'
      }}>
        {/* Team Logo */}
        {teamInfo?.logo && (
          <div style={{
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img 
              src={teamInfo.logo} 
              alt="Team Logo" 
              style={{
                maxHeight: '50px',
                maxWidth: '100px',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: teamInfo?.colors?.primary || '#dc3545',
          marginBottom: '3px'
        }}>
          {teamInfo?.name || teamName}
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: teamInfo?.colors?.secondary || '#007bff'
        }}>
          BATTING LINEUP
        </div>
      </div>

      {/* Left Side - Batting Order */}
      <div style={{
        position: 'absolute',
        left: '15px',
        top: '80px',
        width: '420px',
        height: '720px',
        border: `3px solid ${teamInfo?.colors?.primary || '#dc3545'}`,
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '6px'
      }}>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          height: '100%'
        }}>
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: `1px solid ${teamInfo?.colors?.secondary || '#007bff'}`,
              paddingBottom: '2px',
              minHeight: '28px',
              flex: '1'
            }}>
              <div style={{
                width: '30px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: teamInfo?.colors?.secondary || '#007bff',
                textAlign: 'center'
              }}>
                {index + 1}.
              </div>
              <div style={{
                flex: 1,
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'black',
                paddingLeft: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
              }}>
                <span style={{ flex: 1, fontSize: '16px' }}>{battingOrder[index]?.name || ''}</span>
                {battingOrder[index] && (
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#666', 
                    fontWeight: 'bold',
                    marginLeft: '10px'
                  }}>
                    AVG: {battingOrder[index].avg.toFixed(3)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Baseball Diamond */}
      {showFieldingPositions && (
        <div style={{
          position: 'absolute',
          right: '15px',
          top: '80px',
          width: '650px',
          height: '720px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        {/* Custom Baseball Diamond Background */}
        <div style={{
          position: 'relative',
          width: '600px',
          height: '600px'
        }}>
          <img 
            src={diamondGraphic} 
            alt="Baseball Diamond" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              // Fallback to a simple colored background if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.style.backgroundColor = '#90EE90';
                parent.style.border = '2px solid #228B22';
                parent.style.borderRadius = '50%';
              }
            }}
          />

          {/* Fielding Positions - positioned over the custom graphic using correct positions */}
          <div 
            style={{...playerNameStyle, 
              top: `${playerPositions?.P?.top || 379}px`, 
              left: `${playerPositions?.P?.left || 300}px`
            }}
          >
            {getPlayerAtPosition('P')?.name?.split(' ')[0] || 'P'}
          </div>
          
          <div 
            style={{...playerNameStyle, 
              top: `${playerPositions?.C?.top || 509}px`, 
              left: `${playerPositions?.C?.left || 300}px`
            }}
          >
            {getPlayerAtPosition('C')?.name?.split(' ')[0] || 'C'}
          </div>
          
          <div 
            style={{...playerNameStyle, 
              top: `${playerPositions?.['1B']?.top || 375}px`, 
              left: `${playerPositions?.['1B']?.left || 480}px`
            }}
          >
            {getPlayerAtPosition('1B')?.name?.split(' ')[0] || '1B'}
          </div>
          
          <div 
            style={{...playerNameStyle, 
              top: `${playerPositions?.['2B']?.top || 250}px`, 
              left: `${playerPositions?.['2B']?.left || 355}px`
            }}
          >
            {getPlayerAtPosition('2B')?.name?.split(' ')[0] || '2B'}
          </div>
          
          <div 
            style={{...playerNameStyle, 
              top: `${playerPositions?.['3B']?.top || 375}px`, 
              left: `${playerPositions?.['3B']?.left || 130}px`
            }}
          >
            {getPlayerAtPosition('3B')?.name?.split(' ')[0] || '3B'}
          </div>
          
          <div 
            style={{...playerNameStyle, 
              top: `${playerPositions?.SS?.top || 285}px`, 
              left: `${playerPositions?.SS?.left || 210}px`
            }}
          >
            {getPlayerAtPosition('SS')?.name?.split(' ')[0] || 'SS'}
          </div>
          
          <div 
            style={{...playerNameStyle, 
              top: `${playerPositions?.LF?.top || 190}px`, 
              left: `${playerPositions?.LF?.left || 125}px`
            }}
          >
            {getPlayerAtPosition('LF')?.name?.split(' ')[0] || 'LF'}
          </div>
          
          <div 
            style={{...playerNameStyle, 
              top: `${playerPositions?.CF?.top || 105}px`, 
              left: `${playerPositions?.CF?.left || 300}px`
            }}
          >
            {getPlayerAtPosition('CF')?.name?.split(' ')[0] || 'CF'}
          </div>
          
          <div 
            style={{...playerNameStyle, 
              top: `${playerPositions?.RF?.top || 185}px`, 
              left: `${playerPositions?.RF?.left || 490}px`
            }}
          >
            {getPlayerAtPosition('RF')?.name?.split(' ')[0] || 'RF'}
          </div>
        </div>
        </div>
      )}

      {/* Game Info Section */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        display: 'flex',
        gap: '30px',
        alignItems: 'center'
      }}>
        {/* Coach */}
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: teamInfo?.colors?.primary || '#dc3545',
            marginBottom: '4px',
            fontStyle: 'italic'
          }}>
            Coach
          </div>
          <input
            type="text"
            value={coachName || ''}
            placeholder="Coach Name"
            readOnly
            style={{
              width: '140px',
              height: '22px',
              border: `2px solid ${teamInfo?.colors?.primary || '#dc3545'}`,
              backgroundColor: 'white',
              fontSize: '11px',
              color: '#333',
              fontWeight: 'bold',
              textAlign: 'center',
              borderRadius: '3px',
              outline: 'none'
            }}
          />
        </div>

        {/* Opponent */}
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: teamInfo?.colors?.primary || '#dc3545',
            marginBottom: '4px',
            fontStyle: 'italic'
          }}>
            vs
          </div>
          <input
            type="text"
            value={opponent || ''}
            placeholder="Opponent"
            readOnly
            style={{
              width: '140px',
              height: '22px',
              border: `2px solid ${teamInfo?.colors?.primary || '#dc3545'}`,
              backgroundColor: 'white',
              fontSize: '11px',
              color: '#333',
              fontWeight: 'bold',
              textAlign: 'center',
              borderRadius: '3px',
              outline: 'none'
            }}
          />
        </div>

        {/* Date */}
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: teamInfo?.colors?.primary || '#dc3545',
            marginBottom: '4px',
            fontStyle: 'italic'
          }}>
            Date
          </div>
          <input
            type="text"
            value={date || new Date().toLocaleDateString()}
            placeholder="Date"
            readOnly
            style={{
              width: '140px',
              height: '22px',
              border: `2px solid ${teamInfo?.colors?.primary || '#dc3545'}`,
              backgroundColor: 'white',
              fontSize: '11px',
              color: '#333',
              fontWeight: 'bold',
              textAlign: 'center',
              borderRadius: '3px',
              outline: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BattingOrderPDF;
