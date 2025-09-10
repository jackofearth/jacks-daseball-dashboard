import React from 'react';
import ReactDOM from 'react-dom';
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
import ConfirmationDialog from './ConfirmationDialog';
import StrategyInfoModal from './StrategyInfoModal';

interface DraggableBattingOrderProps {
  players: Player[];
  battingOrder: Player[];
  onBattingOrderChange: (order: Player[]) => void;
  savedBattingOrders: BattingOrderConfig[];
  onSaveBattingOrder: (config: BattingOrderConfig) => void;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onClearAllPlayers: () => void;
}

interface SortablePlayerCardProps {
  player: Player;
  position: number;
  getConfidenceLevel: (ab: number) => { level: string; label: string; color: string; icon: string; penalty: number };
  onFieldingPositionChange: (playerId: string, position: string) => void;
  showFieldingDropdowns: boolean;
  availablePositions: string[];
}

// Available Player Card Component
interface AvailablePlayerCardProps {
  player: Player;
  isInOrder: Player | undefined;
  confidence: { level: string; label: string; color: string; icon: string; penalty: number };
  onAddToOrder: () => void;
}

const AvailablePlayerCard: React.FC<AvailablePlayerCardProps> = ({ player, isInOrder, confidence, onAddToOrder }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  return (
    <div
      onClick={onAddToOrder}
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        fontWeight: 'bold', 
        color: isInOrder ? 'var(--theme-secondary)' : 'var(--theme-primary)' 
      }}>
        <span>{player.name}</span>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span 
            style={{ 
              fontSize: '0.8em',
              color: confidence.color,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
              });
              setShowTooltip(true);
            }}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {confidence.icon}
          </span>
          {showTooltip && ReactDOM.createPortal(
            <div style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              zIndex: 9999,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {confidence.label} ({player.ab || 0} AB){confidence.penalty > 0 ? ` - ${(confidence.penalty * 100)}% penalty applied` : ''}
            </div>,
            document.body
          )}
        </div>
      </div>
      {(player.avg > 0 || player.ops > 0) && (
        <div style={{ fontSize: '0.8em', color: 'var(--theme-secondary)' }}>
          AVG: {player.avg.toFixed(3)} | OPS: {player.ops.toFixed(3)}
        </div>
      )}
    </div>
  );
};

const SortablePlayerCard: React.FC<SortablePlayerCardProps> = ({ player, position, getConfidenceLevel, onFieldingPositionChange, showFieldingDropdowns, availablePositions }) => {
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

  const confidence = getConfidenceLevel(player.ab || 0);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });



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
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span 
              style={{ 
                fontSize: '0.8em',
                color: confidence.color,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
              });
              setShowTooltip(true);
            }}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {confidence.icon}
          </span>
          {showTooltip && ReactDOM.createPortal(
            <div style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              zIndex: 9999,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {confidence.label} ({player.ab || 0} AB){confidence.penalty > 0 ? ` - ${(confidence.penalty * 100)}% penalty applied` : ''}
            </div>,
            document.body
          )}
          </div>
        </div>
      </div>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {showFieldingDropdowns && (
          <select
            value={player.fieldingPosition || ''}
            onChange={(e) => onFieldingPositionChange(player.id, e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.8em',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              minWidth: '80px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">Position</option>
            {availablePositions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        )}
        <div style={{ 
          fontSize: '0.7em', 
          color: '#999'
        }}>
          Drag to reorder
        </div>
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
  onSettingsChange,
  onClearAllPlayers
}) => {
  const [showFieldingDropdowns, setShowFieldingDropdowns] = React.useState(false);
  const [showClearBattingOrderDialog, setShowClearBattingOrderDialog] = React.useState(false);
  const [showStrategyInfoModal, setShowStrategyInfoModal] = React.useState(false);
  const [lastUsedStrategy, setLastUsedStrategy] = React.useState<string | null>(null);
  // Get confidence level based on AB
  const getConfidenceLevel = (ab: number) => {
    if (ab >= 12) return { level: 'full', label: 'Full confidence', color: '#28a745', icon: '', penalty: 0 };
    if (ab >= 6) return { level: 'medium', label: 'Medium confidence', color: '#ffc107', icon: '⚡', penalty: 0.15 };
    if (ab >= 3) return { level: 'low', label: 'Low confidence', color: '#fd7e14', icon: '⚠️', penalty: 0.30 };
    return { level: 'excluded', label: 'Excluded', color: '#dc3545', icon: '🚫', penalty: 1 };
  };

  // Apply confidence penalty to offensive stats
  const applyConfidencePenalty = (player: Player) => {
    const confidence = getConfidenceLevel(player.ab || 0);
    const penalty = confidence.penalty;
    
    if (penalty === 0) return player; // No penalty for full confidence
    
    return {
      ...player,
      avg: (player.avg || 0) * (1 - penalty),
      obp: (player.obp || 0) * (1 - penalty),
      slg: (player.slg || 0) * (1 - penalty),
      ops: (player.ops || 0) * (1 - penalty),
      sb_percent: (player.sb_percent || 0) * (1 - penalty),
      contact_percent: (player.contact_percent || 0) * (1 - penalty),
      qab_percent: (player.qab_percent || 0) * (1 - penalty),
      ba_risp: (player.ba_risp || 0) * (1 - penalty),
      two_out_rbi: (player.two_out_rbi || 0) * (1 - penalty),
      xbh: (player.xbh || 0) * (1 - penalty),
      hr: (player.hr || 0) * (1 - penalty),
      tb: (player.tb || 0) * (1 - penalty),
      bb_k: (player.bb_k || 0) * (1 - penalty),
      rbi: (player.rbi || 0) * (1 - penalty),
      // Apply penalties to rate-based stats
      hr_rate: (player.hr_rate || 0) * (1 - penalty),
      xbh_rate: (player.xbh_rate || 0) * (1 - penalty),
      two_out_rbi_rate: (player.two_out_rbi_rate || 0) * (1 - penalty)
    };
  };

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

  const movePlayerUp = (playerId: string) => {
    const currentIndex = battingOrder.findIndex(p => p.id === playerId);
    if (currentIndex > 0) {
      const newOrder = [...battingOrder];
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
      onBattingOrderChange(newOrder);
    }
  };

  const movePlayerDown = (playerId: string) => {
    const currentIndex = battingOrder.findIndex(p => p.id === playerId);
    if (currentIndex < battingOrder.length - 1) {
      const newOrder = [...battingOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      onBattingOrderChange(newOrder);
    }
  };

  const handleFieldingPositionChange = (playerId: string, position: string) => {
    const updatedOrder = battingOrder.map(player => 
      player.id === playerId 
        ? { ...player, fieldingPosition: position }
        : player
    );
    onBattingOrderChange(updatedOrder);
  };

  // Calculate available positions for each player
  const getAvailablePositions = (currentPlayerId: string) => {
    const allPositions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'EH'];
    const usedPositions = battingOrder
      .filter(player => player.id !== currentPlayerId && player.fieldingPosition && player.fieldingPosition !== 'EH')
      .map(player => player.fieldingPosition);
    
    return allPositions.filter(pos => !usedPositions.includes(pos));
  };

  const clearBattingOrder = () => {
    setShowClearBattingOrderDialog(true);
  };

  const confirmClearBattingOrder = () => {
    onBattingOrderChange([]);
    setShowClearBattingOrderDialog(false);
  };

  const generateJacksCustomLocalLeagueOrder = () => {
    console.log('generateJacksCustomLocalLeagueOrder called, players:', players.length);
    setLastUsedStrategy('situational');
    if (players.length === 0) {
      console.log('No players available for batting order generation');
      return;
    }

    // Filter players by confidence level
    const playersWithStats = players.filter(player => 
      player.avg > 0 || player.obp > 0 || player.slg > 0
    );
    
    const primaryPlayers = playersWithStats.filter(player => 
      (player.ab || 0) >= 3
    );
    
    const excludedPlayers = playersWithStats.filter(player => 
      (player.ab || 0) < 3
    );
    
    // If we have players with sufficient stats, use them; otherwise use all players
    const allPlayers = primaryPlayers.length > 0 ? primaryPlayers : [...players];
    
    // Apply confidence penalties to all players
    const penalizedPlayers = allPlayers.map(applyConfidencePenalty);
    const optimalOrder: Player[] = new Array(9).fill(null);
    const usedPlayers = new Set<string>();

    const findBestPlayer = (criteria: (player: Player) => number, excludeUsed = true) => {
      return penalizedPlayers
        .filter(player => !excludeUsed || !usedPlayers.has(player.id))
        .sort((a, b) => criteria(b) - criteria(a))[0];
    };

    const assignPlayer = (position: number, player: Player | undefined) => {
      if (player) {
        optimalOrder[position] = player;
        usedPlayers.add(player.id);
      }
    };

    // 1. Lead-off (1st): More speed emphasis - leadoff needs to steal bases
    const leadoff = findBestPlayer(player => 
      player.obp * 0.4 + 
      (player.sb_percent || 0) * 0.3 + 
      (player.contact_percent || 0) * 0.2 + 
      player.avg * 0.1
    );
    assignPlayer(0, leadoff);

    // 2. Table Setter (2nd): Heavy contact focus - must put ball in play to move runner
    const second = findBestPlayer(player => 
      (player.contact_percent || 0) * 0.5 + 
      (player.ba_risp || 0) * 0.3 + 
      (player.qab_percent || 0) * 0.2
    );
    assignPlayer(1, second);

    // 3. Best Hitter (3rd): Balanced hitter with power and situational awareness
    const third = findBestPlayer(player => 
      player.ops * 0.4 + 
      player.slg * 0.2 + 
      (player.ba_risp || 0) * 0.25 + 
      (player.qab_percent || 0) * 0.15
    );
    assignPlayer(2, third);

    // 4. Clean-up (4th): Clutch situations are everything - raw power is secondary
    const cleanup = findBestPlayer(player => 
      (player.ba_risp || 0) * 0.45 + 
      player.slg * 0.35 + 
      (player.two_out_rbi_rate || 0) * 0.2
    );
    assignPlayer(3, cleanup);

    // 5. Protection (5th): SLG: 45% | RISP: 35% | Two-out RBI: 20%
    const fifth = findBestPlayer(player => 
      player.slg * 0.45 + 
      (player.ba_risp || 0) * 0.35 + 
      (player.two_out_rbi_rate || 0) * 0.2
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

    // Map back to original players (not penalized versions)
    const finalOrder = optimalOrder
      .filter(player => player !== null)
      .map(penalizedPlayer => 
        allPlayers.find(originalPlayer => originalPlayer.id === penalizedPlayer.id)
      )
      .filter((player): player is Player => player !== undefined);
    
    onBattingOrderChange(finalOrder);
  };

  const generateMLBOrder = () => {
    console.log('generateMLBOrder called, players:', players.length);
    setLastUsedStrategy('traditional');
    if (players.length === 0) {
      console.log('No players available for batting order generation');
      return;
    }

    // Filter players by confidence level
    const playersWithStats = players.filter(player => 
      player.avg > 0 || player.obp > 0 || player.slg > 0
    );
    
    const primaryPlayers = playersWithStats.filter(player => 
      (player.ab || 0) >= 3
    );
    
    const excludedPlayers = playersWithStats.filter(player => 
      (player.ab || 0) < 3
    );
    
    // If we have players with sufficient stats, use them; otherwise use all players
    const playersToUse = primaryPlayers.length > 0 ? primaryPlayers : [...players];

    // Apply confidence penalties to all players
    const penalizedPlayers = playersToUse.map(applyConfidencePenalty);

    // MLB Traditional Order Strategy - use penalized stats for ranking
    const playerStats = penalizedPlayers.map(p => ({
      ...p,
      ops: p.obp + p.slg,  // On-base + Slugging (with penalty applied)
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

    // Convert to array format and map back to original players
    const finalOrder = Object.keys(order)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => {
        const penalizedPlayer = order[parseInt(key)];
        // Find the original player by ID
        return playersToUse.find(originalPlayer => originalPlayer.id === penalizedPlayer.id);
      })
      .filter((player): player is Player => player !== undefined);

    onBattingOrderChange(finalOrder);
  };

  return (
    <div style={{ 
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <h1 style={{ textAlign: 'center', margin: 0, fontSize: '2.5rem' }}>Batting Order</h1>

      {/* Generate Batting Order Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>Choose your strategy</h3>
          <button
            onClick={() => setShowStrategyInfoModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#007bff',
              padding: '0.25rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
            title="Learn about the strategies"
          >
            ⓘ
          </button>
        </div>
        
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src="/mlblogo.png"
                alt="MLB Logo"
                onClick={generateMLBOrder}
                style={{
                  width: '120px',
                  height: '90px',
                  objectFit: 'contain',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  border: lastUsedStrategy === 'traditional' ? '3px solid #007bff' : '2px solid transparent',
                  borderRadius: '8px',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (lastUsedStrategy !== 'traditional') {
                    (e.target as HTMLImageElement).style.borderColor = '#007bff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (lastUsedStrategy !== 'traditional') {
                    (e.target as HTMLImageElement).style.borderColor = 'transparent';
                  }
                }}
              />
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#666', 
                      textAlign: 'center',
                      maxWidth: '140px'
                    }}>
                      Traditional Baseball
                    </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src="/situational strategy.png"
                alt="Situational Strategy Logo"
                onClick={generateJacksCustomLocalLeagueOrder}
                style={{
                  width: '120px',
                  height: '90px',
                  objectFit: 'contain',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  border: lastUsedStrategy === 'situational' ? '3px solid #28a745' : '2px solid transparent',
                  borderRadius: '8px',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (lastUsedStrategy !== 'situational') {
                    (e.target as HTMLImageElement).style.borderColor = '#28a745';
                  }
                }}
                onMouseLeave={(e) => {
                  if (lastUsedStrategy !== 'situational') {
                    (e.target as HTMLImageElement).style.borderColor = 'transparent';
                  }
                }}
              />
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#666', 
                      textAlign: 'center',
                      maxWidth: '140px'
                    }}>
                      Situational Analytics
                    </div>
            </div>
          </div>
        </div>
      </div>

      {/* Batting Order */}
      <div style={{ 
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ 
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{ textAlign: 'center', margin: '0 0 0.5rem 0' }}>Current Batting Order ({battingOrder.length})</h3>
          <button
            onClick={() => setShowFieldingDropdowns(!showFieldingDropdowns)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9em',
              background: showFieldingDropdowns ? 'var(--theme-primary)' : 'var(--theme-secondary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {showFieldingDropdowns ? 'Hide Fielding Position' : 'Show Fielding Position'}
          </button>
        </div>
        {battingOrder.length === 0 ? (
          <p style={{ color: 'var(--theme-secondary)', fontStyle: 'italic' }}>
            No players in batting order. Click "Generate Batting Order" or drag players from below.
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
                    <SortablePlayerCard 
                      player={player} 
                      position={index + 1} 
                      getConfidenceLevel={getConfidenceLevel}
                      onFieldingPositionChange={handleFieldingPositionChange}
                      showFieldingDropdowns={showFieldingDropdowns}
                      availablePositions={getAvailablePositions(player.id)}
                    />
                    <div style={{
                      position: 'absolute',
                      right: '-50px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}>
                        <button
                          onClick={() => movePlayerUp(player.id)}
                          disabled={index === 0}
                          style={{
                            background: index === 0 ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '20px',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '0.7em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => movePlayerDown(player.id)}
                          disabled={index === battingOrder.length - 1}
                          style={{
                            background: index === battingOrder.length - 1 ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '20px',
                            cursor: index === battingOrder.length - 1 ? 'not-allowed' : 'pointer',
                            fontSize: '0.7em',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Move down"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        onClick={() => removePlayerFromOrder(player.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          fontSize: '0.9em'
                        }}
                        title="Remove from batting order"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        
        {/* Clear Buttons */}
        {(battingOrder.length > 0 || players.length > 0) && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              {battingOrder.length > 0 && (
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
                  Clear Batting Order
                </button>
              )}
              {players.length > 0 && (
                <button 
                  onClick={onClearAllPlayers}
                  style={{
                    background: '#ffc107',
                    color: 'black',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  title="Clear all players and batting order"
                >
                  🗑️ Clear All Players
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Available Players */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Available Players ({players.length})</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.5rem',
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '0.5rem',
          background: '#f8f9fa',
          borderRadius: '4px',
          border: '2px dashed #dee2e6',
          width: '100%',
          maxWidth: '800px'
        }}>
          {players.map(player => {
            const isInOrder = battingOrder.find(p => p.id === player.id);
            const confidence = getConfidenceLevel(player.ab || 0);
            
            return (
              <AvailablePlayerCard 
                key={player.id}
                player={player}
                isInOrder={isInOrder}
                confidence={confidence}
                onAddToOrder={() => addPlayerToOrder(player)}
              />
            );
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showClearBattingOrderDialog}
        title="Clear Batting Order"
        message="Are you sure you want to clear the batting order? This will not affect your player list."
        confirmText="Clear Order"
        cancelText="Cancel"
        type="warning"
        onConfirm={confirmClearBattingOrder}
        onCancel={() => setShowClearBattingOrderDialog(false)}
      />

      {/* Strategy Info Modal */}
      <StrategyInfoModal
        isOpen={showStrategyInfoModal}
        onClose={() => setShowStrategyInfoModal(false)}
      />
    </div>
  );
};
