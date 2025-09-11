import React from 'react';


interface Player {
  name: string;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  sb: number;
  sbPercent: number;
  bbK: number;
  contactPercent: number;
  qabPercent: number;
  baRisp: number;
  twoOutRbi: number;
  xbh: number;
  hr: number;
  tb: number;
}

interface BattingOrderProps {
  csvData: any[];
}

const BattingOrder: React.FC<BattingOrderProps> = ({ csvData }) => {
  const generateBattingOrder = () => {
    if (csvData.length === 0) return [];
    
    // Debug: Log the first row to see actual column names
    console.log('CSV Column headers:', Object.keys(csvData[0]));
    console.log('First row sample:', csvData[0]);
    
    // The actual column names are in the first row's VALUES, not the headers
    // Headers are generic (_1, _2, etc.) but first row contains the real column names
    const firstRow = csvData[0];
    const headerKeys = Object.keys(firstRow);
    
    // Find name columns - prioritize specific First/Last columns
    const firstColumn = headerKeys.find(key => {
      const value = firstRow[key];
      return value && value.toLowerCase().includes('first');
    });
    
    const lastColumn = headerKeys.find(key => {
      const value = firstRow[key];
      return value && value.toLowerCase().includes('last');
    });
    
    const nameColumns = headerKeys.filter(key => {
      const value = firstRow[key];
      return value && (value.toLowerCase().includes('name') || 
                      value.toLowerCase().includes('first') || 
                      value.toLowerCase().includes('last'));
    });
    
    // GameChanger CSV format - use exact column positions (row 2 contains headers)
    const avgColumn = headerKeys[6];   // Column 7: AVG
    const obpColumn = headerKeys[7];   // Column 8: OBP  
    const slgColumn = headerKeys[9];   // Column 10: SLG
    const opsColumn = headerKeys[8];   // Column 9: OPS
    
    // Additional advanced stats - GameChanger CSV positions
    const sbColumn = headerKeys[25];   // Column 26: SB
    const sbPercentColumn = headerKeys[26]; // Column 27: SB%
    const bbKColumn = headerKeys[31];  // Column 32: BB/K
    const contactPercentColumn = headerKeys[32]; // Column 33: C%
    const qabPercentColumn = headerKeys[29]; // Column 30: QAB%
    const baRispColumn = headerKeys[38]; // Column 39: BA/RISP
    const twoOutRbiColumn = headerKeys[40]; // Column 41: 2OUTRBI
    const xbhColumn = headerKeys[41];  // Column 42: XBH
    const hrColumn = headerKeys[13];   // Column 14: HR
    const tbColumn = headerKeys[42];   // Column 43: TB
    const lobColumn = headerKeys[39];  // Column 40: LOB
    
    console.log('Found columns:', { nameColumns, avgColumn, obpColumn, slgColumn, opsColumn });
    console.log('First row values:', firstRow);
    
    // Convert CSV data to players with stats using actual column names
    // Skip the first row since it contains the column names, not player data
    const allPlayers: Player[] = csvData
      .slice(1) // Skip the header row
      .filter(row => {
        // Look for rows that have batting stats (not empty rows)
        const hasName = nameColumns.some(col => row[col] && row[col].trim());
        const hasStats = (avgColumn && row[avgColumn] && !isNaN(parseFloat(row[avgColumn]))) || 
                        (obpColumn && row[obpColumn] && !isNaN(parseFloat(row[obpColumn]))) || 
                        (slgColumn && row[slgColumn] && !isNaN(parseFloat(row[slgColumn])));
        return hasName && hasStats;
      })
      .map(row => {
        // Build name from available name columns
        let name;
        
        // Handle separate First/Last columns
        if (firstColumn && lastColumn) {
          const firstName = row[firstColumn] || '';
          const lastName = row[lastColumn] || '';
          name = `${firstName} ${lastName}`.trim();
        } else {
          // Handle combined name columns
          const nameParts = nameColumns.map(col => row[col]).filter(Boolean);
          const fullName = nameParts.join(' ').trim();
          
          if (fullName.includes(',')) {
            // Format: "Last, First" - split by comma and reverse
            const parts = fullName.split(',').map(p => p.trim());
            const lastName = parts[0] || '';
            const firstName = parts[1] || '';
            name = `${firstName} ${lastName}`.trim();
          } else {
            // Format: "First Last" - use as is
            name = fullName;
          }
        }
        
        // Get stats from actual column names
        const avg = avgColumn ? parseFloat(row[avgColumn]) || 0 : 0;
        const obp = obpColumn ? parseFloat(row[obpColumn]) || 0 : 0;
        const slg = slgColumn ? parseFloat(row[slgColumn]) || 0 : 0;
        const ops = opsColumn ? parseFloat(row[opsColumn]) || 0 : (obp + slg);
        
        // Additional advanced stats - GameChanger CSV format
        const sb = sbColumn ? parseFloat(row[sbColumn]) || 0 : 0;
        const sbPercent = sbPercentColumn ? parseFloat(row[sbPercentColumn]) || 0 : 0;
        const bbK = bbKColumn ? parseFloat(row[bbKColumn]) || 0 : 0;
        const contactPercent = contactPercentColumn ? parseFloat(row[contactPercentColumn]) || 0 : 0;
        const qabPercent = qabPercentColumn ? parseFloat(row[qabPercentColumn]) || 0 : 0;
        const baRisp = baRispColumn ? parseFloat(row[baRispColumn]) || 0 : 0;
        const twoOutRbi = twoOutRbiColumn ? parseFloat(row[twoOutRbiColumn]) || 0 : 0;
        const xbh = xbhColumn ? parseFloat(row[xbhColumn]) || 0 : 0;
        const hr = hrColumn ? parseFloat(row[hrColumn]) || 0 : 0;
        const tb = tbColumn ? parseFloat(row[tbColumn]) || 0 : 0;
        const lob = lobColumn ? parseFloat(row[lobColumn]) || 0 : 0;
        
        return {
          name,
          avg,
          obp,
          slg,
          ops,
          sb,
          sbPercent,
          bbK,
          contactPercent,
          qabPercent,
          baRisp,
          twoOutRbi,
          xbh,
          hr,
          tb,
          lob
        };
      })
      .filter(player => player.avg > 0 && player.name.length > 0); // Only players with batting stats and names

    if (allPlayers.length === 0) return [];

    // Traditional Batting Order Strategy
    const battingOrder: Player[] = new Array(9).fill(null);
    const usedPlayers = new Set<string>();

    // Helper function to find best available player by criteria
    const findBestPlayer = (criteria: (player: Player) => number, excludeUsed = true) => {
      return allPlayers
        .filter(player => !excludeUsed || !usedPlayers.has(player.name))
        .sort((a, b) => criteria(b) - criteria(a))[0];
    };

    // Helper function to assign player to position
    const assignPlayer = (position: number, player: Player | undefined) => {
      if (player) {
        battingOrder[position] = player;
        usedPlayers.add(player.name);
      }
    };

    // 1. Lead-off (1st): High OBP + Speed + Contact + Low K%
    const leadoff = findBestPlayer(player => 
      player.obp * 0.5 + 
      player.sbPercent * 0.2 + 
      player.contactPercent * 0.2 + 
      player.avg * 0.1
    );
    assignPlayer(0, leadoff);

    // 2. Second (2nd): High contact + Situational hitting + Can move runners
    const second = findBestPlayer(player => 
      player.contactPercent * 0.4 + 
      player.baRisp * 0.3 + 
      player.avg * 0.2 + 
      player.qabPercent * 0.1
    );
    assignPlayer(1, second);

    // 3. Third (3rd): Best overall hitter (highest OPS + Quality at-bats)
    const third = findBestPlayer(player => 
      player.ops * 0.7 + 
      player.qabPercent * 0.3
    );
    assignPlayer(2, third);

    // 4. Clean-up (4th): Power hitter + RBI production
    const cleanup = findBestPlayer(player => 
      player.slg * 0.4 + 
      player.twoOutRbi * 0.3 + 
      player.xbh * 0.2 + 
      player.baRisp * 0.1
    );
    assignPlayer(3, cleanup);

    // 5. Fifth: Second best power + Clutch hitting
    const fifth = findBestPlayer(player => 
      player.slg * 0.4 + 
      player.baRisp * 0.3 + 
      player.ops * 0.2 + 
      player.twoOutRbi * 0.1
    );
    assignPlayer(4, fifth);

    // 6-9. Fill remaining positions by OPS (descending)
    const remainingPlayers = allPlayers
      .filter(player => !usedPlayers.has(player.name))
      .sort((a, b) => b.ops - a.ops);

    for (let i = 5; i < 9; i++) {
      if (remainingPlayers[i - 5]) {
        battingOrder[i] = remainingPlayers[i - 5];
      }
    }

    return battingOrder.filter(player => player !== null);
  };

  const battingOrder = generateBattingOrder();

  if (battingOrder.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p>Import CSV with player batting stats to generate batting order</p>
        
        {/* DEBUG INFO - Remove this after fixing */}
        {csvData.length > 0 && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f0f0f0', 
            borderRadius: '4px',
            textAlign: 'left',
            fontSize: '0.8em'
          }}>
            <h4>Debug Information:</h4>
            <div><strong>Total CSV rows:</strong> {csvData.length}</div>
            <div><strong>Column headers:</strong> {Object.keys(csvData[0]).slice(0, 10).join(', ')}...</div>
            
            {/* Show column detection results */}
            {(() => {
              const headers = Object.keys(csvData[0]);
              const nameColumns = headers.filter(h => h.toLowerCase().includes('name') || h.toLowerCase().includes('first') || h.toLowerCase().includes('last'));
              const avgColumn = headers.find(h => h.toUpperCase().includes('AVG'));
              const obpColumn = headers.find(h => h.toUpperCase().includes('OBP'));
              const slgColumn = headers.find(h => h.toUpperCase().includes('SLG'));
              const opsColumn = headers.find(h => h.toUpperCase().includes('OPS'));
              
              return (
                <div style={{ marginTop: '0.5rem' }}>
                  <div><strong>Detected columns:</strong></div>
                  <div>• Name columns: {nameColumns.length > 0 ? nameColumns.join(', ') : 'None found'}</div>
                  <div>• AVG column: {avgColumn || 'Not found'}</div>
                  <div>• OBP column: {obpColumn || 'Not found'}</div>
                  <div>• SLG column: {slgColumn || 'Not found'}</div>
                  <div>• OPS column: {opsColumn || 'Not found'}</div>
                </div>
              );
            })()}
            
            {/* Show first row sample */}
            {csvData[0] && (
              <div style={{ marginTop: '0.5rem' }}>
                <div><strong>First row sample:</strong></div>
                <div style={{ fontSize: '0.7em', background: 'white', padding: '0.5rem', marginTop: '0.25rem' }}>
                  {JSON.stringify(csvData[0], null, 2)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: '#f0f8ff',
      padding: '2rem',
      borderRadius: '8px',
      margin: '1rem 0'
    }}>
      <h2>⚾ Generated Batting Order</h2>
      <div style={{
        display: 'grid',
        gap: '0.5rem',
        maxWidth: '400px'
      }}>
        {battingOrder.map((player, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            background: 'white',
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <div style={{
              background: '#FFC107',
              color: 'black',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              marginRight: '1rem'
            }}>
              {index + 1}
            </div>
            <div style={{ flex: 1 }}>
              <strong>{player.name}</strong>
              <div style={{ fontSize: '0.8em', color: '#666' }}>
                AVG: {player.avg.toFixed(3)} | OBP: {player.obp.toFixed(3)} | SLG: {player.slg.toFixed(3)}
                {player.sbPercent > 0 && <span> | SB%: {(player.sbPercent * 100).toFixed(0)}%</span>}
                {player.baRisp > 0 && <span> | RISP: {player.baRisp.toFixed(3)}</span>}
                {player.contactPercent > 0 && <span> | Contact: {(player.contactPercent * 100).toFixed(0)}%</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattingOrder;