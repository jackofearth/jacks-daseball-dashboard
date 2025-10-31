import React, { useState, Suspense } from 'react';
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';
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
  ThemeIcon,
  SegmentedControl,
  Image,
  Badge,
  Menu,
  Tooltip
} from '@mantine/core';
import {
  IconGripVertical,
  IconTrash,
  IconPlus,
  IconRefresh,
  IconChartBar,
  IconX,
  IconCheck,
  IconBolt,
  IconAlertTriangle,
  IconChevronDown
} from '@tabler/icons-react';
import { Player, BattingOrderConfig, UserSettings, TeamInfo } from './StorageService';
// lazy components are declared after imports (to satisfy import/first)
const PDFExportButton = React.lazy(() => import('./components/PDFExportButton').then(m => ({ default: m.PDFExportButton })));
const StrategyInfoModal = React.lazy(() => import('./StrategyInfoModal'));
const ConfidenceInfoModal = React.lazy(() => import('./ConfidenceInfoModal'));
// removed CanvasPreviewModal

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
  onOpenCustomization?: () => void;
}

interface SortablePlayerCardProps {
  player: Player;
  position: number;
  getConfidenceLevel: (pa: number) => { level: string; label: string; color: string; icon: string; penalty: number };
  onFieldingPositionChange: (playerId: string, position: string) => void;
  showFieldingDropdowns: boolean;
  getAvailablePositions: (playerId: string) => string[];
  onRemove: (playerId: string) => void;
  hideConfidenceScore: boolean;
  useFieldingNumbers: boolean;
  showBattingHand: boolean;
}

interface AvailablePlayerCardProps {
  player: Player;
  isInOrder: Player | undefined;
  confidence: { level: string; label: string; color: string; icon: string; penalty: number };
  onAddToOrder: () => void;
  hideConfidenceScore: boolean;
  showBattingHand: boolean;
}

const AvailablePlayerCard: React.FC<AvailablePlayerCardProps> = ({ player, isInOrder, confidence, onAddToOrder, hideConfidenceScore, showBattingHand }) => {
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
            {player.name} {showBattingHand && (
              <Badge 
                size="xs" 
                variant="filled" 
                color={player.battingHand === 'L' ? 'red' : 'blue'}
                style={{ marginLeft: '8px' }}
              >
                {player.battingHand || 'R'}
              </Badge>
            )}
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
                    PA: {player.pa || 0}
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
                  radius="xl"
                  style={{
                    boxShadow: confidence.color === 'green' 
                      ? '0 0 8px rgba(76, 175, 80, 0.4)'
                      : confidence.color === 'yellow'
                      ? '0 0 8px rgba(255, 193, 7, 0.4)'
                      : '0 0 8px rgba(255, 152, 0, 0.4)',
                  }}
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
  hideConfidenceScore,
  useFieldingNumbers,
  showBattingHand
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

  const confidence = getConfidenceLevel(player.pa || 0);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      data-fielding-position={player.fieldingPosition || 'P'}
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
              {position}. {player.name} {showBattingHand && (
                <Badge 
                  size="xs" 
                  variant="filled" 
                  color={player.battingHand === 'L' ? 'red' : 'blue'}
                  style={{ marginLeft: '8px' }}
                >
                  {player.battingHand || 'R'}
                </Badge>
              )}
            </Text>
        <Group gap="xs" mt={4}>
          <Text size="sm" c="dimmed">AVG: {player.avg.toFixed(3)}</Text>
          <Text size="sm" c="dimmed">OBP: {player.obp.toFixed(3)}</Text>
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
                  PA: {player.pa || 0}
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
                radius="xl"
                style={{
                  boxShadow: confidence.color === 'green' 
                    ? '0 0 8px rgba(76, 175, 80, 0.4)'
                    : confidence.color === 'yellow'
                    ? '0 0 8px rgba(255, 193, 7, 0.4)'
                    : '0 0 8px rgba(255, 152, 0, 0.4)',
                }}
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
              value={useFieldingNumbers ? 
                (player.fieldingPosition ? 
                  (() => {
                    const positionMap: { [key: string]: string } = {
                      'P': '1', 'C': '2', '1B': '3', '2B': '4', '3B': '5',
                      'SS': '6', 'LF': '7', 'CF': '8', 'RF': '9', 'EH': 'EH', 'DH': 'DH'
                    };
                    return positionMap[player.fieldingPosition] || player.fieldingPosition;
                  })() : ''
                ) : (player.fieldingPosition || '')
              }
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
  onNavigateToHelp,
  onOpenCustomization
}) => {
  const [algorithm, setAlgorithm] = useState<'traditional' | 'situational'>('traditional');
  const [showFieldingDropdowns, setShowFieldingDropdowns] = useState(() => {
    const saved = localStorage.getItem('showFieldingDropdowns');
    return saved ? JSON.parse(saved) : false;
  });
  const [hideConfidenceScore, setHideConfidenceScore] = useState(() => {
    const saved = localStorage.getItem('hideConfidenceScore');
    return saved ? JSON.parse(saved) : true;
  });
  const [useFieldingNumbers, setUseFieldingNumbers] = useState(() => {
    const saved = localStorage.getItem('useFieldingNumbers');
    return saved ? JSON.parse(saved) : false;
  });
  const [showBattingHand, setShowBattingHand] = useState(() => {
    const saved = localStorage.getItem('showBattingHand');
    return saved ? JSON.parse(saved) : false;
  });
  const [showStrategyInfo, setShowStrategyInfo] = useState(false);
  const [showConfidenceInfo, setShowConfidenceInfo] = useState(false);
  // removed CanvasPreviewModal state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedOrderName, setSavedOrderName] = useState('');

  // Custom close handler for confidence modal that doesn't affect dropdown
  const handleConfidenceModalClose = () => {
    setShowConfidenceInfo(false);
  };

  // Save toggle states to localStorage
  React.useEffect(() => {
    localStorage.setItem('showFieldingDropdowns', JSON.stringify(showFieldingDropdowns));
  }, [showFieldingDropdowns]);

  React.useEffect(() => {
    localStorage.setItem('hideConfidenceScore', JSON.stringify(hideConfidenceScore));
  }, [hideConfidenceScore]);

  React.useEffect(() => {
    localStorage.setItem('useFieldingNumbers', JSON.stringify(useFieldingNumbers));
  }, [useFieldingNumbers]);

  React.useEffect(() => {
    localStorage.setItem('showBattingHand', JSON.stringify(showBattingHand));
  }, [showBattingHand]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allPositions = [
    'P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'EH', 'DH'
  ];

  // Get available positions for a specific player (exclusive except for EH)
  const getAvailablePositions = (playerId: string) => {
    const currentPlayerPosition = battingOrder.find(p => p.id === playerId)?.fieldingPosition;
    const usedPositionsForOthers = new Set(
      battingOrder
        .filter(p => p.id !== playerId && p.fieldingPosition && p.fieldingPosition !== 'EH')
        .map(p => p.fieldingPosition)
    );
    
    const availablePositions = allPositions.filter(pos => 
      pos === 'EH' || // EH is always available
      pos === currentPlayerPosition || // Current player's position is always available
      !usedPositionsForOthers.has(pos) // Position not used by other players
    );

    // If using fielding numbers, convert positions to numbers
    if (useFieldingNumbers) {
      return availablePositions.map(pos => {
        const positionMap: { [key: string]: string } = {
          'P': '1',
          'C': '2', 
          '1B': '3',
          '2B': '4',
          '3B': '5',
          'SS': '6',
          'LF': '7',
          'CF': '8',
          'RF': '9',
          'EH': 'EH',
          'DH': 'DH'
        };
        return positionMap[pos] || pos;
      });
    }

    return availablePositions;
  };

  const getConfidenceLevel = (pa: number) => {
    if (pa >= 15) return { level: 'High', label: 'High Confidence', color: 'green', icon: 'check', penalty: 0 };
    if (pa >= 8) return { level: 'Medium', label: 'Medium Confidence', color: 'yellow', icon: 'bolt', penalty: 0.15 };
    if (pa >= 4) return { level: 'Low', label: 'Low Confidence', color: 'orange', icon: 'alert', penalty: 0.30 };
    return { level: 'Excluded', label: 'Excluded', color: 'red', icon: 'x', penalty: 1.0 };
  };

  const generateBattingOrder = () => {
    if (players.length === 0) {
      toast.error('No players available. Import a CSV or add players manually.', {
        icon: '⚠️',
      });
      return;
    }

    // Centralized action-based customization reminder (3rd and 10th generations)
    try {
      const isNameBlank = !teamInfo.name || teamInfo.name.trim() === '';
      const customizationIncomplete = isNameBlank;
      if (customizationIncomplete) {
        const genCount = (parseInt(localStorage.getItem('orderGenerateCount') || '0', 10) + 1);
        localStorage.setItem('orderGenerateCount', genCount.toString());
        if (genCount === 3 || genCount === 10) {
          const lastShown = parseInt(localStorage.getItem('customizeToastLastShownAt') || '0', 10);
          const lastMilestone = parseInt(localStorage.getItem('customizeToastLastMilestone') || '0', 10);
          const allowDueToMilestone = genCount === 10 && lastMilestone !== 10; // fire 10th even within 24h of 3rd once
          if ((Date.now() - lastShown > 24 * 60 * 60 * 1000 || allowDueToMilestone) && onOpenCustomization) {
            localStorage.setItem('customizeToastLastShownAt', Date.now().toString());
            localStorage.setItem('customizeToastLastMilestone', genCount.toString());
            setTimeout(() => {
              toast((t) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>Customize your team for a better lineup card</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Add a team name.</div>
                  <Button size="xs" radius="xl" onClick={() => { onOpenCustomization(); toast.dismiss(t.id); }}>Customize now</Button>
                </div>
              ), { duration: 8000, icon: '🎨' });
            }, 1500);
          }
        }
      }
    } catch {}

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
      (player.pa || 0) >= 4
    );
    
    // If we have players with sufficient stats, use them; otherwise use all players
    const playersToUse = primaryPlayers.length > 0 ? primaryPlayers : [...players];

    // Apply confidence penalties to all players
    const penalizedPlayers = playersToUse.map(applyConfidencePenalty);
    

    // MLB Modern Analytics Order Strategy - use penalized stats for ranking
    const playerStats = penalizedPlayers.map(p => ({
      ...p,
      ops: p.obp + p.slg,  // On-base + Slugging (with penalty applied)
      contactScore: p.avg + p.obp,
      speedScore: p.sb_percent || 0,  // Keep as percentage like original
      stolenBaseSuccess: (p.sb_percent || 0) * (Math.min((p.sb || 0) + (p.cs || 0), 10) / 10)  // Stolen base confidence weighting
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

    // 4. CLEANUP - Best power (highest SLG) - Modern analytics priority #2
    const cleanupCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.slg - a.slg);
    if (cleanupCandidates.length > 0) {
      order[4] = cleanupCandidates[0];
      used.add(cleanupCandidates[0].id);
    }

    // 2. ELITE HITTER - Highest remaining OPS (Modern analytics priority #3)
    const eliteHitterCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.ops - a.ops);
    if (eliteHitterCandidates.length > 0) {
      order[2] = eliteHitterCandidates[0];
      used.add(eliteHitterCandidates[0].id);
    }

    // 5. PROTECTION - Second best power hitter - Modern analytics priority #4
    const protectionCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.slg - a.slg);
    if (protectionCandidates.length > 0) {
      order[5] = protectionCandidates[0];
      used.add(protectionCandidates[0].id);
    }

    // 3. REMAINING TALENT - Gets remaining top talent (Modern analytics priority #5)
    const remainingTalentCandidates = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.ops - a.ops);
    if (remainingTalentCandidates.length > 0) {
      order[3] = remainingTalentCandidates[0];
      used.add(remainingTalentCandidates[0].id);
    }

    // 6-9. DESCENDING ORDER - By OPS (remaining players)
    const remainingByOPS = playerStats
      .filter(p => !used.has(p.id))
      .sort((a, b) => b.ops - a.ops);

    for (let pos = 6; pos <= 9; pos++) {
      if (remainingByOPS.length > pos - 6) {
        order[pos] = remainingByOPS[pos - 6];
        used.add(remainingByOPS[pos - 6].id);
      }
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
    
    toast.success(`Generated Traditional batting order for ${finalOrder.length} players`, {
      icon: '⚾',
    });
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
      (player.pa || 0) >= 4
    );
    
    // If we have players with sufficient stats, use them; otherwise use all players
    const allPlayers = primaryPlayers.length > 0 ? primaryPlayers : [...players];
    
    // Apply confidence penalties to all players
    const penalizedPlayers = allPlayers.map(applyConfidencePenalty);
    
    // Add stolenBaseSuccess field and calculate rates for Situational Analytics
    const playersWithStolenBaseSuccess = penalizedPlayers.map(p => ({
      ...p,
      stolenBaseSuccess: (p.sb_percent || 0) * (Math.min((p.sb || 0) + (p.cs || 0), 10) / 10),  // Stolen base confidence weighting
      // Calculate rate-based stats if not already present
      hr_rate: p.hr_rate || ((p.ab || 0) > 0 ? (p.hr || 0) / (p.ab || 1) : 0),
      xbh_rate: p.xbh_rate || ((p.ab || 0) > 0 ? (p.xbh || 0) / (p.ab || 1) : 0),
      two_out_rbi_rate: p.two_out_rbi_rate || ((p.ab_risp || 0) > 0 ? (p.two_out_rbi || 0) / (p.ab_risp || 1) : 0)
    }));
    
    const optimalOrder: Player[] = new Array(9).fill(null);
    const usedPlayers = new Set<string>();

    const findBestPlayer = (criteria: (player: Player) => number, excludeUsed = true) => {
      return playersWithStolenBaseSuccess
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
    const evaluatePlayer = (player: any, position: number) => {
      const hasSituationalData = (player.ab_risp || 0) >= 2;
      const situationalConfidence = (player.ab_risp || 0) >= 5 ? 1.0 : (player.ab_risp || 0) >= 3 ? 0.7 : 0.3;
      
      switch (position) {
        case 0: // Lead-off (1st): Speed + OBP
          return player.obp * 0.4 + 
                 (player.stolenBaseSuccess || 0) * 0.3 + 
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
    
    toast.success(`Generated Situational Analytics order for ${finalOrder.length} players`, {
      icon: '⚾',
    });
  };

  // Get basic stats penalty (based on total PA)
  const getBasicStatsPenalty = (pa: number) => {
    if (pa >= 15) return 0;      // Full confidence
    if (pa >= 8) return 0.15;    // Medium confidence  
    if (pa >= 4) return 0.30;    // Low confidence
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
    const basicPenalty = getBasicStatsPenalty(player.pa || 0);
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
    
    const playerWithBattingHand = { ...player, battingHand: (player.battingHand || 'R') as 'R' | 'L' };
    const newOrder = [...battingOrder, playerWithBattingHand];
    onBattingOrderChange(newOrder);
  };

  const clearOrder = () => {
    onBattingOrderChange([]);
    
    toast('Batting order cleared', {
      icon: '🗑️',
      duration: 2000,
    });
  };

  const saveOrder = () => {
    if (!savedOrderName.trim()) {
      toast.error('Please enter a name for the batting order', {
        icon: '⚠️',
      });
      return;
    }
    
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
    
    toast.success(`Saved batting order: "${config.name}"`, {
      icon: '💾',
    });
  };

  const loadOrder = (config: BattingOrderConfig) => {
    onBattingOrderChange(config.players);
    setAlgorithm(config.strategy === 'mlb-level' ? 'traditional' : 'situational');
    
    toast.success(`Loaded batting order: "${config.name}"`, {
      icon: '📋',
    });
  };



  const availablePlayers = players.filter(player => 
    !battingOrder.find(p => p.id === player.id)
  );

  return (
    <Stack gap="md">

      {/* Algorithm Selection */}
      <Paper p="md" withBorder data-section="strategy" style={{
        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%)',
        borderColor: 'rgba(255, 193, 7, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Stack gap="md">
          <Group justify="center">
            <Title order={1} size="h1" style={{ color: '#FFC107', textShadow: '0 0 15px rgba(255, 193, 7, 0.4)', letterSpacing: '0.5px' }}>Strategy</Title>
          </Group>
          <Group justify="center" align="center" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {/* Graphics above toggle - with manual alignment controls */}
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center',
                marginBottom: '8px',
                height: '42px'
              }}>
                <div style={{ 
                  position: 'relative',
                  display: 'flex',
                  gap: '0px',
                  width: '320px', // Match SegmentedControl width
                  alignItems: 'center',
                  marginRight: '12px' // Account for the gap between SegmentedControl and ActionIcon
                }}>
                  <div style={{ 
                    width: '160px', // Fixed width
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: algorithm === 'traditional' ? 1 : 0.4,
                    filter: algorithm === 'traditional' ? 'none' : 'grayscale(100%)',
                    transition: 'all 0.3s ease'
                  }}>
                    <img src="/mlblogo.png" alt="MLB" width={64} height={42} style={{ objectFit: 'contain' }} />
                  </div>
                  <div style={{ 
                    width: '160px', // Fixed width
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: algorithm === 'situational' ? 1 : 0.4,
                    filter: algorithm === 'situational' ? 'none' : 'grayscale(100%)',
                    transition: 'all 0.3s ease'
                  }}>
                    <img 
                      src={process.env.PUBLIC_URL + '/situational.png'} 
                      alt="Situational" 
                      width={64} 
                      height={42} 
                      style={{ objectFit: 'contain' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/situational.png'; }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Traditional Mantine Toggle */}
              <Group gap="md" justify="center" style={{ marginLeft: '40px' }}>
                <SegmentedControl
                  value={algorithm}
                  onChange={(value) => setAlgorithm(value as 'traditional' | 'situational')}
                  data={[
                    { value: 'traditional', label: 'Modern Baseball' },
                    { value: 'situational', label: 'Situational Analytics' }
                  ]}
                  size="lg"
                  color={algorithm === 'situational' ? 'red' : 'blue'}
                  radius="xl"
                />
                
                <Tooltip label="What are these strategies?" position="bottom" withArrow>
                  <ActionIcon
                    variant="filled"
                    color="gray"
                    onClick={() => setShowStrategyInfo(true)}
                    size="lg"
                  >
                    ?
                  </ActionIcon>
                </Tooltip>
              </Group>
            </div>
            <div style={{ position: 'absolute', right: 0 }}>
              <Suspense fallback={null}>
                <PDFExportButton
                  battingOrder={battingOrder}
                  teamInfo={teamInfo}
                  algorithm={algorithm}
                  showFieldingPositions={showFieldingDropdowns}
                  useFieldingNumbers={useFieldingNumbers}
                  onOpenCustomization={onOpenCustomization}
                  players={players}
                />
              </Suspense>
            </div>
          </Group>
        </Stack>
      </Paper>

      {/* Batting Order */}
      <Paper 
        p="md" 
        withBorder 
        data-section="batting-order" 
        data-team-name={teamInfo.name || "BATTING ORDER"} 
        data-team-location={teamInfo.location || ""}
        className={battingOrder.length > 0 ? 'batting-order-active' : ''}
      >
        {/* Print header with logo and team info */}
        <Group justify="center" align="center" mb="0" style={{ display: 'none', gap: '0px' }} className="print-header">
          {teamInfo.logo && (
            <Image
              src={teamInfo.logo}
              alt={`${teamInfo.name} logo`}
              w={200}
              h={200}
              fit="contain"
              style={{
                borderRadius: '20px',
                backgroundColor: 'transparent',
                padding: '0px',
                margin: '0px'
              }}
            />
          )}
          <Text size="xl" fw={700} c="dark" style={{ margin: '0px' }}>
            {teamInfo.location && `${teamInfo.location} `}{teamInfo.name || 'BATTING ORDER'}
          </Text>
        </Group>
        
        <Group justify="space-between" align="center" mb="md">
          <div>
            <Title 
              order={1} 
              size="h1"
              mb="md"
              style={{
                color: '#FFC107',
                textShadow: '0 0 15px rgba(255, 193, 7, 0.4)',
                letterSpacing: '0.5px',
              }}
            >
              Batting Order
            </Title>
            <Text size="sm" c="dimmed">{battingOrder.length} players</Text>
          </div>
          <Group>
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={generateBattingOrder}
              size="lg"
              radius="xl"
              disabled={players.length === 0}
              style={{
                background: players.length > 0 
                  ? 'linear-gradient(45deg, #FFC107, #FFD54F)'
                  : undefined,
                color: players.length > 0 ? '#000' : undefined,
                fontWeight: 700,
                boxShadow: players.length > 0 
                  ? '0 2px 10px rgba(255, 193, 7, 0.6)' 
                  : undefined,
                transition: 'all 0.3s ease',
              }}
              styles={{
                root: {
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 193, 7, 0.6)',
                  },
                },
              }}
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
            <Menu shadow="md" width={300}>
              <Menu.Target>
                <Button
                  variant="light"
                  color="gray"
                  size="sm"
                  rightSection={<IconChevronDown size={14} />}
                >
                  Advanced Options
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      label="Show Fielding Positions"
                      checked={showFieldingDropdowns}
                      onChange={(event) => setShowFieldingDropdowns(event.currentTarget.checked)}
                      labelPosition="right"
                      size="sm"
                      w="100%"
                    />
                  </div>
                </Menu.Item>
                <Menu.Item>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      label="Fielding Position Numbers"
                      checked={useFieldingNumbers}
                      onChange={(event) => setUseFieldingNumbers(event.currentTarget.checked)}
                      labelPosition="right"
                      size="sm"
                      w="100%"
                    />
                  </div>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Group gap="xs" justify="space-between" align="center" wrap="nowrap">
                      <Switch
                        label="Show Confidence Scores"
                        checked={!hideConfidenceScore}
                        onChange={(event) => setHideConfidenceScore(!event.currentTarget.checked)}
                        labelPosition="right"
                        size="sm"
                      />
                      <Tooltip label="What are these?" position="bottom" withArrow>
                        <ActionIcon
                          variant="filled"
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowConfidenceInfo(true);
                          }}
                          size="xs"
                          style={{ flexShrink: 0 }}
                        >
                          ?
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </div>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Switch
                      label="Show Righty/Lefty"
                      checked={showBattingHand}
                      onChange={(event) => setShowBattingHand(event.currentTarget.checked)}
                      labelPosition="right"
                      size="sm"
                      w="100%"
                    />
                  </div>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
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
                      // Convert number back to position name if using fielding numbers
                      let actualPosition = position;
                      if (useFieldingNumbers) {
                        const numberToPositionMap: { [key: string]: string } = {
                          '1': 'P',
                          '2': 'C',
                          '3': '1B',
                          '4': '2B',
                          '5': '3B',
                          '6': 'SS',
                          '7': 'LF',
                          '8': 'CF',
                          '9': 'RF',
                          'EH': 'EH',
                          'DH': 'DH'
                        };
                        actualPosition = numberToPositionMap[position] || position;
                      }
                      
                      const updatedPlayers = battingOrder.map(p =>
                        p.id === playerId ? { ...p, fieldingPosition: actualPosition } : p
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
                    useFieldingNumbers={useFieldingNumbers}
                    showBattingHand={showBattingHand}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Paper>

      {/* Available Players */}
      {availablePlayers.length > 0 && (
        <Paper 
          p="md" 
          withBorder 
          data-section="available-players"
          style={{
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%)',
            borderColor: 'rgba(255, 193, 7, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Title 
            order={4} 
            mb="md"
            style={{
              color: '#FFC107',
              textShadow: '0 0 15px rgba(255, 193, 7, 0.4)',
              letterSpacing: '0.5px',
            }}
          >
            Available Players
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="sm">
            {availablePlayers.map(player => (
              <AvailablePlayerCard
                key={player.id}
                player={player}
                isInOrder={battingOrder.find(p => p.id === player.id)}
                confidence={getConfidenceLevel(player.pa || 0)}
                onAddToOrder={() => addToOrder(player)}
                hideConfidenceScore={hideConfidenceScore}
                showBattingHand={showBattingHand}
              />
            ))}
          </SimpleGrid>
        </Paper>
      )}

      {/* Saved Orders */}
      {savedBattingOrders.length > 0 && (
        <Paper p="md" withBorder data-section="saved-orders">
          <Group justify="space-between" align="center" mb="md">
            <Title 
              order={4}
              style={{
                color: '#FFC107',
                textShadow: '0 0 15px rgba(255, 193, 7, 0.4)',
                letterSpacing: '0.5px',
              }}
            >
              Saved Batting Orders
            </Title>
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
      <Suspense fallback={null}>
        <StrategyInfoModal
          isOpen={showStrategyInfo}
          onClose={() => setShowStrategyInfo(false)}
          onNavigateToHelp={onNavigateToHelp}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ConfidenceInfoModal
          isOpen={showConfidenceInfo}
          onClose={handleConfidenceModalClose}
        />
      </Suspense>

      {/* CanvasPreviewModal removed */}





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
    </Stack>
  );
};
