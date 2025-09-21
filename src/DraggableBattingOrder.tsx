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
import { Player, BattingOrderConfig, UserSettings, TeamInfo } from './StorageService';
import ConfirmationDialog from './ConfirmationDialog';
import StrategyInfoModal from './StrategyInfoModal';
import ConfidenceSymbolsModal from './ConfidenceSymbolsModal';
import BattingOrderPDF from './BattingOrderPDF';
import PDFCustomizationModal, { PDFExportOptions } from './PDFCustomizationModal';
import PDFPreviewModal from './PDFPreviewModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
}

interface SortablePlayerCardProps {
  player: Player;
  position: number;
  getConfidenceLevel: (pa: number) => { level: string; label: string; color: string; icon: string; penalty: number };
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
              {confidence.label} ({player.pa || 0} PA){confidence.penalty > 0 ? ` - ${(confidence.penalty * 100)}% penalty applied` : ''}
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

  const confidence = getConfidenceLevel(player.pa || 0);
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
              {confidence.label} ({player.pa || 0} PA){confidence.penalty > 0 ? ` - ${(confidence.penalty * 100)}% penalty applied` : ''}
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
  onClearAllPlayers,
  teamInfo
}) => {
  const [showFieldingDropdowns, setShowFieldingDropdowns] = React.useState(() => {
    const saved = localStorage.getItem('showFieldingDropdowns');
    return saved ? JSON.parse(saved) : false;
  });
  const [showClearBattingOrderDialog, setShowClearBattingOrderDialog] = React.useState(false);
  
  // Save fielding dropdowns state to localStorage
  React.useEffect(() => {
    localStorage.setItem('showFieldingDropdowns', JSON.stringify(showFieldingDropdowns));
  }, [showFieldingDropdowns]);

  // Load fielding positions from localStorage when batting order changes
  React.useEffect(() => {
    const savedFieldingPositions = localStorage.getItem('fieldingPositions');
    if (savedFieldingPositions && battingOrder.length > 0) {
      const fieldingPositions = JSON.parse(savedFieldingPositions);
      const updatedOrder = battingOrder.map(player => ({
        ...player,
        fieldingPosition: fieldingPositions[player.id] || player.fieldingPosition
      }));
      
      // Only update if there are actual changes to avoid infinite loops
      const hasChanges = updatedOrder.some((player, index) => 
        player.fieldingPosition !== battingOrder[index].fieldingPosition
      );
      
      if (hasChanges) {
        onBattingOrderChange(updatedOrder);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battingOrder.length]); // Only run when batting order length changes (new players added)
  const [showStrategyInfoModal, setShowStrategyInfoModal] = React.useState(false);
  const [showConfidenceSymbolsModal, setShowConfidenceSymbolsModal] = React.useState(false);
  const [lastUsedStrategy, setLastUsedStrategy] = React.useState<string | null>(null);
  const [showStrategyTooltip, setShowStrategyTooltip] = React.useState(false);
  // Player positions - LOCKED and permanent for all users (STATIC - NO STATE)
  const playerPositions = {
    P: { top: 379, left: 300 },    // Pitcher - center of diamond (LOCKED)
    C: { top: 509, left: 300 },    // Catcher - behind home plate (LOCKED)
    '1B': { top: 375, left: 480 }, // First base - right side (LOCKED)
    '2B': { top: 250, left: 355 }, // Second base - left side (LOCKED)
    '3B': { top: 375, left: 130 }, // Third base - right side (LOCKED)
    SS: { top: 285, left: 210 },   // Shortstop - left side (LOCKED)
    LF: { top: 190, left: 125 },   // Left field - left side (LOCKED)
    CF: { top: 105, left: 300 },   // Center field - top center (LOCKED)
    RF: { top: 185, left: 490 }    // Right field - right side (LOCKED)
  };

  const [showConfidenceTooltip, setShowConfidenceTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });
  const [isExportingPDF, setIsExportingPDF] = React.useState(false);
  const [showPDFCustomization, setShowPDFCustomization] = React.useState(false);
  const [showPDFPreview, setShowPDFPreview] = React.useState(false);
  const [pdfOptions, setPdfOptions] = React.useState<PDFExportOptions>({
    coachName: '',
    opponent: '',
    date: new Date().toLocaleDateString(),
    showFieldingPositions: true
  });

  // PDF Export Function
  const exportToPDF = async (options: PDFExportOptions) => {
    if (battingOrder.length === 0) {
      alert('Please generate a batting order first');
      return;
    }

    setIsExportingPDF(true);
    
    try {
      // Show the PDF component temporarily
      const pdfElement = document.getElementById('pdf-lineup-card');
      if (pdfElement) {
        // Make sure it's visible and positioned properly
        pdfElement.style.display = 'block';
        pdfElement.style.position = 'fixed';
        pdfElement.style.top = '0px';
        pdfElement.style.left = '0px';
        pdfElement.style.zIndex = '9999';
        pdfElement.style.backgroundColor = 'white';
        
        // Wait longer for images to load
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Capture the element as canvas with balanced resolution
        const canvas = await html2canvas(pdfElement, {
          scale: 2, // Balanced resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true,
          width: 1100,
          height: 850,
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: false
        });
        
        // Hide the PDF component again
        pdfElement.style.display = 'none';
        
        // Check if canvas has content
        const ctx = canvas.getContext('2d');
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const hasContent = imageData && Array.from(imageData.data).some(pixel => pixel !== 255);
        
        if (!hasContent) {
          throw new Error('Canvas appears to be empty');
        }
        
        // Use canvas directly for better quality
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Create PDF
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        // Calculate dimensions to fit the image
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${teamInfo?.name || 'Team'}-batting-lineup.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Try fallback method without html2canvas
      try {
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        // Add header
        pdf.setFontSize(24);
        pdf.setTextColor(220, 53, 69); // Red color
        pdf.text(`${teamInfo?.name || 'Team'}`, 20, 25);
        
        pdf.setFontSize(18);
        pdf.setTextColor(0, 123, 255); // Blue color
        pdf.text('BATTING LINEUP', 20, 35);
        
        // Add batting order with better formatting
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0); // Black color
        let yPos = 50;
        
        // Create a table-like layout
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(0, 123, 255);
        
        battingOrder.forEach((player, index) => {
          if (player) {
            // Draw line
            pdf.line(20, yPos - 2, 190, yPos - 2);
            
            // Add player info
            pdf.text(`${index + 1}.`, 25, yPos);
            pdf.text(player.name, 35, yPos);
            pdf.text(`AVG: ${player.avg.toFixed(3)}`, 150, yPos);
            yPos += 8;
          }
        });
        
        // Add game info section
        yPos += 20;
        pdf.setFontSize(12);
        pdf.setTextColor(220, 53, 69);
        
        if (options.coachName) {
          pdf.text(`Coach: ${options.coachName}`, 20, yPos);
          yPos += 8;
        }
        if (options.opponent) {
          pdf.text(`vs: ${options.opponent}`, 20, yPos);
          yPos += 8;
        }
        if (options.date) {
          pdf.text(`Date: ${options.date}`, 20, yPos);
        }
        
        pdf.save(`${teamInfo?.name || 'Team'}-batting-lineup.pdf`);
        alert('PDF generated successfully (text-only version due to image processing issues)');
      } catch (fallbackError) {
        console.error('Fallback PDF generation failed:', fallbackError);
        alert('Error generating PDF. Please try again or contact support.');
      }
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Handle PDF customization
  const handlePDFCustomization = () => {
    setShowPDFCustomization(true);
  };

  // Handle PDF customization completion
  const handlePDFCustomizationComplete = (options: PDFExportOptions) => {
    setPdfOptions(options);
    setShowPDFCustomization(false);
    setShowPDFPreview(true);
  };

  // Handle PDF preview export
  const handlePDFPreviewExport = async (options: PDFExportOptions) => {
    setShowPDFPreview(false);
    await exportToPDF(options);
  };

  // Handle back to customization
  const handleBackToCustomization = () => {
    setShowPDFPreview(false);
    setShowPDFCustomization(true);
  };

  // Get confidence level based on PA
  const getConfidenceLevel = (pa: number) => {
    if (pa >= 15) return { level: 'full', label: 'Full confidence', color: '#28a745', icon: '', penalty: 0 };
    if (pa >= 8) return { level: 'medium', label: 'Medium confidence', color: '#ffc107', icon: '⚡', penalty: 0.15 };
    if (pa >= 4) return { level: 'low', label: 'Low confidence', color: '#fd7e14', icon: '⚠️', penalty: 0.30 };
    return { level: 'excluded', label: 'Excluded', color: '#dc3545', icon: '🚫', penalty: 1 };
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

  // Apply confidence penalty to offensive stats with different penalties for basic vs situational
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
    
    // Save fielding positions to localStorage
    const fieldingPositions = updatedOrder.reduce((acc, player) => {
      if (player.fieldingPosition) {
        acc[player.id] = player.fieldingPosition;
      }
      return acc;
    }, {} as Record<string, string>);
    localStorage.setItem('fieldingPositions', JSON.stringify(fieldingPositions));
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
    const remainingPlayers = allPlayers
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
      speedScore: p.sb_percent || 0,
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
              const rect = e.currentTarget.getBoundingClientRect();
              const viewportWidth = window.innerWidth;
              const tooltipWidth = 200; // Approximate tooltip width
              
              // Position tooltip to avoid covering content with more buffer
              let x = rect.left + rect.width / 2;
              if (x + tooltipWidth / 2 > viewportWidth - 30) {
                x = viewportWidth - tooltipWidth / 2 - 30;
              } else if (x - tooltipWidth / 2 < 30) {
                x = tooltipWidth / 2 + 30;
              }
              
              setTooltipPosition({
                x: x,
                y: rect.top - 25
              });
              setShowStrategyTooltip(true);
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              setShowStrategyTooltip(false);
            }}
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
                      Modern Baseball Consensus
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
        {battingOrder.length === 0 ? null : (
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
              {battingOrder.length > 0 && (
                <>
                  <button 
                    onClick={handlePDFCustomization}
                    disabled={isExportingPDF}
                    style={{
                      background: isExportingPDF ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: isExportingPDF ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                    title="Export batting order as PDF"
                  >
                    {isExportingPDF ? 'Generating PDF...' : '📄 Export PDF'}
                  </button>
                </>
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem',
          width: '100%',
          maxWidth: '800px'
        }}>
          <div style={{ flex: 1 }}></div>
          <h3 style={{ textAlign: 'center', margin: 0, flex: 2 }}>Available Players ({players.length})</h3>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
            justifyContent: 'flex-end'
          }}>
            <span style={{ fontSize: '1.2rem', color: '#ffc107' }}>⚡</span>
            <span style={{ fontSize: '1.2rem', color: '#fd7e14' }}>⚠️</span>
            <span style={{ fontSize: '1.2rem', color: '#dc3545' }}>🚫</span>
            <button
              onClick={() => setShowConfidenceSymbolsModal(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer',
                color: '#007bff',
                padding: '0.25rem',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginLeft: '0.25rem'
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const tooltipWidth = 200; // Approximate tooltip width
                
                // Position tooltip to avoid covering content with more buffer
                let x = rect.left + rect.width / 2;
                if (x + tooltipWidth / 2 > viewportWidth - 30) {
                  x = viewportWidth - tooltipWidth / 2 - 30;
                } else if (x - tooltipWidth / 2 < 30) {
                  x = tooltipWidth / 2 + 30;
                }
                
                setTooltipPosition({
                  x: x,
                  y: rect.top - 25
                });
                setShowConfidenceTooltip(true);
              }}
              onMouseLeave={() => setShowConfidenceTooltip(false)}
            >
              ⓘ
            </button>
          </div>
        </div>
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
            const confidence = getConfidenceLevel(player.pa || 0);
            
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
        onNavigateToHelp={() => {}}
      />

      {/* Confidence Symbols Modal */}
      <ConfidenceSymbolsModal
        isOpen={showConfidenceSymbolsModal}
        onClose={() => setShowConfidenceSymbolsModal(false)}
      />

      {/* Strategy Tooltip */}
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

      {/* Confidence Tooltip */}
      {showConfidenceTooltip && ReactDOM.createPortal(
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
          What are these symbols?
        </div>,
        document.body
      )}


      {/* PDF Component - Hidden by default for actual PDF generation */}
      <div id="pdf-lineup-card" style={{ display: 'none' }}>
        <BattingOrderPDF 
          battingOrder={battingOrder}
          teamName={teamInfo?.name || 'My Team'}
          teamInfo={teamInfo}
          playerPositions={playerPositions}
          coachName={pdfOptions.coachName}
          opponent={pdfOptions.opponent}
          date={pdfOptions.date}
          showFieldingPositions={pdfOptions.showFieldingPositions}
        />
      </div>

      {/* PDF Customization Modal */}
      <PDFCustomizationModal
        isOpen={showPDFCustomization}
        onClose={() => setShowPDFCustomization(false)}
        onExport={handlePDFCustomizationComplete}
        teamName={teamInfo?.name || 'My Team'}
      />

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        onBack={handleBackToCustomization}
        onExport={handlePDFPreviewExport}
        battingOrder={battingOrder}
        teamInfo={teamInfo}
        pdfOptions={pdfOptions}
        playerPositions={playerPositions}
      />
    </div>
  );
};
