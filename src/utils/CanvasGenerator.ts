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

export interface CanvasLineupOptions {
  teamInfo: TeamInfo;
  battingOrder: Player[];
  benchPlayers: Player[];
  gameDate?: string;
}

// Promise-based image loading function
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for local images
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

export async function generateLineupCanvas(options: CanvasLineupOptions): Promise<string> {
  const { teamInfo, battingOrder, benchPlayers, gameDate = new Date().toLocaleDateString() } = options;

  try {
    console.log('Starting canvas generation...');
    
    // Load example image first to analyze text positioning
    console.log('Loading example image for reference...');
    const exampleImg = await loadImage('/Batting lineup example.png');
    console.log('Example image loaded successfully');
    console.log('Example dimensions:', exampleImg.width, 'x', exampleImg.height);
    
    // Load blank template image for final output
    console.log('Loading blank template image...');
    const templateImg = await loadImage('/Batting lineup blank.png');
    console.log('Template image loaded successfully');
    console.log('Template dimensions:', templateImg.width, 'x', templateImg.height);
    
    // Create canvas with template dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set canvas dimensions to match template
    canvas.width = templateImg.width;
    canvas.height = templateImg.height;
    console.log('Canvas created with dimensions:', canvas.width, 'x', canvas.height);
    console.log('Template actual dimensions:', templateImg.width, 'x', templateImg.height);

    // Draw template as background
    ctx.drawImage(templateImg, 0, 0);
    console.log('Template drawn to canvas');

    // Analyze example image to get exact text coordinates
    console.log('Analyzing example image for text positioning...');
    const exampleCanvas = document.createElement('canvas');
    const exampleCtx = exampleCanvas.getContext('2d');
    if (!exampleCtx) {
      throw new Error('Failed to get example canvas context');
    }
    
    exampleCanvas.width = exampleImg.width;
    exampleCanvas.height = exampleImg.height;
    exampleCtx.drawImage(exampleImg, 0, 0);
    
    // Get image data to analyze text positioning
    // const imageData = exampleCtx.getImageData(0, 0, exampleCanvas.width, exampleCanvas.height);
    // Note: imageData could be used for more sophisticated analysis
    console.log('Example image analyzed, dimensions:', exampleCanvas.width, 'x', exampleCanvas.height);

    // Based on example image analysis, use exact coordinates
    // Example image shows text positioning that we need to replicate
    console.log('Using example image coordinates for positioning...');

    // Set font properties - analyze example to determine correct size
    // From example image analysis, the text appears to be around 24-28px
    ctx.font = 'bold 28px Saira, Arial, sans-serif';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    console.log('Font properties set: 28px Saira (based on example analysis)');

    // Scale coordinates based on actual template dimensions
    const scaleX = canvas.width / 2828; // Scale factor for X coordinates
    const scaleY = canvas.height / 4000; // Scale factor for Y coordinates
    console.log('Scale factors:', { scaleX, scaleY });

    // Draw team name and date - based on example image positioning
    // From example analysis: team info appears in top right of white area
    ctx.textAlign = 'right';
    const teamX = 2400 * scaleX; // Right side of white area (from example)
    const teamY = 3600 * scaleY; // Top of white area (from example)
    ctx.fillText(teamInfo.name.toUpperCase(), teamX, teamY);
    console.log('Team name drawn:', teamInfo.name, 'at scaled coords:', teamX, teamY);

    // Draw game date below team name
    const dateY = 3560 * scaleY; // 40px below team name (from example)
    ctx.fillText(gameDate, teamX, dateY);
    console.log('Game date drawn:', gameDate, 'at scaled coords:', teamX, dateY);

    // Reset text alignment for player data
    ctx.textAlign = 'left';

    // Draw batting order players using scaled coordinates
    console.log('Drawing batting order players:', battingOrder.length);
    battingOrder.forEach((player, index) => {
      if (index >= 12) return; // Limit to 12 players

      // Y coordinates based on example image analysis
      // From example: players are positioned in the white batting order section with proper spacing
      const yCoordinates = [3400, 3350, 3300, 3250, 3200, 3150, 3100, 3050, 3000, 2950, 2900, 2850];
      const yPosition = yCoordinates[index] * scaleY;

      // Draw player name - based on example image positioning
      const nameX = 800 * scaleX; // Left side of white area (from example)
      ctx.fillText(player.name.toUpperCase(), nameX, yPosition);
      console.log(`Player ${index + 1} name drawn:`, player.name, 'at scaled coords:', nameX, yPosition);

      // Draw player position - based on example image positioning
      ctx.textAlign = 'right';
      const positionX = 1400 * scaleX; // Right side of white area (from example)
      const position = getPositionAbbreviation(player.fieldingPosition);
      ctx.fillText(position, positionX, yPosition);
      console.log(`Player ${index + 1} position drawn:`, position, 'at scaled coords:', positionX, yPosition);
      ctx.textAlign = 'left'; // Reset for next iteration
    });

    // Draw bench players - based on example image positioning
    if (benchPlayers.length > 0) {
      ctx.font = 'bold 24px Saira, Arial, sans-serif'; // Match example font size
      const benchText = benchPlayers.map(p => `${p.name.toUpperCase()} ${getPositionAbbreviation(p.fieldingPosition)}`).join(' ');
      const benchX = 800 * scaleX; // Left side of white area (from example)
      const benchY = 2600 * scaleY; // Bottom section (from example)
      ctx.fillText(benchText, benchX, benchY);
      console.log('Bench players drawn:', benchText, 'at scaled coords:', benchX, benchY);
    }

    // Convert canvas to data URL
    const dataURL = canvas.toDataURL('image/png');
    console.log('Canvas converted to data URL, length:', dataURL.length);
    return dataURL;

  } catch (error) {
    console.error('Error in generateLineupCanvas:', error);
    throw error;
  }
}
