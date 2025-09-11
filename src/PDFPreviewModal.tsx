import React from 'react';
import BattingOrderPDF from './BattingOrderPDF';
import { Player, TeamInfo } from './StorageService';
import { PDFExportOptions } from './PDFCustomizationModal';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onExport: (options: PDFExportOptions) => void;
  battingOrder: Player[];
  teamInfo?: TeamInfo;
  pdfOptions: PDFExportOptions;
  playerPositions: { [key: string]: { top: number; left: number } };
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onExport,
  battingOrder,
  teamInfo,
  pdfOptions,
  playerPositions
}) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Create a new PDF component for printing
      const printContent = `
        <html>
          <head>
            <title>Batting Lineup - ${teamInfo?.name || 'Team'}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif;
              }
              @media print {
                body { margin: 0; padding: 0; }
                .print-container {
                  width: 100%;
                  height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <div style="
                position: relative;
                width: 1100px;
                height: 850px;
                background-color: white;
                border: 4px solid #dc3545;
                font-family: Arial, sans-serif;
                border-radius: 8px;
                overflow: hidden;
              ">
                <!-- Header -->
                <div style="
                  position: absolute;
                  top: 15px;
                  left: 50%;
                  transform: translateX(-50%);
                  text-align: center;
                  width: 100%;
                ">
                  ${teamInfo?.logo ? `
                    <div style="margin-bottom: 8px; display: flex; justify-content: center;">
                      <img src="${teamInfo.logo}" alt="Team Logo" style="max-height: 50px; max-width: 100px; object-fit: contain;" />
                    </div>
                  ` : ''}
                  <div style="font-size: 28px; font-weight: bold; color: ${teamInfo?.colors?.primary || '#dc3545'}; margin-bottom: 3px;">
                    ${teamInfo?.name || 'My Team'}
                  </div>
                  <div style="font-size: 20px; font-weight: bold; color: ${teamInfo?.colors?.secondary || '#007bff'};">
                    BATTING LINEUP
                  </div>
                </div>

                <!-- Left Side - Batting Order -->
                <div style="
                  position: absolute;
                  left: 15px;
                  top: 80px;
                  width: 420px;
                  height: 720px;
                  border: 3px solid ${teamInfo?.colors?.primary || '#dc3545'};
                  background-color: white;
                  padding: 15px;
                  border-radius: 6px;
                ">
                  <div style="display: flex; flex-direction: column; gap: 2px; height: 100%;">
                    ${battingOrder.map((player, index) => `
                      <div style="
                        display: flex;
                        align-items: center;
                        border-bottom: 1px solid ${teamInfo?.colors?.secondary || '#007bff'};
                        padding-bottom: 2px;
                        min-height: 28px;
                        flex: 1;
                      ">
                        <div style="
                          width: 30px;
                          font-size: 14px;
                          font-weight: bold;
                          color: ${teamInfo?.colors?.secondary || '#007bff'};
                          text-align: center;
                        ">
                          ${index + 1}.
                        </div>
                        <div style="
                          flex: 1;
                          font-size: 16px;
                          font-weight: bold;
                          color: black;
                          padding-left: 8px;
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          width: 100%;
                        ">
                          <span style="flex: 1; font-size: 16px;">${player?.name || ''}</span>
                          <span style="font-size: 14px; color: #666; font-weight: bold; margin-left: 10px;">
                            AVG: ${player?.avg?.toFixed(3) || '0.000'}
                          </span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Game Info Section -->
                <div style="
                  position: absolute;
                  bottom: 15px;
                  left: 50%;
                  transform: translateX(-50%);
                  text-align: center;
                  display: flex;
                  gap: 30px;
                  align-items: center;
                ">
                  <div>
                    <div style="font-size: 14px; font-weight: bold; color: ${teamInfo?.colors?.primary || '#dc3545'}; margin-bottom: 4px; font-style: italic;">
                      Coach
                    </div>
                    <div style="
                      width: 140px;
                      height: 22px;
                      border: 2px solid ${teamInfo?.colors?.primary || '#dc3545'};
                      background-color: white;
                      font-size: 11px;
                      color: #333;
                      font-weight: bold;
                      text-align: center;
                      border-radius: 3px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    ">
                      ${pdfOptions.coachName || 'Coach Name'}
                    </div>
                  </div>
                  <div>
                    <div style="font-size: 14px; font-weight: bold; color: ${teamInfo?.colors?.primary || '#dc3545'}; margin-bottom: 4px; font-style: italic;">
                      vs
                    </div>
                    <div style="
                      width: 140px;
                      height: 22px;
                      border: 2px solid ${teamInfo?.colors?.primary || '#dc3545'};
                      background-color: white;
                      font-size: 11px;
                      color: #333;
                      font-weight: bold;
                      text-align: center;
                      border-radius: 3px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    ">
                      ${pdfOptions.opponent || 'Opponent'}
                    </div>
                  </div>
                  <div>
                    <div style="font-size: 14px; font-weight: bold; color: ${teamInfo?.colors?.primary || '#dc3545'}; margin-bottom: 4px; font-style: italic;">
                      Date
                    </div>
                    <div style="
                      width: 140px;
                      height: 22px;
                      border: 2px solid ${teamInfo?.colors?.primary || '#dc3545'};
                      background-color: white;
                      font-size: 11px;
                      color: #333;
                      font-weight: bold;
                      text-align: center;
                      border-radius: 3px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    ">
                      ${pdfOptions.date || new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleExport = () => {
    onExport(pdfOptions);
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
        padding: '20px',
        maxWidth: '1200px',
        width: '95%',
        maxHeight: '95vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            PDF Preview
          </h2>
          <button
            onClick={onClose}
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

        {/* PDF Preview */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <BattingOrderPDF 
            battingOrder={battingOrder}
            teamName={teamInfo?.name || 'My Team'}
            teamInfo={teamInfo}
            isPreview={true}
            playerPositions={playerPositions}
            coachName={pdfOptions.coachName}
            opponent={pdfOptions.opponent}
            date={pdfOptions.date}
            showFieldingPositions={pdfOptions.showFieldingPositions}
          />
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onBack}
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
            ← Back
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: '12px 24px',
              border: '2px solid #17a2b8',
              backgroundColor: 'white',
              color: '#17a2b8',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#17a2b8';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#17a2b8';
            }}
          >
            🖨️ Print
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: '#28a745',
              color: 'white',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#218838';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#28a745';
            }}
          >
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
