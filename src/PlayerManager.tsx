import React, { useState } from 'react';
import { CSVImport } from './CSVImport';
import { Player, CSVFile } from './StorageService';

interface PlayerManagerProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  csvFiles: CSVFile[];
  onCSVImport: (csvData: CSVFile) => void;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({ players, onPlayersChange, csvFiles, onCSVImport }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleCSVImport = (csvData: any[], filename: string) => {
    console.log('handleCSVImport called with:', csvData.length, 'rows, filename:', filename);
    if (csvData.length === 0) {
      console.log('No CSV data to import');
      return;
    }

    // Find column mappings (same logic as BattingOrder)
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
    
    // If no name columns found, look for columns that might contain player names
    // Check if any column values look like names (contain letters and spaces)
    if (nameColumns.length === 0) {
      console.log('No standard name columns found, looking for name-like data...');
      for (let i = 0; i < Math.min(5, csvData.length); i++) {
        const row = csvData[i];
        for (const [key, value] of Object.entries(row)) {
          if (value && typeof value === 'string' && value.length > 2 && value.length < 50) {
            // Check if this looks like a name (contains letters, might have spaces, commas, or hyphens)
            if (/^[a-zA-Z\s,\-\.]+$/.test(value) && !/^\d+$/.test(value)) {
              console.log(`Found potential name column "${key}" with value: "${value}"`);
              nameColumns.push(key);
              break;
            }
          }
        }
        if (nameColumns.length > 0) break;
      }
    }
    
    const avgColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('AVG'));
    const obpColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('OBP'));
    const slgColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('SLG'));
    const opsColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('OPS'));
    const abColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('AB'));
    
    console.log('Stats columns found:', { avgColumn, obpColumn, slgColumn, opsColumn, abColumn });
    const sbColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('SB') && !firstRow[key].includes('%'));
    const sbPercentColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('SB%'));
    const bbKColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('BB/K'));
    const contactPercentColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('C%'));
    const qabPercentColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('QAB%'));
    const baRispColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('BA/RISP'));
    const twoOutRbiColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('2OUTRBI'));
    const xbhColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('XBH'));
    const hrColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('HR'));
    const tbColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('TB'));

    console.log('Name columns found:', { firstColumn, lastColumn, nameColumns });
    console.log('Sample row data:', csvData[0]);
    
    // Convert CSV data to players
    const importedPlayers: Player[] = csvData
      .filter(row => {
        const hasName = nameColumns.some(col => row[col] && row[col].trim());
        // If we have name columns, include the player even without stats
        if (nameColumns.length > 0) {
          return hasName;
        }
        // Fallback: if no name columns found, try to find any row that looks like it has player data
        return Object.values(row).some(value => 
          value && typeof value === 'string' && value.length > 2 && 
          /^[a-zA-Z\s,\-\.]+$/.test(value) && !/^\d+$/.test(value)
        );
      })
      .map((row, index) => {
        let firstName, lastName, displayName;
        
        // Handle separate First/Last columns
        if (firstColumn && lastColumn) {
          firstName = row[firstColumn] || '';
          lastName = row[lastColumn] || '';
          displayName = `${firstName} ${lastName}`.trim();
        } else {
          // Handle combined name columns
          const nameParts = nameColumns.map(col => row[col]).filter(Boolean);
          const fullName = nameParts.join(' ').trim();
          
          if (fullName.includes(',')) {
            // Format: "Last, First" - split by comma and reverse
            const parts = fullName.split(',').map(p => p.trim());
            lastName = parts[0] || '';
            firstName = parts[1] || '';
            displayName = `${firstName} ${lastName}`.trim();
          } else {
            // Format: "First Last" - use as is
            const namePartsArray = fullName.split(' ');
            firstName = namePartsArray[0] || '';
            lastName = namePartsArray.slice(1).join(' ') || '';
            displayName = fullName;
          }
        }
        
        const avg = avgColumn ? parseFloat(row[avgColumn]) || 0 : 0;
        const obp = obpColumn ? parseFloat(row[obpColumn]) || 0 : 0;
        const slg = slgColumn ? parseFloat(row[slgColumn]) || 0 : 0;
        const ops = opsColumn ? parseFloat(row[opsColumn]) || 0 : (obp + slg);
        const ab = abColumn ? parseFloat(row[abColumn]) || 0 : 0;
        const sb = sbColumn ? parseFloat(row[sbColumn]) || 0 : 0;
        const sb_percent = sbPercentColumn ? parseFloat(row[sbPercentColumn]) || 0 : 0;
        const bb_k = bbKColumn ? parseFloat(row[bbKColumn]) || 0 : 0;
        const contact_percent = contactPercentColumn ? parseFloat(row[contactPercentColumn]) || 0 : 0;
        const qab_percent = qabPercentColumn ? parseFloat(row[qabPercentColumn]) || 0 : 0;
        const ba_risp = baRispColumn ? parseFloat(row[baRispColumn]) || 0 : 0;
        const two_out_rbi = twoOutRbiColumn ? parseFloat(row[twoOutRbiColumn]) || 0 : 0;
        const xbh = xbhColumn ? parseFloat(row[xbhColumn]) || 0 : 0;
        const hr = hrColumn ? parseFloat(row[hrColumn]) || 0 : 0;
        const tb = tbColumn ? parseFloat(row[tbColumn]) || 0 : 0;
        
        return {
          id: generateId(),
          name: displayName,
          firstName,
          lastName,
          avg,
          obp,
          slg,
          ops,
          ab,
          sb,
          sb_percent,
          bb_k,
          contact_percent,
          qab_percent,
          ba_risp,
          two_out_rbi,
          xbh,
          hr,
          tb
        };
      })
      .filter(player => player.name.length > 0 && player.name !== 'First Last');

    // Add imported players to existing list (avoid duplicates by name)
    const existingNames = new Set(players.map(p => p.name.toLowerCase()));
    const newPlayers = importedPlayers.filter(p => !existingNames.has(p.name.toLowerCase()));
    
    console.log('Imported players created:', importedPlayers.length);
    console.log('New players (after filtering duplicates):', newPlayers.length);
    console.log('Sample imported player:', importedPlayers[0]);
    
    onPlayersChange([...players, ...newPlayers]);
    
    // Create CSV file record and notify parent
    const csvFile: CSVFile = {
      id: generateId(),
      filename,
      data: csvData,
      importedAt: new Date().toISOString(),
      playerCount: newPlayers.length
    };
    
    onCSVImport(csvFile);
  };


  const updatePlayer = (id: string, playerData: Partial<Player>) => {
    onPlayersChange(players.map(p => p.id === id ? { ...p, ...playerData } : p));
    setEditingPlayer(null);
  };

  const deletePlayer = (id: string) => {
    onPlayersChange(players.filter(p => p.id !== id));
  };


  const handleNameSubmit = () => {
    if (newPlayerName.trim()) {
      setShowAddDialog(false);
      setShowStatsDialog(true);
    }
  };

  const handleStatsSubmit = (statsData: Partial<Player>) => {
    const newPlayer: Player = {
      id: generateId(),
      name: newPlayerName.trim(),
      firstName: newPlayerName.trim().split(' ')[0] || '',
      lastName: newPlayerName.trim().split(' ').slice(1).join(' ') || '',
      avg: statsData.avg || 0,
      obp: statsData.obp || 0,
      slg: statsData.slg || 0,
      ops: statsData.ops || 0,
      sb: statsData.sb || 0,
      sb_percent: statsData.sb_percent || 0,
      bb_k: statsData.bb_k || 0,
      contact_percent: statsData.contact_percent || 0,
      qab_percent: statsData.qab_percent || 0,
      ba_risp: statsData.ba_risp || 0,
      two_out_rbi: statsData.two_out_rbi || 0,
      xbh: statsData.xbh || 0,
      hr: statsData.hr || 0,
      tb: statsData.tb || 0
    };
    
    onPlayersChange([...players, newPlayer]);
    setShowStatsDialog(false);
    setNewPlayerName('');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div>
          <button 
            onClick={() => {
              console.log('CSV button clicked');
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                console.log('File selected:', file?.name);
                if (file) {
                  // Use Papa Parse directly on the file (like the original CSVImport component)
                  import('papaparse').then((Papa) => {
                    Papa.default.parse(file, {
                      header: true,
                      complete: (result) => {
                        console.log('Papa Parse results:', result.data.length, 'rows');
                        console.log('Sample parsed data:', result.data[0]);
                        handleCSVImport(result.data, file.name);
                      },
                      error: (error) => {
                        console.error('CSV parsing error:', error);
                      }
                    });
                  });
                }
              };
              input.click();
            }}
            style={{
              background: 'var(--theme-accent)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              marginRight: '0.5rem',
              cursor: 'pointer'
            }}
          >
            📄 Add a Game Changer CSV
          </button>
          <button 
            onClick={() => setShowAddDialog(true)}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              marginRight: '0.5rem',
              cursor: 'pointer'
            }}
          >
            + Manually Add a Player
          </button>
        </div>
      </div>


      {/* Add Player Name Dialog */}
      {showAddDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            minWidth: '300px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Add New Player</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Player Name:
              </label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newPlayerName.trim()) {
                    handleNameSubmit();
                  }
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setNewPlayerName('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleNameSubmit}
                disabled={!newPlayerName.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  background: newPlayerName.trim() ? '#28a745' : '#ccc',
                  color: 'white',
                  cursor: newPlayerName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Stats Dialog */}
      {showStatsDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            minWidth: '400px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Add Stats for {newPlayerName} (Optional)</h3>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--theme-secondary)', fontSize: '0.9rem' }}>
              You can add baseball statistics now or leave them blank and add them later.
            </p>
            <PlayerStatsForm
              playerName={newPlayerName}
              onSave={handleStatsSubmit}
              onCancel={() => {
                setShowStatsDialog(false);
                setNewPlayerName('');
              }}
              onSkip={() => {
                handleStatsSubmit({});
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Player Form */}
      {editingPlayer && (
        <PlayerForm
          player={editingPlayer}
          onSave={(data) => updatePlayer(editingPlayer.id, data)}
          onCancel={() => {
            setEditingPlayer(null);
          }}
        />
      )}

    </div>
  );
};

// Player Form Component
interface PlayerFormProps {
  player?: Player | null;
  onSave: (playerData: Omit<Player, 'id'>) => void;
  onCancel: () => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ player, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: player?.name || '',
    firstName: player?.firstName || '',
    lastName: player?.lastName || '',
    avg: player?.avg || '',
    obp: player?.obp || '',
    slg: player?.slg || '',
    ops: player?.ops || '',
    sb: player?.sb || '',
    sb_percent: player?.sb_percent || '',
    bb_k: player?.bb_k || '',
    contact_percent: player?.contact_percent || '',
    qab_percent: player?.qab_percent || '',
    ba_risp: player?.ba_risp || '',
    two_out_rbi: player?.two_out_rbi || '',
    xbh: player?.xbh || '',
    hr: player?.hr || '',
    tb: player?.tb || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      // Update name from firstName and lastName if they're provided
      const fullName = formData.firstName && formData.lastName 
        ? `${formData.firstName} ${formData.lastName}`.trim()
        : formData.name;
      
      // Ensure display name is in "First Last" format
      const displayName = fullName;
      
      onSave({
        ...formData,
        name: displayName,
        firstName: formData.firstName || displayName.split(' ')[0] || '',
        lastName: formData.lastName || displayName.split(' ').slice(1).join(' ') || '',
        // Convert empty strings to 0 for numeric fields
        avg: formData.avg === '' ? 0 : (typeof formData.avg === 'number' ? formData.avg : parseFloat(formData.avg) || 0),
        obp: formData.obp === '' ? 0 : (typeof formData.obp === 'number' ? formData.obp : parseFloat(formData.obp) || 0),
        slg: formData.slg === '' ? 0 : (typeof formData.slg === 'number' ? formData.slg : parseFloat(formData.slg) || 0),
        ops: formData.ops === '' ? 0 : (typeof formData.ops === 'number' ? formData.ops : parseFloat(formData.ops) || 0),
        sb: formData.sb === '' ? 0 : (typeof formData.sb === 'number' ? formData.sb : parseFloat(formData.sb) || 0),
        sb_percent: formData.sb_percent === '' ? 0 : (typeof formData.sb_percent === 'number' ? formData.sb_percent : parseFloat(formData.sb_percent) || 0),
        bb_k: formData.bb_k === '' ? 0 : (typeof formData.bb_k === 'number' ? formData.bb_k : parseFloat(formData.bb_k) || 0),
        contact_percent: formData.contact_percent === '' ? 0 : (typeof formData.contact_percent === 'number' ? formData.contact_percent : parseFloat(formData.contact_percent) || 0),
        qab_percent: formData.qab_percent === '' ? 0 : (typeof formData.qab_percent === 'number' ? formData.qab_percent : parseFloat(formData.qab_percent) || 0),
        ba_risp: formData.ba_risp === '' ? 0 : (typeof formData.ba_risp === 'number' ? formData.ba_risp : parseFloat(formData.ba_risp) || 0),
        two_out_rbi: formData.two_out_rbi === '' ? 0 : (typeof formData.two_out_rbi === 'number' ? formData.two_out_rbi : parseFloat(formData.two_out_rbi) || 0),
        xbh: formData.xbh === '' ? 0 : (typeof formData.xbh === 'number' ? formData.xbh : parseFloat(formData.xbh) || 0),
        hr: formData.hr === '' ? 0 : (typeof formData.hr === 'number' ? formData.hr : parseFloat(formData.hr) || 0),
        tb: formData.tb === '' ? 0 : (typeof formData.tb === 'number' ? formData.tb : parseFloat(formData.tb) || 0)
      });
    }
  };

  return (
    <div style={{
      background: '#f8f9fa',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1rem'
    }}>
      <h3>{player ? 'Edit Player' : 'Add New Player'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="theme-border-primary-light" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '4px' }}>
          <strong>Basic Information</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {!player && (
            <div>
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., John Smith"
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
              />
            </div>
          )}
          
          <div>
            <label>First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Optional"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Optional"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
        </div>

        <div className="theme-border-accent-light" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '4px' }}>
          <strong>Baseball Statistics (Optional)</strong>
          <div style={{ fontSize: '0.9em', color: 'var(--theme-secondary)', marginTop: '0.25rem' }}>
            Leave blank if you don't have stats yet. You can add them later by editing the player.
          </div>
        </div>
          
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label>AVG (Batting Average)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={formData.avg || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, avg: parseFloat(e.target.value) || 0 }))}
              placeholder="0.000"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>OBP (On-Base Percentage)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={formData.obp || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, obp: parseFloat(e.target.value) || 0 }))}
              placeholder="0.000"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>SLG (Slugging Percentage)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.slg || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, slg: parseFloat(e.target.value) || 0 }))}
              placeholder="0.000"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>OPS (On-Base + Slugging)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.ops || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, ops: parseFloat(e.target.value) || 0 }))}
              placeholder="0.000"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>SB% (Stolen Base Percentage)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={formData.sb_percent || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, sb_percent: parseFloat(e.target.value) || 0 }))}
              placeholder="0.000"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
        </div>
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button type="submit" style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            {player ? 'Update' : 'Add'} Player
          </button>
          <button type="button" onClick={onCancel} style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Player Card Component
interface PlayerCardProps {
  player: Player;
  onEdit: () => void;
  onDelete: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onEdit, onDelete }) => {

  return (
    <div style={{
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '0.75rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <strong>{player.name}</strong>
      </div>
      <div>
        <button 
          onClick={onEdit}
          style={{
            background: '#ffc107',
            color: 'black',
            border: 'none',
            padding: '0.25rem 0.5rem',
            borderRadius: '3px',
            marginRight: '0.25rem',
            cursor: 'pointer',
            fontSize: '0.8em'
          }}
        >
          Edit
        </button>
        <button 
          onClick={onDelete}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.25rem 0.5rem',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.8em'
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Player Stats Form Component for the dialog
interface PlayerStatsFormProps {
  playerName: string;
  onSave: (statsData: Partial<Player>) => void;
  onCancel: () => void;
  onSkip: () => void;
}

const PlayerStatsForm: React.FC<PlayerStatsFormProps> = ({ playerName, onSave, onCancel, onSkip }) => {
  const [formData, setFormData] = useState({
    avg: '',
    obp: '',
    slg: '',
    ops: '',
    sb: '',
    sb_percent: '',
    bb_k: '',
    contact_percent: '',
    qab_percent: '',
    ba_risp: '',
    two_out_rbi: '',
    xbh: '',
    hr: '',
    tb: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const statsData = {
      // Convert empty strings to 0 for numeric fields
      avg: formData.avg === '' ? 0 : (typeof formData.avg === 'number' ? formData.avg : parseFloat(formData.avg) || 0),
      obp: formData.obp === '' ? 0 : (typeof formData.obp === 'number' ? formData.obp : parseFloat(formData.obp) || 0),
      slg: formData.slg === '' ? 0 : (typeof formData.slg === 'number' ? formData.slg : parseFloat(formData.slg) || 0),
      ops: formData.ops === '' ? 0 : (typeof formData.ops === 'number' ? formData.ops : parseFloat(formData.ops) || 0),
      sb: formData.sb === '' ? 0 : (typeof formData.sb === 'number' ? formData.sb : parseFloat(formData.sb) || 0),
      sb_percent: formData.sb_percent === '' ? 0 : (typeof formData.sb_percent === 'number' ? formData.sb_percent : parseFloat(formData.sb_percent) || 0),
      bb_k: formData.bb_k === '' ? 0 : (typeof formData.bb_k === 'number' ? formData.bb_k : parseFloat(formData.bb_k) || 0),
      contact_percent: formData.contact_percent === '' ? 0 : (typeof formData.contact_percent === 'number' ? formData.contact_percent : parseFloat(formData.contact_percent) || 0),
      qab_percent: formData.qab_percent === '' ? 0 : (typeof formData.qab_percent === 'number' ? formData.qab_percent : parseFloat(formData.qab_percent) || 0),
      ba_risp: formData.ba_risp === '' ? 0 : (typeof formData.ba_risp === 'number' ? formData.ba_risp : parseFloat(formData.ba_risp) || 0),
      two_out_rbi: formData.two_out_rbi === '' ? 0 : (typeof formData.two_out_rbi === 'number' ? formData.two_out_rbi : parseFloat(formData.two_out_rbi) || 0),
      xbh: formData.xbh === '' ? 0 : (typeof formData.xbh === 'number' ? formData.xbh : parseFloat(formData.xbh) || 0),
      hr: formData.hr === '' ? 0 : (typeof formData.hr === 'number' ? formData.hr : parseFloat(formData.hr) || 0),
      tb: formData.tb === '' ? 0 : (typeof formData.tb === 'number' ? formData.tb : parseFloat(formData.tb) || 0)
    };
    
    onSave(statsData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
            AVG (Batting Average):
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            max="1"
            value={formData.avg}
            onChange={(e) => handleInputChange('avg', e.target.value)}
            placeholder="0.000"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
            OBP (On-Base %):
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            max="1"
            value={formData.obp}
            onChange={(e) => handleInputChange('obp', e.target.value)}
            placeholder="0.000"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
            SLG (Slugging %):
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            max="4"
            value={formData.slg}
            onChange={(e) => handleInputChange('slg', e.target.value)}
            placeholder="0.000"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
            OPS (On-Base + Slugging):
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            max="5"
            value={formData.ops}
            onChange={(e) => handleInputChange('ops', e.target.value)}
            placeholder="0.000"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSkip}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #6c757d',
            borderRadius: '4px',
            background: '#6c757d',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Skip Stats
        </button>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            background: '#28a745',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Manually Add a Player
        </button>
      </div>
    </form>
  );
};
