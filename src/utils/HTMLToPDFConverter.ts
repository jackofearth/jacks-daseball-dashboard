import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Player, TeamInfo } from '../StorageService';
import { generateHTMLTemplate, HTMLTemplateOptions } from './HTMLTemplateGenerator';

export interface HTMLToPDFOptions {
  teamInfo: TeamInfo;
  battingOrder: Player[];
  benchPlayers: Player[];
  gameDate?: string;
}

export async function convertHTMLToPDF(options: HTMLToPDFOptions): Promise<Uint8Array> {
  const { teamInfo, battingOrder, benchPlayers, gameDate = new Date().toLocaleDateString() } = options;

  try {
    console.log('Starting HTML to PDF conversion...');
    
    // Generate HTML template
    const htmlContent = generateHTMLTemplate({
      teamInfo,
      battingOrder,
      benchPlayers,
      gameDate
    });

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    document.body.appendChild(tempContainer);

    // Wait for fonts to load
    await document.fonts.ready;

    // Convert HTML to canvas
    const canvas = await html2canvas(tempContainer, {
      width: 2828,
      height: 4000,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Convert canvas to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [2828, 4000]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 2828, 4000);
    
    const pdfBytes = pdf.output('arraybuffer');
    console.log('HTML to PDF conversion completed successfully');
    return new Uint8Array(pdfBytes);

  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    throw new Error(`Failed to convert HTML to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
