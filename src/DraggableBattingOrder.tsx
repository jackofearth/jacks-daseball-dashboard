import React, { useState, useEffect } from 'react';
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
import { Player } from './PlayerManager';

interface DraggableBattingOrderProps {
  players: Player[];
  battingOrder: Player[];
  onBattingOrderChange: (order: Player[]) => void;
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

  // Role descriptions for top 5 positions
  const getRoleDescription = (pos: number) => {
    const roles = {
      1: "🏃‍♂️ Table Setter - Gets on base, sees pitches, steals bases",
      2: "🎯 Contact Specialist - Moves runners, handles bunts, situational hitting",
      3: "⭐ Best Hitter - Highest OPS, most at-bats, drives in runs",
      4: "💥 Clean-up Power - Home run threat, RBI machine, protects lineup",
      5: "🔋 Second Power - Clutch hitting, protects clean-up, RBI production"
    };
    return roles[pos as keyof typeof roles] || "";
  };

  const roleDescription = getRoleDescription(position);

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
          {position <= 5 && (
            <span style={{ 
              fontSize: '0.7em', 
              color: '#007bff',
              fontWeight: 'bold',
              background: '#e3f2fd',
              padding: '0.2rem 0.4rem',
              borderRadius: '3px'
            }}>
              {roleDescription}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>
          AVG: {player.avg.toFixed(3)} | OBP: {player.obp.toFixed(3)} | SLG: {player.slg.toFixed(3)}
          {player.sbPercent > 0 && <span> | SB%: {(player.sbPercent * 100).toFixed(0)}%</span>}
          {player.baRisp > 0 && <span> | RISP: {player.baRisp.toFixed(3)}</span>}
          {player.contactPercent > 0 && <span> | Contact: {(player.contactPercent * 100).toFixed(0)}%</span>}
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
  onBattingOrderChange 
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

  const generateOptimalOrder = () => {
    if (players.length === 0) return;

    // Use the same algorithm as the original BattingOrder component
    const allPlayers = [...players];
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
      .filter(player => !usedPlayers.has(player.id))
      .sort((a, b) => b.ops - a.ops);

    for (let i = 5; i < 9; i++) {
      if (remainingPlayers[i - 5]) {
        optimalOrder[i] = remainingPlayers[i - 5];
      }
    }

    const finalOrder = optimalOrder.filter(player => player !== null);
    onBattingOrderChange(finalOrder);
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
            onClick={generateOptimalOrder}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              marginRight: '0.5rem',
              cursor: 'pointer'
            }}
          >
            🧠 Generate Optimal
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
        <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '0.5rem' }}>
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
                <div style={{ fontWeight: 'bold', color: isInOrder ? '#6c757d' : '#007bff' }}>
                  {player.name}
                </div>
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  OPS: {player.ops.toFixed(3)} | AVG: {player.avg.toFixed(3)}
                </div>
                {isInOrder && (
                  <div style={{ fontSize: '0.7em', color: '#6c757d', fontStyle: 'italic' }}>
                    Already in batting order
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
          <p style={{ color: '#666', fontStyle: 'italic' }}>
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
