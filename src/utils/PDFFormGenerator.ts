import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Player, TeamInfo } from '../StorageService';

// Position abbreviation mapping
const getPositionAbbreviation = (position: string | undefined): string => {
  if (!position) return 'UTIL';

  const positionMap: { [key: string]: string } = {
    'Pitcher': 'P',
    'Catcher': 'C',
    'First Base': '1B',
    'Second Base': '2B',
    'Third Base': '3B',
    'Shortstop': 'SS',
    'Left Field': 'LF',
    'Center Field': 'CF',
    'Right Field': 'RF',
    'Designated Hitter': 'DH',
    'Utility': 'UTIL',
  };
  return positionMap[position] || position.substring(0, 2).toUpperCase();
};

export interface PDFFormOptions {
  teamInfo: TeamInfo;
  battingOrder: Player[];
  benchPlayers: Player[];
  gameDate?: string;
}

export async function generateLineupPDFWithForms(options: PDFFormOptions): Promise<Uint8Array> {
  const { teamInfo, battingOrder, benchPlayers, gameDate = new Date().toLocaleDateString() } = options;

  try {
    console.log('Creating PDF with form fields...');
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Load the blank template image
    const templateResponse = await fetch('/Batting lineup blank.png');
    if (!templateResponse.ok) {
      throw new Error('Failed to load blank template image');
    }
    
    const templateBytes = await templateResponse.arrayBuffer();
    const templateImage = await pdfDoc.embedPng(templateBytes);
    
    // Get template dimensions
    const templateDims = templateImage.scale(1);
    const pageWidth = templateDims.width;
    const pageHeight = templateDims.height;
    
    console.log('Template dimensions:', pageWidth, 'x', pageHeight);
    
    // Add a page with template dimensions
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Draw the template as background
    page.drawImage(templateImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
    
    console.log('Template drawn to PDF');
    
    // Get the form
    const form = pdfDoc.getForm();
    
    // Embed fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Scale factors for coordinates (assuming template is 2828 x 4000)
    const scaleX = pageWidth / 2828;
    const scaleY = pageHeight / 4000;
    
    console.log('Scale factors:', { scaleX, scaleY });
    console.log('Actual template dimensions:', pageWidth, 'x', pageHeight);
    
    // Add team name and date form fields - positioned in top right of white area
    const teamNameField = form.createTextField('team_name');
    teamNameField.setText(teamInfo.name.toUpperCase());
    teamNameField.addToPage(page, {
      x: 2200 * scaleX, // Top right of white area
      y: 3200 * scaleY, // Top of white area
      width: 400 * scaleX, // Wider for team name
      height: 60 * scaleY, // Taller for larger text
      borderWidth: 0,
      backgroundColor: rgb(1, 1, 1), // Transparent
      textColor: rgb(0, 0, 0),
      font: boldFont,
    });
    
    const dateField = form.createTextField('game_date');
    dateField.setText(gameDate);
    dateField.addToPage(page, {
      x: 2200 * scaleX,
      y: 3150 * scaleY, // Below team name
      width: 400 * scaleX,
      height: 50 * scaleY,
      borderWidth: 0,
      backgroundColor: rgb(1, 1, 1), // Transparent
      textColor: rgb(0, 0, 0),
      font: boldFont,
    });
    
    // Add player form fields - positioned in the white batting order section
    // Y coordinates for the white batting order section (based on example image)
    const yCoordinates = [2800, 2750, 2700, 2650, 2600, 2550, 2500, 2450, 2400, 2350, 2300, 2250];
    
    battingOrder.forEach((player, index) => {
      if (index >= 12) return; // Limit to 12 players
      
      const yPosition = yCoordinates[index] * scaleY;
      
      // Player name field - positioned in white batting order section
      const nameField = form.createTextField(`player_${index + 1}_name`);
      nameField.setText(player.name.toUpperCase());
      nameField.addToPage(page, {
        x: 600 * scaleX, // Left side of white area
        y: yPosition,
        width: 400 * scaleX, // Much wider for longer names
        height: 60 * scaleY, // Much taller for larger text
        borderWidth: 0,
        backgroundColor: rgb(1, 1, 1), // Transparent
        textColor: rgb(0, 0, 0),
        font: boldFont,
      });
      
      // Player position field - positioned in white batting order section
      const positionField = form.createTextField(`player_${index + 1}_pos`);
      positionField.setText(getPositionAbbreviation(player.fieldingPosition));
      positionField.addToPage(page, {
        x: 1200 * scaleX, // Right side of white area
        y: yPosition,
        width: 150 * scaleX, // Wider for position text
        height: 60 * scaleY, // Much taller for larger text
        borderWidth: 0,
        backgroundColor: rgb(1, 1, 1), // Transparent
        textColor: rgb(0, 0, 0),
        font: boldFont,
      });
      
      console.log(`Added form fields for player ${index + 1}:`, player.name);
    });
    
    // Add bench players form field in the bottom section
    if (benchPlayers.length > 0) {
      console.log('Adding bench players:', benchPlayers.length);
      const benchText = benchPlayers.map(p => `${p.name.toUpperCase()} ${getPositionAbbreviation(p.fieldingPosition)}`).join(' ');
      
      const benchField = form.createTextField('bench_players');
      benchField.setText(benchText);
      benchField.addToPage(page, {
        x: 600 * scaleX, // Left side of white area
        y: 2000 * scaleY, // Bottom of white area
        width: 1000 * scaleX, // Wide to accommodate all names
        height: 80 * scaleY, // Much taller for better visibility
        borderWidth: 0,
        backgroundColor: rgb(1, 1, 1), // Transparent
        textColor: rgb(0, 0, 0),
        font: boldFont,
      });
      
      console.log('Bench players added:', benchText);
    }
    
    // Flatten the form to make it non-editable
    form.flatten();
    console.log('Form flattened');
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    console.log('PDF with form fields generated successfully');
    return pdfBytes;
    
  } catch (error) {
    console.error('Error generating PDF with forms:', error);
    throw error;
  }
}
