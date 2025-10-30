import React, { useRef, useState, useEffect } from 'react';
import { Button, Text, Group } from '@mantine/core';
import { IconDownload, IconCoffee } from '@tabler/icons-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { Player, TeamInfo } from '../StorageService';
import { CustomizationPromptDialog } from './CustomizationPromptDialog';
import { detectUserLocation, getLocalizationSettings } from '../utils/LocalizationUtils';

interface PDFExportButtonProps {
  battingOrder: Player[];
  teamInfo: TeamInfo;
  algorithm: 'traditional' | 'situational';
  showFieldingPositions: boolean;
  useFieldingNumbers: boolean;
  onOpenCustomization?: () => void;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  battingOrder,
  teamInfo,
  algorithm,
  showFieldingPositions,
  useFieldingNumbers,
  onOpenCustomization
}) => {
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [showCustomizationPrompt, setShowCustomizationPrompt] = useState(false);
  const [localizationSettings, setLocalizationSettings] = useState<{ spelling: 'us' | 'uk' | 'au' | 'ca' }>({ spelling: 'us' });
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  // Preload and convert logo to data URL to avoid CORS/taint issues for html2canvas
  useEffect(() => {
    const src = teamInfo.logo;
    if (!src) {
      setLogoDataUrl(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Bake grayscale into the logo so html2canvas reliably captures it
          // Use canvas 2D filter when available
          // @ts-ignore
          if (typeof ctx.filter !== 'undefined') {
            // @ts-ignore
            ctx.filter = 'grayscale(100%)';
            ctx.drawImage(img, 0, 0);
          } else {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              // luminance formula
              const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
              data[i] = data[i + 1] = data[i + 2] = y;
            }
            ctx.putImageData(imageData, 0, 0);
          }
          const data = canvas.toDataURL('image/png');
          if (!cancelled) setLogoDataUrl(data);
        } else if (!cancelled) {
          setLogoDataUrl(null);
        }
      } catch {
        if (!cancelled) setLogoDataUrl(null);
      }
    };
    img.onerror = () => {
      if (!cancelled) setLogoDataUrl(null);
    };
    img.src = src;
    return () => { cancelled = true; };
  }, [teamInfo.logo]);

  const ensureLogoPreloaded = async () => {
    if (!teamInfo.logo) return;
    const start = Date.now();
    while (!logoDataUrl && Date.now() - start < 1500) {
      // wait up to 1.5s for preload
      await new Promise((r) => setTimeout(r, 100));
    }
  };

  // Detect user location and set localization
  useEffect(() => {
    const detectLocation = async () => {
      const location = await detectUserLocation();
      const settings = getLocalizationSettings(location);
      setLocalizationSettings(settings);
    };
    detectLocation();
  }, []);

  const generatePDF = async () => {
    if (battingOrder.length === 0) {
      toast.error('Generate a batting order before exporting PDF', { icon: '⚠️' });
      return;
    }

    // Check if team name is blank
    const hasBlankTeamName = !teamInfo.name || teamInfo.name.trim() === '';
    
    if (hasBlankTeamName && onOpenCustomization) {
      setShowCustomizationPrompt(true);
      return;
    }


    try {
      // Ensure logo is preloaded to data URL before capture
      await ensureLogoPreloaded();

      // Get the PDF content element
      const element = pdfContentRef.current;
      if (!element) throw new Error('PDF content not found');

      // Make it visible temporarily for rendering
      element.style.display = 'block';

      // Render to canvas with high quality
      const canvas = await html2canvas(element, {
        scale: 1.6,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
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
      
      // Add coffee prompt after 3rd and 10th exports
      const exportCount = parseInt(localStorage.getItem('pdfExportCount') || '0', 10) + 1;
      localStorage.setItem('pdfExportCount', exportCount.toString());
      
      if (exportCount === 3 || exportCount === 10) {
        setTimeout(() => {
          toast((t) => (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              padding: '4px'
            }}>
              <Text size="sm" fw={600}>Glad you're finding this useful! ☕</Text>
              <Text size="xs" c="dimmed">
                Consider supporting to keep it free for all coaches
              </Text>
              <Button
                size="xs"
                variant="light"
                color="yellow"
                leftSection={<IconCoffee size={12} />}
                onClick={() => {
                  window.open('https://www.buymeacoffee.com/jackofearth', '_blank');
                  toast.dismiss(t.id);
                }}
              >
                Buy Me a Coffee
              </Button>
            </div>
          ), {
            duration: 8000,
            icon: '☕',
          });
        }, 2000);
      }

      // Customization reminder on 3rd/10th export if customization incomplete and not shown in last 24h
      try {
        const isNameBlank = !teamInfo.name || teamInfo.name.trim() === '';
        const customizationIncomplete = isNameBlank;
        if (customizationIncomplete) {
          const lastShown = parseInt(localStorage.getItem('customizeToastLastShownAt') || '0', 10);
          const lastMilestone = parseInt(localStorage.getItem('customizeToastLastMilestone') || '0', 10);
          const allowDueToMilestone = exportCount === 10 && lastMilestone !== 10;
          if (Date.now() - lastShown > 24 * 60 * 60 * 1000 || allowDueToMilestone) {
            localStorage.setItem('customizeToastLastShownAt', Date.now().toString());
            localStorage.setItem('customizeToastLastMilestone', exportCount.toString());
            setTimeout(() => {
              toast((t) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                  <Text size="sm" fw={600}>Add your team details</Text>
                  <Text size="xs" c="dimmed">Customize name, color, and logo for a polished PDF.</Text>
                  <Button size="xs" radius="xl" onClick={() => { onOpenCustomization && onOpenCustomization(); toast.dismiss(t.id); }}>Customize now</Button>
                </div>
              ), { duration: 8000, icon: '🎨' });
            }, 2500);
          }
        }
      } catch {}
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF', { icon: '❌' });
    }
  };

  const handleCustomizeClick = () => {
    setShowCustomizationPrompt(false);
    if (onOpenCustomization) {
      onOpenCustomization();
    }
  };

  const handleSkipCustomization = () => {
    setShowCustomizationPrompt(false);
    // Generate PDF without customization
    generatePDFDirectly();
  };

  // Function to convert fielding position to number
  const getFieldingPositionDisplay = (position: string | undefined, useNumbers: boolean) => {
    if (!position) return '-';
    
    if (useNumbers) {
      const positionMap: { [key: string]: string } = {
        'P': '1',
        'C': '2', 
        '1B': '3',
        '2B': '4',
        '3B': '5',
        'SS': '6',
        'LF': '7',
        'CF': '8',
        'RF': '9',
        'EH': 'EH',
        'DH': 'DH'
      };
      return positionMap[position] || position;
    }
    
    return position;
  };

  const generatePDFDirectly = async () => {
    try {
      // Ensure logo is preloaded to data URL before capture
      await ensureLogoPreloaded();

      // Get the PDF content element
      const element = pdfContentRef.current;
      if (!element) throw new Error('PDF content not found');

      // Make it visible temporarily for rendering (ensure it's measurable and rendered)
      const prevDisplay = element.style.display;
      const prevPosition = element.style.position;
      const prevLeft = element.style.left;
      const prevTop = element.style.top;
      const prevVisibility = element.style.visibility;

      element.style.display = 'block';
      element.style.position = 'fixed';
      element.style.left = '0px';
      element.style.top = '0px';
      element.style.visibility = 'hidden';

      // Render to canvas with high quality
      const canvas = await html2canvas(element, {
        scale: 1.6,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      // Restore previous styles
      element.style.display = prevDisplay;
      element.style.position = prevPosition;
      element.style.left = prevLeft;
      element.style.top = prevTop;
      element.style.visibility = prevVisibility;

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 295;
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
      pdf.save(`${teamInfo.name || 'batting-order'}-lineup.pdf`);
      toast.success('PDF exported successfully!', { icon: '📄' });
      
      // Add coffee prompt after 3rd and 10th exports (including "Skip for Now" exports)
      const exportCount = parseInt(localStorage.getItem('pdfExportCount') || '0', 10) + 1;
      localStorage.setItem('pdfExportCount', exportCount.toString());
      
      if (exportCount === 3 || exportCount === 10) {
        setTimeout(() => {
          toast((t) => (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              padding: '4px'
            }}>
              <Text size="sm" fw={600}>Glad you're finding this useful! ☕</Text>
              <Text size="xs" c="dimmed">
                Consider supporting to keep it free for all coaches
              </Text>
              <Button
                size="xs"
                variant="light"
                color="yellow"
                leftSection={<IconCoffee size={12} />}
                onClick={() => {
                  window.open('https://www.buymeacoffee.com/jackofearth', '_blank');
                  toast.dismiss(t.id);
                }}
              >
                Buy Me a Coffee
              </Button>
            </div>
          ), {
            duration: 8000,
            icon: '☕',
          });
        }, 2000);
      }

      // Customization reminder on 3rd/10th export (Skip for Now flows counted)
      try {
        const isNameBlank = !teamInfo.name || teamInfo.name.trim() === '';
        const customizationIncomplete = isNameBlank;
        if (customizationIncomplete) {
          const lastShown = parseInt(localStorage.getItem('customizeToastLastShownAt') || '0', 10);
          const lastMilestone = parseInt(localStorage.getItem('customizeToastLastMilestone') || '0', 10);
          const allowDueToMilestone = exportCount === 10 && lastMilestone !== 10;
          if (Date.now() - lastShown > 24 * 60 * 60 * 1000 || allowDueToMilestone) {
            localStorage.setItem('customizeToastLastShownAt', Date.now().toString());
            localStorage.setItem('customizeToastLastMilestone', exportCount.toString());
            setTimeout(() => {
              toast((t) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                  <Text size="sm" fw={600}>Add your team details</Text>
                  <Text size="xs" c="dimmed">Customize name, color, and logo for a polished PDF.</Text>
                  <Button size="xs" radius="xl" onClick={() => { onOpenCustomization && onOpenCustomization(); toast.dismiss(t.id); }}>Customize now</Button>
                </div>
              ), { duration: 8000, icon: '🎨' });
            }, 2500);
          }
        }
      } catch {}

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.', { icon: '❌' });
    }
  };

  return (
    <>
      <Group justify="flex-end" style={{ position: 'relative' }}>
        <Button
          leftSection={<IconDownload size={16} />}
          onClick={generatePDF}
          radius="xl"
          style={{
            background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
            color: '#000',
            border: 'none',
            boxShadow: '0 2px 10px rgba(255, 193, 7, 0.3)'
          }}
        >
          Export PDF
        </Button>
      </Group>

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
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}
      >
        {logoDataUrl && (
          <img
            src={logoDataUrl}
            alt="Background Logo"
            aria-hidden
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: 'auto',
              opacity: 0.03,
              pointerEvents: 'none',
              zIndex: 0,
              filter: 'grayscale(100%)',
              userSelect: 'none'
            }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          marginBottom: '10px',
          borderBottom: `2px solid ${teamInfo.pdfHeaderColor || '#7B1FA2'}40`,
          background: '#d0d0d0',
          borderRadius: '6px',
          padding: '10px',
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
              fontSize: '28px',
              fontWeight: 'bold',
              margin: 0,
              color: teamInfo.pdfHeaderColor || '#7B1FA2',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: `0 2px 4px ${teamInfo.pdfHeaderColor || '#7B1FA2'}20`,
            }}>
              {teamInfo.name || 'BATTING ORDER'}
            </h1>
            <p style={{
              fontSize: '16px',
              fontWeight: 'bold',
              margin: '4px 0 12px 0',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textAlign: 'left',
              display: 'inline-block',
            }}>
              vs.   _________________________
            </p>
          </div>
        </div>


        {/* Player Rows */}
        <div style={{
          marginTop: '6px',
          marginBottom: '3px',
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 4px 0',
            color: teamInfo.pdfHeaderColor || '#7B1FA2',
            backgroundColor: '#333',
            padding: '4px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
          }}>
            Lineup
          </h2>
        </div>
        {battingOrder.map((player, index) => (
          <div
            key={player.id}
            style={{
              display: 'grid',
              gridTemplateColumns: showFieldingPositions ? '35px 1fr 50px' : '35px 1fr',
              gap: '8px',
              padding: '8px 12px',
              marginBottom: '4px',
              border: '2px solid #000',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              boxShadow: `0 1px 4px ${teamInfo.pdfHeaderColor || '#7B1FA2'}15`,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#000' }}>
              {index + 1}
            </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#000' }}>
                    {player.name}
                  </div>
                </div>
            {showFieldingPositions && (
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '15px', 
                color: '#000', 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getFieldingPositionDisplay(player.fieldingPosition, useFieldingNumbers)}
              </div>
            )}
          </div>
        ))}

        {/* Bench Players */}
        <div style={{
          marginTop: '6px',
          marginBottom: '3px',
        }}>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            margin: '0 0 4px 0',
            color: teamInfo.pdfHeaderColor || '#7B1FA2',
            backgroundColor: '#333',
            padding: '4px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
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
              gridTemplateColumns: showFieldingPositions ? '35px 1fr 50px' : '35px 1fr',
              gap: '8px',
              padding: '8px 12px',
              marginBottom: '4px',
              border: '2px solid #000',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              boxShadow: `0 1px 4px ${teamInfo.pdfHeaderColor || '#7B1FA2'}10`,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', minHeight: '16px' }}>
              &nbsp;
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', minHeight: '16px' }}>
                &nbsp;
              </div>
            </div>
            {showFieldingPositions && (
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '15px', 
                color: '#fff', 
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '16px'
              }}>
                &nbsp;
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{
          marginTop: '8px',
          paddingTop: '6px',
          borderTop: '1px solid #ccc',
          textAlign: 'center',
          fontSize: '7px',
          color: '#666',
          background: '#f9f9f9',
          borderRadius: '3px',
          padding: '6px',
        }}>
          Generated {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
          <br />
          Strategy: {algorithm === 'traditional' ? 'Modern Baseball Consensus' : 'Situational Analytics'}
        </div>
        </div>
      </div>

      {/* Customization Prompt Dialog */}
      <CustomizationPromptDialog
        isOpen={showCustomizationPrompt}
        onClose={() => setShowCustomizationPrompt(false)}
        onCustomize={handleCustomizeClick}
        onSkip={handleSkipCustomization}
        localizationSettings={localizationSettings}
      />
    </>
  );
};
