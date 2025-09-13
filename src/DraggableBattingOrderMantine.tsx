import React, { useState } from 'react';
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
import {
  Card,
  Text,
  Group,
  ActionIcon,
  Button,
  Modal,
  Select,
  Stack,
  Title,
  Paper,
  Center,
  Switch,
  TextInput,
  SimpleGrid,
  ThemeIcon
} from '@mantine/core';
import {
  IconGripVertical,
  IconTrash,
  IconPlus,
  IconDownload,
  IconRefresh,
  IconChartBar,
  IconInfoCircle,
  IconX,
  IconCheck,
  IconBolt,
  IconAlertTriangle
} from '@tabler/icons-react';
import { Player, BattingOrderConfig, UserSettings, TeamInfo } from './StorageService';
import StrategyInfoModal from './StrategyInfoModal';
import PDFCustomizationModal, { PDFExportOptions } from './PDFCustomizationModal';
import PDFPreviewModal from './PDFPreviewModal';

const getConfidenceIcon = (iconType: string) => {
  switch (iconType) {
    case 'check':
      return <IconCheck size={16} />;
    case 'bolt':
      return <IconBolt size={16} />;
    case 'alert':
      return <IconAlertTriangle size={16} />;
    default:
      return <IconAlertTriangle size={16} />;
  }
};

interface DraggableBattingOrderProps {
  players: Player[];
  battingOrder: Player[];
  onBattingOrderChange: (order: Player[]) => void;
  savedBattingOrders: BattingOrderConfig[];
  onSaveBattingOrder: (config: BattingOrderConfig) => void;
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onClearAllPlayers: () => void;
  teamInfo: TeamInfo;
  onNavigateToHelp: () => void;
}

interface SortablePlayerCardProps {
  player: Player;
  position: number;
  getConfidenceLevel: (ab: number) => { level: string; label: string; color: string; icon: string; penalty: number };
  onFieldingPositionChange: (playerId: string, position: string) => void;
  showFieldingDropdowns: boolean;
  getAvailablePositions: (playerId: string) => string[];
  onRemove: (playerId: string) => void;
  hideConfidenceScore: boolean;
}

interface AvailablePlayerCardProps {
  player: Player;
  isInOrder: Player | undefined;
  confidence: { level: string; label: string; color: string; icon: string; penalty: number };
  onAddToOrder: () => void;
  hideConfidenceScore: boolean;
}

const AvailablePlayerCard: React.FC<AvailablePlayerCardProps> = ({ player, isInOrder, confidence, onAddToOrder, hideConfidenceScore }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      style={{
        cursor: isInOrder ? 'not-allowed' : 'pointer',
        opacity: isInOrder ? 0.6 : 1,
        transition: 'all 0.2s ease',
      }}
      onClick={isInOrder ? undefined : onAddToOrder}
    >
      <Group justify="space-between" align="center">
        <div>
          <Text fw={500} size="sm" c={isInOrder ? 'dimmed' : 'blue'}>
            {player.name}
          </Text>
          <Group gap="xs" mt={4}>
            <Text size="xs" c="dimmed">AVG: {player.avg.toFixed(3)}</Text>
            <Text size="xs" c="dimmed">OPS: {player.ops.toFixed(3)}</Text>
            {!hideConfidenceScore && (
              <Group gap={4} align="center">
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Text
                    size="xs"
                    c={confidence.color}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e: React.MouseEvent) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPosition({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 10
                      });
                      setShowTooltip(true);
                    }}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    AB: {player.ab || 0}
                  </Text>
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
                      {confidence.label}
                    </div>,
                    document.body
                  )}
                </div>
                <ThemeIcon
                  size="xs"
                  color={confidence.color}
                  variant="light"
                >
                  {getConfidenceIcon(confidence.icon)}
                </ThemeIcon>
              </Group>
            )}
          </Group>
        </div>
        <Group gap="xs">
          {!isInOrder && (
            <ActionIcon 
              color="blue" 
              variant="light" 
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onAddToOrder();
              }}
            >
              <IconPlus size={14} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Card>
  );
};

const SortablePlayerCard: React.FC<SortablePlayerCardProps> = ({
  player,
  position,
  getConfidenceLevel,
  onFieldingPositionChange,
  showFieldingDropdowns,
  getAvailablePositions,
  onRemove,
  hideConfidenceScore
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const confidence = getConfidenceLevel(player.ab);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
    >
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <ActionIcon
            {...attributes}
            {...listeners}
            variant="subtle"
            color="gray"
            size="sm"
          >
            <IconGripVertical size={16} />
          </ActionIcon>
          
          <div>
            <Text fw={500} size="md">
              {position}. {player.name}
            </Text>
        <Group gap="xs" mt={4}>
          <Text size="sm" c="dimmed">AVG: {player.avg.toFixed(3)}</Text>
          <Text size="sm" c="dimmed">OPS: {player.ops.toFixed(3)}</Text>
          {!hideConfidenceScore && (
            <Group gap={4} align="center">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Text
                  size="sm"
                  c={confidence.color}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e: React.MouseEvent) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({
                      x: rect.left + rect.width / 2,
                      y: rect.top - 10
                    });
                    setShowTooltip(true);
                  }}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  AB: {player.ab || 0}
                </Text>
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
                    {confidence.label}
                  </div>,
                  document.body
                )}
              </div>
              <ThemeIcon
                size="xs"
                color={confidence.color}
                variant="light"
              >
                {getConfidenceIcon(confidence.icon)}
              </ThemeIcon>
            </Group>
          )}
        </Group>
          </div>
        </Group>

        <Group gap="sm">
          {showFieldingDropdowns && (
            <Select
              placeholder="Position"
              value={player.fieldingPosition || ''}
              onChange={(value) => onFieldingPositionChange(player.id, value || '')}
              data={getAvailablePositions(player.id)}
              size="sm"
              w={120}
              fw={500}
              classNames={{
                input: 'fielding-position-select'
              }}
            />
          )}
          
          <ActionIcon
            color="red"
            variant="light"
            size="sm"
            onClick={() => onRemove(player.id)}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
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
  onClearAllPlayers,
  teamInfo,
  onNavigateToHelp
}) => {
  const [algorithm, setAlgorithm] = useState<'traditional' | 'situational'>('traditional');
  const [showFieldingDropdowns, setShowFieldingDropdowns] = useState(false);
  const [hideConfidenceScore, setHideConfidenceScore] = useState(true);
  const [showStrategyInfo, setShowStrategyInfo] = useState(false);
  const [showPDFCustomization, setShowPDFCustomization] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<PDFExportOptions | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedOrderName, setSavedOrderName] = useState('');
  const [showStrategyTooltip, setShowStrategyTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allPositions = [
    'P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH', 'EH'
  ];

  // Get available positions for a specific player (exclusive except for EH)
  const getAvailablePositions = (playerId: string) => {
    const currentPlayerPosition = battingOrder.find(p => p.id === playerId)?.fieldingPosition;
    const usedPositionsForOthers = new Set(
      battingOrder
        .filter(p => p.id !== playerId && p.fieldingPosition && p.fieldingPosition !== 'EH')
        .map(p => p.fieldingPosition)
    );
    
    return allPositions.filter(pos => 
      pos === 'EH' || // EH is always available
      pos === currentPlayerPosition || // Current player's position is always available
      !usedPositionsForOthers.has(pos) // Position not used by other players
    );
  };

  const getConfidenceLevel = (ab: number) => {
    if (ab >= 12) return { level: 'High', label: 'High Confidence', color: 'green', icon: 'check', penalty: 0 };
    if (ab >= 6) return { level: 'Medium', label: 'Medium Confidence', color: 'yellow', icon: 'bolt', penalty: 0.15 };
    if (ab >= 3) return { level: 'Low', label: 'Low Confidence', color: 'orange', icon: 'alert', penalty: 0.30 };
    return { level: 'Excluded', label: 'Excluded', color: 'red', icon: 'x', penalty: 1.0 };
  };

  const generateBattingOrder = () => {
    if (players.length === 0) return;

    if (algorithm === 'traditional') {
      generateMLBOrder();
    } else {
      generateJacksCustomLocalLeagueOrder();
    }
  };

  const generateMLBOrder = () => {
    if (players.length === 0) {
      return;
    }


    // Filter players by confidence level
    const playersWithStats = players.filter(player => 
      player.avg > 0 || player.obp > 0 || player.slg > 0
    );
    
    const primaryPlayers = playersWithStats.filter(player => 
      (player.ab || 0) >= 3
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
      speedScore: p.sb_percent || 0  // Keep as percentage like original
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

  const generateJacksCustomLocalLeagueOrder = () => {
    if (players.length === 0) {
      return;
    }

    // Filter players by confidence level
    const playersWithStats = players.filter(player => 
      player.avg > 0 || player.obp > 0 || player.slg > 0
    );
    
    const primaryPlayers = playersWithStats.filter(player => 
      (player.ab || 0) >= 3
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

    // Helper function to evaluate players with situational fallbacks
    const evaluatePlayer = (player: Player, position: number) => {
      const hasSituationalData = (player.ab_risp || 0) >= 2;
      const situationalConfidence = (player.ab_risp || 0) >= 5 ? 1.0 : (player.ab_risp || 0) >= 3 ? 0.7 : 0.3;
      
      switch (position) {
        case 0: // Lead-off (1st): Speed + OBP
          return player.obp * 0.4 + 
                 (player.sb_percent || 0) * 0.3 + 
                 (player.contact_percent || 0) * 0.2 + 
                 player.avg * 0.1;
                 
        case 1: // Table Setter (2nd): Contact + Situational
          if (hasSituationalData) {
            return (player.contact_percent || 0) * 0.4 + 
                   (player.ba_risp || 0) * 0.3 * situationalConfidence + 
                   (player.qab_percent || 0) * 0.2 +
                   player.avg * 0.1 * (1 - situationalConfidence);
          } else {
            return (player.contact_percent || 0) * 0.5 + 
                   player.avg * 0.3 + 
                   (player.qab_percent || 0) * 0.2;
          }
          
        case 2: // Best Hitter (3rd): Balanced
          if (hasSituationalData) {
            return player.ops * 0.3 + 
                   player.slg * 0.2 + 
                   (player.ba_risp || 0) * 0.25 * situationalConfidence + 
                   (player.qab_percent || 0) * 0.15 +
                   player.avg * 0.1 * (1 - situationalConfidence);
          } else {
            return player.ops * 0.5 + 
                   player.slg * 0.3 + 
                   (player.qab_percent || 0) * 0.2;
          }
          
        case 3: // Clean-up (4th): Clutch + Power
          if (hasSituationalData) {
            return (player.ba_risp || 0) * 0.45 * situationalConfidence + 
                   player.slg * 0.35 + 
                   (player.two_out_rbi_rate || 0) * 0.20 * situationalConfidence +
                   player.ops * 0.15 * (1 - situationalConfidence);
          } else {
            return player.slg * 0.50 +      // Power
                   player.ops * 0.30 +      // Overall hitting
                   player.avg * 0.20;       // Contact
          }
          
        case 4: // Protection (5th): Power + Situational
          if (hasSituationalData) {
            return player.slg * 0.35 + 
                   (player.ba_risp || 0) * 0.35 * situationalConfidence + 
                   (player.two_out_rbi_rate || 0) * 0.20 * situationalConfidence +
                   player.ops * 0.10 * (1 - situationalConfidence);
          } else {
            return player.slg * 0.50 + 
                   player.ops * 0.30 + 
                   player.avg * 0.20;
          }
          
        default: // 6-9: OPS based
          return player.ops;
      }
    };

    // 1. Lead-off (1st): More speed emphasis - leadoff needs to steal bases
    const leadoff = findBestPlayer(player => evaluatePlayer(player, 0));
    assignPlayer(0, leadoff);

    // 2. Table Setter (2nd): Heavy contact focus - must put ball in play to move runner
    const second = findBestPlayer(player => evaluatePlayer(player, 1));
    assignPlayer(1, second);

    // 3. Best Hitter (3rd): Balanced hitter with power and situational awareness
    const third = findBestPlayer(player => evaluatePlayer(player, 2));
    assignPlayer(2, third);

    // 4. Clean-up (4th): Clutch situations are everything - raw power is secondary
    const cleanup = findBestPlayer(player => evaluatePlayer(player, 3));
    assignPlayer(3, cleanup);

    // 5. Protection (5th): SLG: 45% | RISP: 35% | Two-out RBI: 20%
    const fifth = findBestPlayer(player => evaluatePlayer(player, 4));
    assignPlayer(4, fifth);

    // 6-9. Fill remaining positions by OPS (descending)
    const remainingPlayers = penalizedPlayers
      .filter(player => !usedPlayers.has(player.id))
      .sort((a, b) => evaluatePlayer(b, 5) - evaluatePlayer(a, 5));

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

  // Get basic stats penalty (based on total AB)
  const getBasicStatsPenalty = (ab: number) => {
    if (ab >= 12) return 0;      // Full confidence
    if (ab >= 6) return 0.15;    // Medium confidence  
    if (ab >= 3) return 0.30;    // Low confidence
    return 1;                    // Excluded
  };

  // Get situational stats penalty (based on situational AB)
  const getSituationalStatsPenalty = (situationalAb: number) => {
    if (situationalAb >= 5) return 0;      // Full confidence
    if (situationalAb >= 3) return 0.10;   // Light penalty
    if (situationalAb >= 1) return 0.25;   // Medium penalty
    return 0.50;                           // Heavy penalty (but not excluded)
  };

  // Helper function to apply confidence penalty
  const applyConfidencePenalty = (player: Player) => {
    const basicPenalty = getBasicStatsPenalty(player.ab || 0);
    const situationalPenalty = getSituationalStatsPenalty(player.ab_risp || 0);
    
    return {
      ...player,
      // Basic stats get basic penalty
      avg: (player.avg || 0) * (1 - basicPenalty),
      obp: (player.obp || 0) * (1 - basicPenalty),
      slg: (player.slg || 0) * (1 - basicPenalty),
      ops: (player.ops || 0) * (1 - basicPenalty),
      sb_percent: (player.sb_percent || 0) * (1 - basicPenalty),
      contact_percent: (player.contact_percent || 0) * (1 - basicPenalty),
      qab_percent: (player.qab_percent || 0) * (1 - basicPenalty),
      xbh: (player.xbh || 0) * (1 - basicPenalty),
      hr: (player.hr || 0) * (1 - basicPenalty),
      tb: (player.tb || 0) * (1 - basicPenalty),
      bb_k: (player.bb_k || 0) * (1 - basicPenalty),
      rbi: (player.rbi || 0) * (1 - basicPenalty),
      // Rate-based stats get basic penalty
      hr_rate: (player.hr_rate || 0) * (1 - basicPenalty),
      xbh_rate: (player.xbh_rate || 0) * (1 - basicPenalty),
      // Situational stats get situational penalty
      ba_risp: (player.ba_risp || 0) * (1 - situationalPenalty),
      two_out_rbi: (player.two_out_rbi || 0) * (1 - situationalPenalty),
      two_out_rbi_rate: (player.two_out_rbi_rate || 0) * (1 - situationalPenalty)
    };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = battingOrder.findIndex(player => player.id === active.id);
      const newIndex = battingOrder.findIndex(player => player.id === over.id);

      const newOrder = arrayMove(battingOrder, oldIndex, newIndex);
      onBattingOrderChange(newOrder);
    }
  };


  const addToOrder = (player: Player) => {
    if (battingOrder.find(p => p.id === player.id)) return;
    
    const newOrder = [...battingOrder, player];
    onBattingOrderChange(newOrder);
  };

  const clearOrder = () => {
    onBattingOrderChange([]);
  };

  const saveOrder = () => {
    if (!savedOrderName.trim()) return;
    
    const config: BattingOrderConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: savedOrderName.trim(),
      players: battingOrder,
      strategy: algorithm === 'traditional' ? 'mlb-level' : 'jacks-custom-local-league',
      createdAt: new Date().toISOString()
    };
    
    onSaveBattingOrder(config);
    setSavedOrderName('');
    setShowSaveDialog(false);
  };

  const loadOrder = (config: BattingOrderConfig) => {
    onBattingOrderChange(config.players);
    setAlgorithm(config.strategy === 'mlb-level' ? 'traditional' : 'situational');
  };

  const exportToPDF = async () => {
    setShowPDFCustomization(true);
  };

  const handlePDFExport = async (options: PDFExportOptions) => {
    setPdfOptions(options);
    setShowPDFCustomization(false);
    setShowPDFPreview(true);
  };

  const availablePlayers = players.filter(player => 
    !battingOrder.find(p => p.id === player.id)
  );

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper p="md" withBorder>
        <Group justify="space-between" align="center">
          <div>
            <Title order={3}>Batting Order</Title>
          </div>
          <Group>
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={exportToPDF}
              color="blue"
              radius="xl"
            >
              Export PDF
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Algorithm Selection */}
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={4}>Strategy</Title>
            <Group>
              <Button
                variant={algorithm === 'traditional' ? 'filled' : 'light'}
                color={algorithm === 'traditional' ? 'blue' : 'red'}
                onClick={() => setAlgorithm('traditional')}
                size="md"
                radius="xl"
                leftSection={<img src="/mlblogo.png" alt="MLB" width={32} height={24} style={{ objectFit: 'contain' }} />}
              >
                Traditional MLB
              </Button>
              <Button
                variant={algorithm === 'situational' ? 'filled' : 'light'}
                color={algorithm === 'situational' ? 'blue' : 'red'}
                onClick={() => setAlgorithm('situational')}
                size="md"
                radius="xl"
                leftSection={<img src="/situational2.jpg" alt="Situational" width={32} height={24} style={{ objectFit: 'contain' }} />}
              >
                Situational Analytics
              </Button>
              <ActionIcon
                variant="filled"
                color="gray"
                onClick={() => setShowStrategyInfo(true)}
                size="lg"
                onMouseEnter={(e: React.MouseEvent) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltipPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10
                  });
                  setShowStrategyTooltip(true);
                }}
                onMouseLeave={() => setShowStrategyTooltip(false)}
              >
                <IconInfoCircle size={20} />
              </ActionIcon>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Batting Order */}
      <Paper p="md" withBorder>
        <Group justify="space-between" align="center" mb="md">
          <div>
            <Title order={4}>Batting Order</Title>
            <Text size="sm" c="dimmed">{battingOrder.length} players</Text>
          </div>
          <Group>
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={generateBattingOrder}
              disabled={players.length === 0}
              color="green"
              radius="xl"
            >
              Generate Batting Order
            </Button>
            <Button
              leftSection={<IconX size={16} />}
              onClick={clearOrder}
              variant="light"
              color="red"
              disabled={battingOrder.length === 0}
              radius="xl"
            >
              Clear Order
            </Button>
            <Switch
              label="Show Fielding Positions"
              checked={showFieldingDropdowns}
              onChange={(event) => setShowFieldingDropdowns(event.currentTarget.checked)}
            />
            <Switch
              label="Show Confidence Scores"
              checked={!hideConfidenceScore}
              onChange={(event) => setHideConfidenceScore(!event.currentTarget.checked)}
            />
          </Group>
        </Group>

        {battingOrder.length === 0 ? (
          <Center h={200}>
            <Stack align="center" gap="md">
              <IconChartBar size={48} color="var(--mantine-color-gray-4)" />
              <Text size="lg" c="dimmed">No players in batting order</Text>
              <Text size="sm" c="dimmed">
                Generate a batting order or add players manually
              </Text>
            </Stack>
          </Center>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={battingOrder.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack gap="sm">
                {battingOrder.map((player, index) => (
                  <SortablePlayerCard
                    key={player.id}
                    player={player}
                    position={index + 1}
                    getConfidenceLevel={getConfidenceLevel}
                    onFieldingPositionChange={(playerId, position) => {
                      const updatedPlayers = battingOrder.map(p =>
                        p.id === playerId ? { ...p, fieldingPosition: position } : p
                      );
                      onBattingOrderChange(updatedPlayers);
                    }}
                    showFieldingDropdowns={showFieldingDropdowns}
                    getAvailablePositions={getAvailablePositions}
                    onRemove={(playerId) => {
                      const updatedOrder = battingOrder.filter(p => p.id !== playerId);
                      onBattingOrderChange(updatedOrder);
                    }}
                    hideConfidenceScore={hideConfidenceScore}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Paper>

      {/* Available Players */}
      {availablePlayers.length > 0 && (
        <Paper p="md" withBorder>
          <Title order={4} mb="md">Available Players</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="sm">
            {availablePlayers.map(player => (
              <AvailablePlayerCard
                key={player.id}
                player={player}
                isInOrder={battingOrder.find(p => p.id === player.id)}
                confidence={getConfidenceLevel(player.ab)}
                onAddToOrder={() => addToOrder(player)}
                hideConfidenceScore={hideConfidenceScore}
              />
            ))}
          </SimpleGrid>
        </Paper>
      )}

      {/* Saved Orders */}
      {savedBattingOrders.length > 0 && (
        <Paper p="md" withBorder>
          <Group justify="space-between" align="center" mb="md">
            <Title order={4}>Saved Batting Orders</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setShowSaveDialog(true)}
              size="sm"
            >
              Save Current
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {savedBattingOrders.map(config => (
              <Card key={config.id} shadow="sm" padding="sm" radius="md" withBorder>
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={500} size="sm">{config.name}</Text>
                    <Text size="xs" c="dimmed">
                      {config.players.length} players • {config.strategy}
                    </Text>
                  </div>
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      variant="light"
                      size="sm"
                      onClick={() => loadOrder(config)}
                    >
                      <IconRefresh size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Paper>
      )}

      {/* Modals */}
      <StrategyInfoModal
        isOpen={showStrategyInfo}
        onClose={() => setShowStrategyInfo(false)}
        onNavigateToHelp={onNavigateToHelp}
      />


      <PDFCustomizationModal
        isOpen={showPDFCustomization}
        onClose={() => setShowPDFCustomization(false)}
        onExport={handlePDFExport}
        teamName={teamInfo.name}
      />

      {pdfOptions && (
        <PDFPreviewModal
          isOpen={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
          onBack={() => setShowPDFPreview(false)}
          onExport={handlePDFExport}
          battingOrder={battingOrder}
          teamInfo={teamInfo}
          pdfOptions={pdfOptions}
          playerPositions={{}}
        />
      )}

      <Modal
        opened={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        title="Save Batting Order"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Batting Order Name"
            placeholder="Enter batting order name"
            value={savedOrderName}
            onChange={(e) => setSavedOrderName(e.target.value)}
            autoFocus
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={() => setShowSaveDialog(false)} radius="xl">
              Cancel
            </Button>
            <Button
              onClick={saveOrder}
              disabled={!savedOrderName.trim()}
              radius="xl"
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Tooltips */}
      {showStrategyTooltip && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '0.4rem 0.6rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
          zIndex: 10000,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '180px',
          textAlign: 'center'
        }}>
          Learn about the strategies
        </div>,
        document.body
      )}


    </Stack>
  );
};
