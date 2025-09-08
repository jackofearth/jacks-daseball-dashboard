import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Player, BattingOrderConfig, UserSettings } from './StorageService';

interface DraggableBattingOrderProps {
  players: Player[];
  battingOrder: Player[];
  onBattingOrderChange: (order: Player[]) => void;
  savedBattingOrders: BattingOrderConfig[];
  onSaveBattingOrder: (config: BattingOrderConfig) => void;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
}

interface SortablePlayerCardProps {
  player: Player;
  position: number;
}

const SortablePlayerCard: React.FC<SortablePlayerCardProps> = ({ player, position }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };



  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        marginBottom: '0.5rem',
        cursor: 'grab',
        userSelect: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{
        background: position <= 5 ? '#FFC107' : '#6c757d',
        color: position <= 5 ? 'black' : 'white',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        marginRight: '1rem',
        flexShrink: 0
      }}>
        {position}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <strong>{player.name}</strong>
        </div>
      </div>
      <div style={{ 
        fontSize: '0.7em', 
        color: '#999',
        marginLeft: '0.5rem'
      }}>
        Drag to reorder
      </div>
    </div>
  );
};

export const DraggableBattingOrder: React.FC<DraggableBattingOrderProps> = ({ 
  players, 
  battingOrder, 
  onBattingOrderChange,
  savedBattingOrders,
  onSaveBattingOrder,
  settings,
  onSettingsChange
}) => {

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = battingOrder.findIndex(item => item.id === active.id);
      const newIndex = battingOrder.findIndex(item => item.id === over.id);
      
      onBattingOrderChange(arrayMove(battingOrder, oldIndex, newIndex));
    }
  };

  const addPlayerToOrder = (player: Player) => {
    if (!battingOrder.find(p => p.id === player.id)) {
      onBattingOrderChange([...battingOrder, player]);
    }
  };

  const removePlayerFromOrder = (playerId: string) => {
    onBattingOrderChange(battingOrder.filter(p => p.id !== playerId));
  };

  const clearBattingOrder = () => {
    if (window.confirm('Are you sure you want to clear the batting order? (This will not affect your player list)')) {
      onBattingOrderChange([]);
    }
  };

  const generateLocalLeagueOrder = () => {
    if (players.length === 0) return;

    // Filter out players with no meaningful stats (all zeros)
    const playersWithStats = players.filter(player => 
      player.avg > 0 || player.obp > 0 || player.slg > 0
    );
    
    // If we have players with stats, use them; otherwise use all players
    const allPlayers = playersWithStats.length > 0 ? playersWithStats : [...players];
    const optimalOrder: Player[] = new Array(9).fill(null);
    const usedPlayers = new Set<string>();

    const findBestPlayer = (criteria: (player: Player) => number, excludeUsed = true) => {
      return allPlayers
        .filter(player => !excludeUsed || !usedPlayers.has(player.id))
        .sort((a, b) => criteria(b) - criteria(a))[0];
    };

    const assignPlayer = (position: number, player: Player | undefined) => {
      if (player) {
        optimalOrder[position] = player;
        usedPlayers.add(player.id);
      }
    };

    // 1. Lead-off (1st): High OBP + Speed + Contact + Low K%
    const leadoff = findBestPlayer(player => 
      player.obp * 0.5 + 
      (player.sb_percent || 0) * 0.2 + 
      (player.contact_percent || 0) * 0.2 + 
      player.avg * 0.1
    );
    assignPlayer(0, leadoff);

    // 2. Second (2nd): High contact + Situational hitting + Can move runners
    const second = findBestPlayer(player => 
      (player.contact_percent || 0) * 0.4 + 
      (player.ba_risp || 0) * 0.3 + 
      player.avg * 0.2 + 
      (player.qab_percent || 0) * 0.1
    );
    assignPlayer(1, second);

    // 3. Third (3rd): Best overall hitter (highest OPS + Quality at-bats)
    const third = findBestPlayer(player => 
      player.ops * 0.7 + 
      (player.qab_percent || 0) * 0.3
    );
    assignPlayer(2, third);

    // 4. Clean-up (4th): Power hitter + RBI production
    const cleanup = findBestPlayer(player => 
      player.slg * 0.4 + 
      (player.two_out_rbi || 0) * 0.3 + 
      (player.xbh || 0) * 0.2 + 
      (player.ba_risp || 0) * 0.1
    );
    assignPlayer(3, cleanup);

    // 5. Fifth: Second best power + Clutch hitting
    const fifth = findBestPlayer(player => 
      player.slg * 0.4 + 
      (player.ba_risp || 0) * 0.3 + 
      player.ops * 0.2 + 
      (player.two_out_rbi || 0) * 0.1
    );
    assignPlayer(4, fifth);

    // 6-9. Fill remaining positions by OPS (descending)
    const remainingPlayers = allPlayers
      .filter(player => !usedPlayers.has(player.id))
      .sort((a, b) => b.ops - a.ops);

    for (let i = 5; i < 9; i++) {
      if (remainingPlayers[i - 5]) {
        optimalOrder[i] = remainingPlayers[i - 5];
      }
    }

    const finalOrder = optimalOrder.filter(player => player !== null);
    onBattingOrderChange(finalOrder);
    
    // Show warning if we included players with no stats
    const playersWithNoStats = finalOrder.filter(player => 
      player.avg === 0 && player.obp === 0 && player.slg === 0
    );
    
    if (playersWithNoStats.length > 0) {
      alert(`⚠️ Warning: ${playersWithNoStats.length} player(s) with no meaningful stats were included in the batting order. Consider adding stats or removing these players.`);
    }
  };

  const generateMLBOrder = () => {
    if (players.length === 0) return;

    // Filter out players with no meaningful stats (all zeros)
    const playersWithStats = players.filter(player => 
      player.avg > 0 || player.obp > 0 || player.slg > 0
    );
    
    // If we have players with stats, use them; otherwise use all players
    const playersToUse = playersWithStats.length > 0 ? playersWithStats : [...players];

    // MLB Traditional Order Algorithm
    const playerStats = playersToUse.map(p => ({
      ...p,
      ops: p.obp + p.slg,  // On-base + Slugging
      contactScore: p.avg + p.obp,
      speedScore: p.sb_percent || 0
    }));

    const order: { [key: number]: Player } = {};
    const used = new Set<string>();
    
    // 1. LEADOFF - Highest OBP (gets on base most)
    const leadoffCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.obp - a.obp);
    if (leadoffCandidates.length > 0) {
      order[1] = leadoffCandidates[0];
      used.add(leadoffCandidates[0].id);
    }

    // 2. CONTACT HITTER - Best combo of AVG + speed
    const contactCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => (b.avg + b.speedScore) - (a.avg + a.speedScore));
    if (contactCandidates.length > 0) {
      order[2] = contactCandidates[0];
      used.add(contactCandidates[0].id);
    }

    // 3. BEST HITTER - Highest OPS overall
    const bestHitterCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.ops - a.ops);
    if (bestHitterCandidates.length > 0) {
      order[3] = bestHitterCandidates[0];
      used.add(bestHitterCandidates[0].id);
    }

    // 4. CLEANUP - Best power (highest SLG)
    const cleanupCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.slg - a.slg);
    if (cleanupCandidates.length > 0) {
      order[4] = cleanupCandidates[0];
      used.add(cleanupCandidates[0].id);
    }

    // 5. PROTECTION - Second best power hitter
    const protectionCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.slg - a.slg);
    if (protectionCandidates.length > 0) {
      order[5] = protectionCandidates[0];
      used.add(protectionCandidates[0].id);
    }

    // 6-8. DESCENDING ORDER - By OPS
    const remainingByOPS = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.ops - a.ops);

    for (let pos = 6; pos <= 8; pos++) {
      if (remainingByOPS.length > pos - 6) {
        order[pos] = remainingByOPS[pos - 6];
        used.add(remainingByOPS[pos - 6].id);
      }
    }

    // 9. PITCHER SPOT - Weakest hitter (lowest OPS)
    const weakestCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => a.ops - b.ops);
    if (weakestCandidates.length > 0) {
      order[9] = weakestCandidates[0];
      used.add(weakestCandidates[0].id);
    }

    // Convert to array format
    const finalOrder = Object.keys(order)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => order[parseInt(key)])
      .filter(Boolean);

    onBattingOrderChange(finalOrder);
    
    // Show warning if we included players with no stats
    const playersWithNoStats = finalOrder.filter(player => 
      player.avg === 0 && player.obp === 0 && player.slg === 0
    );
    
    if (playersWithNoStats.length > 0) {
      alert(`⚠️ Warning: ${playersWithNoStats.length} player(s) with no meaningful stats were included in the batting order. Consider adding stats or removing these players.`);
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
        <h2>⚾ Batting Order</h2>
        <div>
          <button 
            onClick={generateMLBOrder}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              marginRight: '0.5rem',
              cursor: 'pointer'
            }}
            title="MLB-level traditional batting order strategy"
          >
            🏆 MLB-Level
          </button>
          <button 
            onClick={generateLocalLeagueOrder}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              marginRight: '0.5rem',
              cursor: 'pointer'
            }}
            title="Local league optimized batting order with advanced stats"
          >
            🏟️ Local League
          </button>
          <button 
            onClick={clearBattingOrder}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title="Clear batting order only (keeps players)"
          >
            🗑️ Clear Order Only
          </button>
        </div>
      </div>

      {/* Available Players */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Available Players ({players.length})</h3>
        <p style={{ fontSize: '0.9em', color: 'var(--theme-secondary)', marginBottom: '0.5rem' }}>
          Click to add to batting order • Drag from here to batting order below
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.5rem',
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '0.5rem',
          background: '#f8f9fa',
          borderRadius: '4px',
          border: '2px dashed #dee2e6'
        }}>
          {players.map(player => {
            const isInOrder = battingOrder.find(p => p.id === player.id);
            return (
              <div
                key={player.id}
                onClick={() => addPlayerToOrder(player)}
                style={{
                  background: isInOrder ? '#e9ecef' : 'white',
                  border: isInOrder ? '1px solid #6c757d' : '1px solid #007bff',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  cursor: isInOrder ? 'not-allowed' : 'pointer',
                  opacity: isInOrder ? 0.6 : 1,
                  fontSize: '0.9em',
                  transition: 'all 0.2s ease',
                  boxShadow: isInOrder ? 'none' : '0 2px 4px rgba(0,123,255,0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!isInOrder) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isInOrder) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.1)';
                  }
                }}
              >
                <div style={{ fontWeight: 'bold', color: isInOrder ? 'var(--theme-secondary)' : 'var(--theme-primary)' }}>
                  {player.name}
                </div>
                {(player.avg > 0 || player.ops > 0) && (
                  <div style={{ fontSize: '0.8em', color: 'var(--theme-secondary)' }}>
                    AVG: {player.avg.toFixed(3)} | OPS: {player.ops.toFixed(3)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Batting Order */}
      <div>
        <h3>Current Batting Order ({battingOrder.length})</h3>
        {battingOrder.length === 0 ? (
          <p style={{ color: 'var(--theme-secondary)', fontStyle: 'italic' }}>
            No players in batting order. Click "Generate Optimal" or drag players from above.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={battingOrder.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div style={{ maxWidth: '500px' }}>
                {battingOrder.map((player, index) => (
                  <div key={player.id} style={{ position: 'relative' }}>
                    <SortablePlayerCard player={player} position={index + 1} />
                    <button
                      onClick={() => removePlayerFromOrder(player.id)}
                      style={{
                        position: 'absolute',
                        right: '-30px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        fontSize: '0.7em'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
