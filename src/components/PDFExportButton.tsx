import React, { useRef } from 'react';
import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { Player, TeamInfo } from '../StorageService';

interface PDFExportButtonProps {
  battingOrder: Player[];
  teamInfo: TeamInfo;
  algorithm: 'traditional' | 'situational';
  showFieldingPositions: boolean;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  battingOrder,
  teamInfo,
  algorithm,
  showFieldingPositions
}) => {
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (battingOrder.length === 0) {
      toast.error('Generate a batting order before exporting PDF', { icon: '⚠️' });
      return;
    }


    try {
      // Get the PDF content element
      const element = pdfContentRef.current;
      if (!element) throw new Error('PDF content not found');

      // Make it visible temporarily for rendering
      element.style.display = 'block';

      // Render to canvas with high quality
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      // Hide it again
      element.style.display = 'none';

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      pdf.save(`${teamInfo.name || 'lineup'}-lineup-${date}.pdf`);
      
      toast.success('PDF exported successfully!', { icon: '✅' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF', { icon: '❌' });
    }
  };

  return (
    <>
      <Button
        leftSection={<IconDownload size={14} />}
        onClick={generatePDF}
        color="green"
        radius="xl"
        size="sm"
        disabled={battingOrder.length === 0}
      >
        Export PDF
      </Button>

      {/* Hidden PDF content that gets rendered to canvas */}
      <div
        ref={pdfContentRef}
            style={{
              display: 'none',
              position: 'absolute',
              left: '-9999px',
              width: '210mm', // A4 width
              backgroundColor: '#ffffff',
              padding: '10mm',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
      >
        {/* Header */}
        <div style={{
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '2px solid #FFC107',
        }}>
          {teamInfo.logo && (
            <img 
              src={teamInfo.logo} 
              alt="Team Logo" 
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'contain',
                borderRadius: '8px',
                marginBottom: '3px',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
          )}
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 'bold',
              margin: 0,
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}>
              {teamInfo.location && teamInfo.name ? `${teamInfo.location} ${teamInfo.name}` : (teamInfo.name || 'BATTING ORDER')}
            </h1>
            <p style={{
              fontSize: '20px',
              fontWeight: 'bold',
              margin: '8px 0 20px 0',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textAlign: 'left',
              display: 'inline-block',
            }}>
              vs.   _________________________
            </p>
          </div>
        </div>


        {/* Player Rows */}
        {battingOrder.map((player, index) => (
          <div
            key={player.id}
            style={{
              display: 'grid',
              gridTemplateColumns: showFieldingPositions ? '45px 1fr 60px' : '45px 1fr',
              gap: '10px',
              padding: '10px 14px',
              marginBottom: '5px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>
              {index + 1}
            </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>
                    {player.name}
                  </div>
                </div>
            {showFieldingPositions && (
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '16px', 
                color: '#000', 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {player.fieldingPosition || '-'}
              </div>
            )}
          </div>
        ))}

        {/* Bench Players */}
        <div style={{
          marginTop: '10px',
          marginBottom: '5px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '0 0 5px 0',
            color: '#000',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textAlign: 'center',
          }}>
            Bench
          </h2>
        </div>

        {/* Blank Bench Cards */}
        {[1, 2, 3].map((index) => (
          <div
            key={`bench-${index}`}
            style={{
              display: 'grid',
              gridTemplateColumns: showFieldingPositions ? '45px 1fr 60px' : '45px 1fr',
              gap: '10px',
              padding: '10px 14px',
              marginBottom: '5px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              backgroundColor: '#fff',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff', minHeight: '20px' }}>
              &nbsp;
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff', minHeight: '20px' }}>
                &nbsp;
              </div>
            </div>
            {showFieldingPositions && (
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '16px', 
                color: '#fff', 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '20px'
              }}>
                &nbsp;
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{
          marginTop: '8px',
          paddingTop: '5px',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
          fontSize: '8px',
          color: '#999',
        }}>
          Generated Sunday, October 26, 2025
          <br />
          Strategy: Modern Baseball Consensus
        </div>
      </div>
    </>
  );
};
