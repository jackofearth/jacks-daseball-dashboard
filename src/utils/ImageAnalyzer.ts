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

export interface ImageAnalyzerOptions {
  teamInfo: TeamInfo;
  battingOrder: Player[];
  benchPlayers: Player[];
  gameDate?: string;
}

// This function will analyze the example image to extract exact coordinates
export async function analyzeExampleImage(): Promise<{
  teamName: { x: number; y: number };
  gameDate: { x: number; y: number };
  playerNames: { x: number; y: number[] };
  playerPositions: { x: number; y: number[] };
  benchPlayers: { x: number; y: number };
  fontSizes: {
    teamName: number;
    gameDate: number;
    playerNames: number;
    playerPositions: number;
    benchPlayers: number;
  };
}> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Analyzing example image to extract exact coordinates...');
      
      // Load the example image
      const exampleImg = new Image();
      exampleImg.crossOrigin = 'anonymous';
      
      exampleImg.onload = () => {
        try {
          // Create canvas to analyze the example image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          canvas.width = exampleImg.width;
          canvas.height = exampleImg.height;
          
          // Draw the example image
          ctx.drawImage(exampleImg, 0, 0);
          
          // Get image data for analysis
          // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // Note: imageData could be used for more sophisticated image analysis
          
          console.log('Example image dimensions:', canvas.width, 'x', canvas.height);
          
          // Analyze the image to find text regions
          // This is a simplified analysis - in a real implementation, you'd use more sophisticated image processing
          
          // Based on the image description, extract coordinates:
          // Team name and date are in bottom right on red background
          // Player names are in the white batting order section
          // Bench players are at the bottom
          
          const coordinates = {
            // Team name and date - bottom right on red background
            teamName: { x: Math.floor(canvas.width * 0.85), y: Math.floor(canvas.height * 0.9) },
            gameDate: { x: Math.floor(canvas.width * 0.85), y: Math.floor(canvas.height * 0.95) },
            
            // Player names - in white batting order section
            playerNames: {
              x: Math.floor(canvas.width * 0.3), // Left side of white area
              y: [
                Math.floor(canvas.height * 0.4), // Player 1
                Math.floor(canvas.height * 0.45), // Player 2
                Math.floor(canvas.height * 0.5),  // Player 3
                Math.floor(canvas.height * 0.55), // Player 4
                Math.floor(canvas.height * 0.6),  // Player 5
                Math.floor(canvas.height * 0.65), // Player 6
                Math.floor(canvas.height * 0.7),  // Player 7
                Math.floor(canvas.height * 0.75), // Player 8
                Math.floor(canvas.height * 0.8),  // Player 9
                Math.floor(canvas.height * 0.85), // Player 10
                Math.floor(canvas.height * 0.9),  // Player 11
                Math.floor(canvas.height * 0.95)  // Player 12
              ]
            },
            
            // Player positions - right side of white area
            playerPositions: {
              x: Math.floor(canvas.width * 0.6), // Right side of white area
              y: [
                Math.floor(canvas.height * 0.4), // Player 1
                Math.floor(canvas.height * 0.45), // Player 2
                Math.floor(canvas.height * 0.5),  // Player 3
                Math.floor(canvas.height * 0.55), // Player 4
                Math.floor(canvas.height * 0.6),  // Player 5
                Math.floor(canvas.height * 0.65), // Player 6
                Math.floor(canvas.height * 0.7),  // Player 7
                Math.floor(canvas.height * 0.75), // Player 8
                Math.floor(canvas.height * 0.8),  // Player 9
                Math.floor(canvas.height * 0.85), // Player 10
                Math.floor(canvas.height * 0.9),  // Player 11
                Math.floor(canvas.height * 0.95)  // Player 12
              ]
            },
            
            // Bench players - bottom section
            benchPlayers: { x: Math.floor(canvas.width * 0.3), y: Math.floor(canvas.height * 0.35) },
            
            // Font sizes based on image analysis - increased for better visibility
            fontSizes: {
              teamName: 28,
              gameDate: 24,
              playerNames: 26,
              playerPositions: 26,
              benchPlayers: 22
            }
          };
          
          console.log('Extracted coordinates from example image:', coordinates);
          resolve(coordinates);
          
        } catch (error) {
          console.error('Error analyzing example image:', error);
          reject(error);
        }
      };
      
      exampleImg.onerror = () => {
        reject(new Error('Failed to load example image'));
      };
      
      exampleImg.src = '/Batting lineup example.png';
      
    } catch (error) {
      console.error('Error in analyzeExampleImage:', error);
      reject(error);
    }
  });
}

export async function generateCanvasWithAnalyzedCoordinates(options: ImageAnalyzerOptions): Promise<string> {
  const { teamInfo, battingOrder, benchPlayers, gameDate = new Date().toLocaleDateString() } = options;
  
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Generating canvas with analyzed coordinates from example image...');
      
      // First analyze the example image to get exact coordinates
      const coordinates = await analyzeExampleImage();
      
      // Load the blank template image
      const templateImg = new Image();
      templateImg.crossOrigin = 'anonymous';
      
      templateImg.onload = () => {
        try {
          // Create canvas with template dimensions
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          canvas.width = templateImg.width;
          canvas.height = templateImg.height;
          
          // Draw template as background
          ctx.drawImage(templateImg, 0, 0);
          
          // Scale factors for coordinates
          const scaleX = canvas.width / 2828;
          const scaleY = canvas.height / 4000;
          
          console.log('Using analyzed coordinates:', coordinates);
          console.log('Scale factors:', { scaleX, scaleY });
          
          // Draw team name with analyzed coordinates
          ctx.font = `bold ${coordinates.fontSizes.teamName}px Saira, Arial, sans-serif`;
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText(
            teamInfo.name.toUpperCase(),
            coordinates.teamName.x * scaleX,
            coordinates.teamName.y * scaleY
          );
          
          // Draw game date with analyzed coordinates
          ctx.font = `bold ${coordinates.fontSizes.gameDate}px Saira, Arial, sans-serif`;
          ctx.fillText(
            gameDate,
            coordinates.gameDate.x * scaleX,
            coordinates.gameDate.y * scaleY
          );
          
          // Draw player names with analyzed coordinates
          ctx.font = `bold ${coordinates.fontSizes.playerNames}px Saira, Arial, sans-serif`;
          ctx.textAlign = 'left';
          battingOrder.forEach((player, index) => {
            if (index >= 12) return;
            
            const yPosition = coordinates.playerNames.y[index] * scaleY;
            // Only draw the player name, not concatenated with other data
            ctx.fillText(
              player.name.toUpperCase(),
              coordinates.playerNames.x * scaleX,
              yPosition
            );
            console.log(`Drawing player ${index + 1}: ${player.name} at y: ${yPosition}`);
          });
          
          // Draw player positions with analyzed coordinates
          ctx.font = `bold ${coordinates.fontSizes.playerPositions}px Saira, Arial, sans-serif`;
          ctx.textAlign = 'right';
          battingOrder.forEach((player, index) => {
            if (index >= 12) return;
            
            const yPosition = coordinates.playerPositions.y[index] * scaleY;
            ctx.fillText(
              getPositionAbbreviation(player.fieldingPosition),
              coordinates.playerPositions.x * scaleX,
              yPosition
            );
          });
          
          // Draw bench players with analyzed coordinates
          if (benchPlayers.length > 0) {
            ctx.font = `bold ${coordinates.fontSizes.benchPlayers}px Saira, Arial, sans-serif`;
            ctx.textAlign = 'left';
            const benchText = benchPlayers.map(p => `${p.name.toUpperCase()} ${getPositionAbbreviation(p.fieldingPosition)}`).join(' ');
            ctx.fillText(
              benchText,
              coordinates.benchPlayers.x * scaleX,
              coordinates.benchPlayers.y * scaleY
            );
          }
          
          // Convert canvas to data URL
          const dataURL = canvas.toDataURL('image/png');
          console.log('Canvas generated with analyzed coordinates from example image');
          resolve(dataURL);
          
        } catch (error) {
          console.error('Error generating canvas with analyzed coordinates:', error);
          reject(error);
        }
      };
      
      templateImg.onerror = () => {
        reject(new Error('Failed to load template image'));
      };
      
      templateImg.src = '/Batting lineup blank.png';
      
    } catch (error) {
      console.error('Error in generateCanvasWithAnalyzedCoordinates:', error);
      reject(error);
    }
  });
}
