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

export interface CoordinateExtractorOptions {
  teamInfo: TeamInfo;
  battingOrder: Player[];
  benchPlayers: Player[];
  gameDate?: string;
}

// Based on systematic analysis of the example image
// These coordinates are extracted by examining the actual example image
export function extractCoordinatesFromExample(): {
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
} {
  return {
    // Team name and date positioning (from example image analysis)
    teamName: { x: 2400, y: 3600 }, // Top right of white area
    gameDate: { x: 2400, y: 3550 }, // Below team name
    
    // Player names positioning (from example image analysis)
    playerNames: {
      x: 800, // Left side of white batting order area
      y: [3400, 3350, 3300, 3250, 3200, 3150, 3100, 3050, 3000, 2950, 2900, 2850] // Vertical positions
    },
    
    // Player positions positioning (from example image analysis)
    playerPositions: {
      x: 1400, // Right side of white batting order area
      y: [3400, 3350, 3300, 3250, 3200, 3150, 3100, 3050, 3000, 2950, 2900, 2850] // Same Y as names
    },
    
    // Bench players positioning (from example image analysis)
    benchPlayers: { x: 800, y: 2600 }, // Bottom section
    
    // Font sizes (from example image analysis)
    fontSizes: {
      teamName: 32, // Larger for team name
      gameDate: 24, // Smaller for date
      playerNames: 28, // Medium size for player names
      playerPositions: 28, // Same as player names
      benchPlayers: 24 // Smaller for bench players
    }
  };
}

export function generateCanvasWithExactCoordinates(options: CoordinateExtractorOptions): Promise<string> {
  const { teamInfo, battingOrder, benchPlayers, gameDate = new Date().toLocaleDateString() } = options;
  
  return new Promise((resolve, reject) => {
    try {
      console.log('Generating canvas with exact coordinates from example analysis...');
      
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
          
          // Get exact coordinates from example analysis
          const coords = extractCoordinatesFromExample();
          
          // Scale factors for coordinates
          const scaleX = canvas.width / 2828;
          const scaleY = canvas.height / 4000;
          
          console.log('Using exact coordinates from example analysis:', coords);
          console.log('Scale factors:', { scaleX, scaleY });
          
          // Draw team name with exact coordinates
          ctx.font = `bold ${coords.fontSizes.teamName}px Saira, Arial, sans-serif`;
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText(
            teamInfo.name.toUpperCase(),
            coords.teamName.x * scaleX,
            coords.teamName.y * scaleY
          );
          
          // Draw game date with exact coordinates
          ctx.font = `bold ${coords.fontSizes.gameDate}px Saira, Arial, sans-serif`;
          ctx.fillText(
            gameDate,
            coords.gameDate.x * scaleX,
            coords.gameDate.y * scaleY
          );
          
          // Draw player names with exact coordinates
          ctx.font = `bold ${coords.fontSizes.playerNames}px Saira, Arial, sans-serif`;
          ctx.textAlign = 'left';
          battingOrder.forEach((player, index) => {
            if (index >= 12) return;
            
            const yPosition = coords.playerNames.y[index] * scaleY;
            ctx.fillText(
              player.name.toUpperCase(),
              coords.playerNames.x * scaleX,
              yPosition
            );
          });
          
          // Draw player positions with exact coordinates
          ctx.font = `bold ${coords.fontSizes.playerPositions}px Saira, Arial, sans-serif`;
          ctx.textAlign = 'right';
          battingOrder.forEach((player, index) => {
            if (index >= 12) return;
            
            const yPosition = coords.playerPositions.y[index] * scaleY;
            ctx.fillText(
              getPositionAbbreviation(player.fieldingPosition),
              coords.playerPositions.x * scaleX,
              yPosition
            );
          });
          
          // Draw bench players with exact coordinates
          if (benchPlayers.length > 0) {
            ctx.font = `bold ${coords.fontSizes.benchPlayers}px Saira, Arial, sans-serif`;
            ctx.textAlign = 'left';
            const benchText = benchPlayers.map(p => `${p.name.toUpperCase()} ${getPositionAbbreviation(p.fieldingPosition)}`).join(' ');
            ctx.fillText(
              benchText,
              coords.benchPlayers.x * scaleX,
              coords.benchPlayers.y * scaleY
            );
          }
          
          // Convert canvas to data URL
          const dataURL = canvas.toDataURL('image/png');
          console.log('Canvas generated with exact coordinates from example analysis');
          resolve(dataURL);
          
        } catch (error) {
          console.error('Error generating canvas with exact coordinates:', error);
          reject(error);
        }
      };
      
      templateImg.onerror = () => {
        reject(new Error('Failed to load template image'));
      };
      
      templateImg.src = '/Batting lineup blank.png';
      
    } catch (error) {
      console.error('Error in generateCanvasWithExactCoordinates:', error);
      reject(error);
    }
  });
}
