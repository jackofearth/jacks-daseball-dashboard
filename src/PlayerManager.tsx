import React, { useState, useEffect } from 'react';
import { CSVImport } from './CSVImport';

export interface Player {
  id: string;
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

interface PlayerManagerProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({ players, onPlayersChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [lastCSVImport, setLastCSVImport] = useState<{ filename: string; count: number; timestamp: string } | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleCSVImport = (csvData: any[], filename: string) => {
    if (csvData.length === 0) return;

    // Find column mappings (same logic as BattingOrder)
    const firstRow = csvData[0];
    const headerKeys = Object.keys(firstRow);
    
    const nameColumns = headerKeys.filter(key => {
      const value = firstRow[key];
      return value && (value.toLowerCase().includes('name') || 
                      value.toLowerCase().includes('first') || 
                      value.toLowerCase().includes('last'));
    });
    
    const avgColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('AVG'));
    const obpColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('OBP'));
    const slgColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('SLG'));
    const opsColumn = headerKeys.find(key => firstRow[key] && firstRow[key].toUpperCase().includes('OPS'));
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

    // Convert CSV data to players
    const importedPlayers: Player[] = csvData
      .slice(1) // Skip header row
      .filter(row => {
        const hasName = nameColumns.some(col => row[col] && row[col].trim());
        const hasStats = (avgColumn && row[avgColumn] && !isNaN(parseFloat(row[avgColumn]))) || 
                        (obpColumn && row[obpColumn] && !isNaN(parseFloat(row[obpColumn]))) || 
                        (slgColumn && row[slgColumn] && !isNaN(parseFloat(row[slgColumn])));
        return hasName && hasStats;
      })
      .map(row => {
        const nameParts = nameColumns.map(col => row[col]).filter(Boolean);
        const name = nameParts.join(' ').trim();
        
        const avg = avgColumn ? parseFloat(row[avgColumn]) || 0 : 0;
        const obp = obpColumn ? parseFloat(row[obpColumn]) || 0 : 0;
        const slg = slgColumn ? parseFloat(row[slgColumn]) || 0 : 0;
        const ops = opsColumn ? parseFloat(row[opsColumn]) || 0 : (obp + slg);
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
        
        return {
          id: generateId(),
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
          tb
        };
      })
      .filter(player => player.avg > 0 && player.name.length > 0);

    // Add imported players to existing list (avoid duplicates by name)
    const existingNames = new Set(players.map(p => p.name.toLowerCase()));
    const newPlayers = importedPlayers.filter(p => !existingNames.has(p.name.toLowerCase()));
    
    onPlayersChange([...players, ...newPlayers]);
    
    // Record the CSV import
    setLastCSVImport({
      filename,
      count: newPlayers.length,
      timestamp: new Date().toLocaleString()
    });
  };

  const addPlayer = (playerData: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: generateId()
    };
    onPlayersChange([...players, newPlayer]);
    setShowAddForm(false);
  };

  const updatePlayer = (id: string, playerData: Partial<Player>) => {
    onPlayersChange(players.map(p => p.id === id ? { ...p, ...playerData } : p));
    setEditingPlayer(null);
  };

  const deletePlayer = (id: string) => {
    onPlayersChange(players.filter(p => p.id !== id));
  };

  const clearAllPlayers = () => {
    if (window.confirm('Are you sure you want to clear all players? This will also clear your batting order.')) {
      onPlayersChange([]);
      // Also clear the batting order since players are gone
      localStorage.removeItem('baseball-batting-order');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2>👥 Player Management</h2>
        <div>
          <button 
            onClick={() => setShowAddForm(true)}
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
            + Add Player
          </button>
          <button 
            onClick={clearAllPlayers}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="Clear all players and batting order"
          >
            🗑️ Clear All Players
          </button>
        </div>
      </div>

      {/* CSV Import */}
      <div style={{ marginBottom: '2rem' }}>
        <CSVImport onDataImported={handleCSVImport} />
        
        {/* CSV Import Record */}
        {lastCSVImport && (
          <div style={{
            background: '#e8f5e8',
            border: '1px solid #28a745',
            borderRadius: '4px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#155724' }}>
              📄 Last CSV Import
            </h4>
            <div style={{ fontSize: '0.9em', color: '#155724' }}>
              <div><strong>File:</strong> {lastCSVImport.filename}</div>
              <div><strong>Players Added:</strong> {lastCSVImport.count}</div>
              <div><strong>Imported:</strong> {lastCSVImport.timestamp}</div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Player Form */}
      {(showAddForm || editingPlayer) && (
        <PlayerForm
          player={editingPlayer}
          onSave={editingPlayer ? (data) => updatePlayer(editingPlayer.id, data) : addPlayer}
          onCancel={() => {
            setShowAddForm(false);
            setEditingPlayer(null);
          }}
        />
      )}

      {/* Players List */}
      <div style={{ marginTop: '1rem' }}>
        <h3>Players ({players.length})</h3>
        {players.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No players added yet. Import from CSV or add manually.
          </p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '0.5rem',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {players.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                onEdit={() => setEditingPlayer(player)}
                onDelete={() => deletePlayer(player.id)}
              />
            ))}
          </div>
        )}
      </div>
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
    avg: player?.avg || 0,
    obp: player?.obp || 0,
    slg: player?.slg || 0,
    ops: player?.ops || 0,
    sb: player?.sb || 0,
    sbPercent: player?.sbPercent || 0,
    bbK: player?.bbK || 0,
    contactPercent: player?.contactPercent || 0,
    qabPercent: player?.qabPercent || 0,
    baRisp: player?.baRisp || 0,
    twoOutRbi: player?.twoOutRbi || 0,
    xbh: player?.xbh || 0,
    hr: player?.hr || 0,
    tb: player?.tb || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>AVG</label>
            <input
              type="number"
              step="0.001"
              value={formData.avg}
              onChange={(e) => setFormData(prev => ({ ...prev, avg: parseFloat(e.target.value) || 0 }))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>OBP</label>
            <input
              type="number"
              step="0.001"
              value={formData.obp}
              onChange={(e) => setFormData(prev => ({ ...prev, obp: parseFloat(e.target.value) || 0 }))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>SLG</label>
            <input
              type="number"
              step="0.001"
              value={formData.slg}
              onChange={(e) => setFormData(prev => ({ ...prev, slg: parseFloat(e.target.value) || 0 }))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>OPS</label>
            <input
              type="number"
              step="0.001"
              value={formData.ops}
              onChange={(e) => setFormData(prev => ({ ...prev, ops: parseFloat(e.target.value) || 0 }))}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </div>
          
          <div>
            <label>SB%</label>
            <input
              type="number"
              step="0.001"
              value={formData.sbPercent}
              onChange={(e) => setFormData(prev => ({ ...prev, sbPercent: parseFloat(e.target.value) || 0 }))}
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
        <div style={{ fontSize: '0.8em', color: '#666', marginTop: '0.25rem' }}>
          AVG: {player.avg.toFixed(3)} | OBP: {player.obp.toFixed(3)} | SLG: {player.slg.toFixed(3)}
          {player.sbPercent > 0 && <span> | SB%: {(player.sbPercent * 100).toFixed(0)}%</span>}
        </div>
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
