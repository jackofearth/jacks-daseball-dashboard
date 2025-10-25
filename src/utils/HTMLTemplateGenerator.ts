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

export interface HTMLTemplateOptions {
  teamInfo: TeamInfo;
  battingOrder: Player[];
  benchPlayers: Player[];
  gameDate?: string;
}

export function generateHTMLTemplate(options: HTMLTemplateOptions): string {
  const { teamInfo, battingOrder, benchPlayers, gameDate = new Date().toLocaleDateString() } = options;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Baseball Lineup Card</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Saira:wght@400;600;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          font-family: 'Saira', Arial, sans-serif;
          background: #f0f0f0;
        }
        
        .lineup-card {
          width: 2828px;
          height: 4000px;
          position: relative;
          background-image: url('/Batting lineup blank.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        
        .team-info {
          position: absolute;
          top: 200px;
          right: 200px;
          text-align: right;
          color: #000;
        }
        
        .team-name {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .game-date {
          font-size: 24px;
          font-weight: normal;
        }
        
        .player-list {
          position: absolute;
          top: 800px;
          left: 400px;
          right: 400px;
        }
        
        .player-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          font-size: 28px;
          font-weight: bold;
        }
        
        .player-name {
          color: #000;
        }
        
        .player-position {
          color: #000;
        }
        
        .bench-section {
          position: absolute;
          bottom: 400px;
          left: 400px;
          right: 400px;
        }
        
        .bench-label {
          font-size: 36px;
          font-weight: bold;
          color: #000;
          margin-bottom: 20px;
        }
        
        .bench-players {
          font-size: 24px;
          color: #000;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="lineup-card">
        <div class="team-info">
          <div class="team-name">${teamInfo.name.toUpperCase()}</div>
          <div class="game-date">${gameDate}</div>
        </div>
        
        <div class="player-list">
          ${battingOrder.map((player, index) => `
            <div class="player-row">
              <span class="player-name">${player.name.toUpperCase()}</span>
              <span class="player-position">${getPositionAbbreviation(player.fieldingPosition)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="bench-section">
          <div class="bench-label">BENCH</div>
          <div class="bench-players">
            ${benchPlayers.map(p => `${p.name.toUpperCase()} ${getPositionAbbreviation(p.fieldingPosition)}`).join(' ')}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}
