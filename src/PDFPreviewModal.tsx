import React from 'react';
import { Modal, Group, Button, Stack, Paper } from '@mantine/core';
import { IconPrinter, IconFileDownload, IconArrowLeft } from '@tabler/icons-react';
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

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="PDF Preview"
      centered
      size="xl"
    >
      <Stack gap="md">
        <Paper p="md" withBorder>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            minHeight: '400px',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <h3>PDF Preview</h3>
              <p>Preview functionality will be available in the next update.</p>
              <p>You can still export the PDF using the Export PDF button below.</p>
            </div>
          </div>
        </Paper>

        <Group justify="center" gap="md">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            variant="light"
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            leftSection={<IconFileDownload size={16} />}
            onClick={handleExport}
          >
            Export PDF
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default PDFPreviewModal;
