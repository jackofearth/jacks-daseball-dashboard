import { PDFDocument } from 'pdf-lib';
import { Player, TeamInfo } from '../StorageService';
import { generateCanvasWithAnalyzedCoordinates } from './ImageAnalyzer';

export interface LineupPDFOptions {
  teamInfo: TeamInfo;
  battingOrder: Player[];
  benchPlayers: Player[];
  gameDate?: string;
}

export async function generateLineupPDF(options: LineupPDFOptions): Promise<Uint8Array> {
  const { teamInfo, battingOrder, benchPlayers, gameDate = new Date().toLocaleDateString() } = options;

  try {
    // Use proper image analysis to extract exact coordinates from example image
    console.log('Generating PDF with proper image analysis...');
    const canvasDataURL = await generateCanvasWithAnalyzedCoordinates({
      teamInfo,
      battingOrder,
      benchPlayers,
      gameDate
    });

    // Convert data URL to image bytes
    const response = await fetch(canvasDataURL);
    const imageBytes = await response.arrayBuffer();

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed the generated image
    const image = await pdfDoc.embedPng(imageBytes);
    
    // Get image dimensions
    const { width, height } = image.scale(1);
    
    // Add a page with image dimensions
    const page = pdfDoc.addPage([width, height]);
    
    // Draw the generated image
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    console.log('PDF generated successfully with proper image analysis');
    return pdfBytes;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}