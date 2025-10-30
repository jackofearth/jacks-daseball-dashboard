import React, { useState } from 'react';
import { 
  Card, 
  Text, 
  Group, 
  Badge, 
  ActionIcon, 
  Button, 
  Modal, 
  TextInput, 
  NumberInput, 
  Grid, 
  Stack, 
  Title, 
  Divider,
  Paper,
  Alert,
  Center,
  Tooltip
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconChartBar, 
  IconEdit, 
  IconTrash, 
  IconUpload, 
  IconPlus,
  IconCheck
} from '@tabler/icons-react';
import { Player, CSVFile, savePlayerHandedness, getPlayerHandedness } from './StorageService';

interface PlayerManagerProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  csvFiles: CSVFile[];
  onCSVImport: (csvData: CSVFile) => void;
  onClearAllPlayers: () => void;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({ 
  players, 
  onPlayersChange, 
  csvFiles, 
  onCSVImport,
  onClearAllPlayers
}) => {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [addPlayerOpened, { open: openAddPlayer, close: closeAddPlayer }] = useDisclosure(false);
  const [statsOpened, { open: openStats, close: closeStats }] = useDisclosure(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleCSVImport = (csvData: any[], filename: string) => {
    console.log('handleCSVImport called with:', csvData.length, 'rows, filename:', filename);
    if (csvData.length === 0) {
      console.log('No CSV data to import');
      return;
    }

    setIsImporting(true);

    // Use direct column names from processed data
    const firstColumn = 'First';
    const lastColumn = 'Last';
    const nameColumns = ['First', 'Last'];
    
    // Direct column mappings
    const avgColumn = 'AVG';
    const slgColumn = 'SLG';
    const opsColumn = 'OPS';
    const abColumn = 'AB';
    const paColumn = 'PA';
    const sbColumn = 'SB';
    const sbPercentColumn = 'SB%';
    const bbKColumn = 'BB/K';
    const contactPercentColumn = 'C%';
    const qabPercentColumn = 'QAB%';
    const baRispColumn = 'BA/RISP';
    const twoOutRbiColumn = '2OUTRBI';
    const xbhColumn = 'XBH';
    const hrColumn = 'HR';
    const tbColumn = 'TB';
    const lobColumn = 'LOB';

    // Convert CSV data to players
    const importedPlayers: Player[] = csvData
      .filter(row => {
        const hasName = nameColumns.some(col => row[col] && row[col].trim());
        if (nameColumns.length > 0) {
          return hasName;
        }
        return Object.values(row).some(value => 
          value && typeof value === 'string' && value.length > 2 && 
          /^[a-zA-Z\s,\-.]+$/.test(value) && !/^\d+$/.test(value)
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
            const parts = fullName.split(',').map(p => p.trim());
            lastName = parts[0] || '';
            firstName = parts[1] || '';
            displayName = `${firstName} ${lastName}`.trim();
          } else {
            const namePartsArray = fullName.split(' ');
            firstName = namePartsArray[0] || '';
            lastName = namePartsArray.slice(1).join(' ') || '';
            displayName = fullName;
          }
        }
        
        const avg = avgColumn ? parseFloat(row[avgColumn]) || 0 : 0;
        const ab = abColumn ? parseFloat(row[abColumn]) || 0 : 0;
        const pa = paColumn ? parseFloat(row[paColumn]) || 0 : 0;
        
        // Get raw stats for OBP calculation using named columns
        const hits = parseFloat(row['H']) || 0;  // H
        const walks = parseFloat(row['BB']) || 0; // BB
        const hbp = parseFloat(row['HBP']) || 0;   // HBP
        
        // Calculate OBP from raw stats (override CSV value)
        const obp = pa > 0 ? (hits + walks + hbp) / pa : 0;
        
        const slg = slgColumn ? parseFloat(row[slgColumn]) || 0 : 0;
        const ops = opsColumn ? parseFloat(row[opsColumn]) || 0 : (obp + slg);
        const sb = sbColumn ? parseFloat(row[sbColumn]) || 0 : 0;
        const cs = parseFloat(row['CS']) || 0;  // CS (Caught Stealing)
        const sb_percent = sbPercentColumn ? parseFloat(row[sbPercentColumn]) || 0 : 0;
        const bb_k = bbKColumn ? parseFloat(row[bbKColumn]) || 0 : 0;
        const contact_percent = contactPercentColumn ? parseFloat(row[contactPercentColumn]) || 0 : 0;
        const qab_percent = qabPercentColumn ? parseFloat(row[qabPercentColumn]) || 0 : 0;
        const ba_risp = baRispColumn ? parseFloat(row[baRispColumn]) || 0 : 0;
        const two_out_rbi = twoOutRbiColumn ? parseFloat(row[twoOutRbiColumn]) || 0 : 0;
        const xbh = xbhColumn ? parseFloat(row[xbhColumn]) || 0 : 0;
        const hr = hrColumn ? parseFloat(row[hrColumn]) || 0 : 0;
        const tb = tbColumn ? parseFloat(row[tbColumn]) || 0 : 0;
        const lob = lobColumn ? parseFloat(row[lobColumn]) || 0 : 0;
        
        // Calculate ab_risp with comprehensive multi-method estimation (GameChanger CSV doesn't have AB/RISP)
        const ab_risp = (() => {
          const totalAB = ab || 0;
          if (totalAB === 0) return 0;
          
          // Method 1: If we have BA/RISP, use it for most accurate estimation
          if (ba_risp > 0) {
            // Estimate hits with RISP from BA/RISP
            // In amateur baseball, RISP opportunities vary by batting order position and team context
            const estimatedRispHits = Math.round((totalAB * 0.35) * ba_risp);
            return Math.max(1, Math.round(estimatedRispHits / ba_risp));
          }
          
          // Method 2: Use LOB data (more runners = more RISP opportunities)
          if (lob > 0) {
            // LOB indicates how often this player was up with runners on base
            // Higher LOB = more RISP opportunities
            const lobFactor = Math.min(1.5, Math.max(0.5, lob / 10));
            return Math.max(1, Math.round(totalAB * 0.25 * lobFactor));
          }
          
          // Method 3: Use RBI data as proxy for RISP opportunities
          const rbiColumn = 'RBI'; // Column 15: RBI
          if (rbiColumn) {
            const rbi = parseFloat(row[rbiColumn]) || 0;
            if (rbi > 0) {
              // Players with more RBI likely had more RISP opportunities
              // Estimate: 1 RISP AB for every 2-3 RBI in amateur baseball
              const rbiFactor = Math.min(1.2, Math.max(0.8, rbi / 10));
              return Math.max(1, Math.round(totalAB * 0.28 * rbiFactor));
            }
          }
          
          // Method 4: Use batting order position (if available from name patterns)
          // Players higher in the order typically get more RISP opportunities
          const namePattern = displayName.toLowerCase();
          let orderFactor = 0.3; // Default for unknown position
          
          // Common leadoff indicators
          if (namePattern.includes('lead') || namePattern.includes('1st')) {
            orderFactor = 0.4; // Leadoff gets more opportunities
          }
          // Common cleanup indicators  
          else if (namePattern.includes('clean') || namePattern.includes('4th')) {
            orderFactor = 0.35; // Cleanup gets good opportunities
          }
          // Common 2-hole indicators
          else if (namePattern.includes('2nd') || namePattern.includes('table')) {
            orderFactor = 0.38; // 2-hole gets many opportunities
          }
          
          return Math.max(1, Math.round(totalAB * orderFactor));
        })();

        // Calculate rate-based stats
        const hr_rate = ab > 0 ? hr / ab : 0;
        const xbh_rate = ab > 0 ? xbh / ab : 0;
        const two_out_rbi_rate = ab_risp > 0 ? two_out_rbi / ab_risp : 0;

        return {
          id: generateId(),
          name: displayName,
          firstName: firstName,
          lastName: lastName,
          // Check for saved handedness, default to 'R' for CSV imports
          battingHand: getPlayerHandedness(displayName) || 'R',
          avg,
          obp,
          slg,
          ops,
          ab,
          pa,
          sb,
          cs,
          sb_percent,
          bb_k,
          contact_percent,
          qab_percent,
          ba_risp,
          two_out_rbi,
          xbh,
          hr,
          tb,
          ab_risp,
          // Rate-based stats
          hr_rate,
          xbh_rate,
          two_out_rbi_rate
        };
      });

    console.log('Imported players:', importedPlayers.length);
    
    // Add imported players to existing players
    const updatedPlayers = [...players, ...importedPlayers];
    onPlayersChange(updatedPlayers);
    
    // Save CSV file info
    onCSVImport({
      id: generateId(),
      filename,
      data: csvData,
      importedAt: new Date().toISOString(),
      playerCount: importedPlayers.length
    });

    setIsImporting(false);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        import('papaparse').then((Papa) => {
          Papa.default.parse(file, {
            header: false,
            complete: (result) => {
              // Skip first two rows (category headers and column names)
              const dataRows = result.data.slice(2);
              // Convert to objects with proper column names
              const processedData = dataRows.map((row: any) => ({
                'Number': row[0],
                'Last': row[1], 
                'First': row[2],
                'GP': row[3],
                'PA': row[4],
                'AB': row[5],
                'AVG': row[6],
                'OBP': row[7],
                'OPS': row[8],
                'SLG': row[9],
                'H': row[10],
                '1B': row[11],
                '2B': row[12],
                '3B': row[13],
                'HR': row[14],
                'RBI': row[15],
                'R': row[16],
                'BB': row[17],
                'SO': row[18],
                'K-L': row[19],
                'HBP': row[20],
                'SAC': row[21],
                'SF': row[22],
                'ROE': row[23],
                'FC': row[24],
                'SB': row[25],
                'SB%': row[26],
                'CS': row[27],
                'PIK': row[28],
                'QAB': row[29],
                'QAB%': row[30],
                'PA/BB': row[31],
                'BB/K': row[32],
                'C%': row[33],
                'HHB': row[34],
                'LD%': row[35],
                'FB%': row[36],
                'GB%': row[37],
                'BABIP': row[38],
                'BA/RISP': row[39],
                'LOB': row[40],
                '2OUTRBI': row[41],
                'XBH': row[42],
                'TB': row[43],
                'PS': row[44],
                'PS/PA': row[45],
                '2S+3': row[46],
                '2S+3%': row[47],
                '6': row[48],
                '6%': row[49],
                'AB/HR': row[50],
                'GIDP': row[51],
                'GITP': row[52],
                'CI': row[53]
              }));
              handleCSVImport(processedData, file.name);
            },
            error: (error) => {
              console.error('CSV parsing error:', error);
              setIsImporting(false);
            }
          });
        });
      }
    };
    input.click();
  };

  const addPlayer = (playerData: Omit<Player, 'id'>) => {
    // Check for saved handedness
    const savedHandedness = getPlayerHandedness(playerData.name);
    
    const newPlayer: Player = {
      id: generateId(),
      name: playerData.name || '',
      firstName: playerData.firstName || '',
      lastName: playerData.lastName || '',
      battingHand: savedHandedness || playerData.battingHand || 'R',
      avg: playerData.avg || 0,
      obp: playerData.obp || 0,
      slg: playerData.slg || 0,
      ops: playerData.ops || 0,
      ...playerData
    };
    onPlayersChange([...players, newPlayer]);
  };

  const updatePlayer = (id: string, playerData: Omit<Player, 'id'>) => {
    const updatedPlayers = players.map(player => 
      player.id === id ? { ...player, ...playerData } : player
    );
    onPlayersChange(updatedPlayers);
  };

  const deletePlayer = (id: string) => {
    const updatedPlayers = players.filter(player => player.id !== id);
    onPlayersChange(updatedPlayers);
  };

  const handleNameSubmit = () => {
    if (newPlayerName.trim()) {
      setNewPlayerName(newPlayerName.trim());
      closeAddPlayer();
      openStats();
    }
  };

  const handleStatsSubmit = (statsData: Partial<Player>) => {
    const playerData: Omit<Player, 'id'> = {
      name: newPlayerName,
      firstName: newPlayerName.split(' ')[0] || '',
      lastName: newPlayerName.split(' ').slice(1).join(' ') || '',
      avg: statsData.avg || 0,
      obp: statsData.obp || 0,
      slg: statsData.slg || 0,
      ops: statsData.ops || 0,
      ab: statsData.ab || 0,
      pa: statsData.pa || 0,
      sb: statsData.sb || 0,
      sb_percent: statsData.sb_percent || 0,
      bb_k: statsData.bb_k || 0,
      contact_percent: statsData.contact_percent || 0,
      qab_percent: statsData.qab_percent || 0,
      ba_risp: statsData.ba_risp || 0,
      two_out_rbi: statsData.two_out_rbi || 0,
      xbh: statsData.xbh || 0,
      hr: statsData.hr || 0,
      tb: statsData.tb || 0,
      ab_risp: statsData.ab_risp || 0,
      // Rate-based stats
      hr_rate: (statsData.ab || 0) > 0 ? (statsData.hr || 0) / (statsData.ab || 1) : 0,
      xbh_rate: (statsData.ab || 0) > 0 ? (statsData.xbh || 0) / (statsData.ab || 1) : 0,
      two_out_rbi_rate: (statsData.ab_risp || 0) > 0 ? (statsData.two_out_rbi || 0) / (statsData.ab_risp || 1) : 0,
      // Default batting hand to righty
      battingHand: 'R'
    };
    
    addPlayer(playerData);
    setNewPlayerName('');
    closeStats();
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper p="md" withBorder style={{
        background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%)',
        borderColor: 'rgba(255, 193, 7, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Stack gap="md">
          <Group justify="center">
            <Title 
              order={1}
              size="h1"
              style={{
                color: '#FFC107',
                textShadow: '0 0 15px rgba(255, 193, 7, 0.4)',
                letterSpacing: '0.5px',
              }}
            >
              Player Management
            </Title>
          </Group>
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              {players.length} players • {csvFiles.length} CSV files imported
            </Text>
            <Group>
            <Button
              leftSection={<IconUpload size={16} />}
              onClick={handleFileUpload}
              loading={isImporting}
              variant="light"
              color="blue"
              radius="xl"
              style={{
                background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
                color: '#000',
                border: 'none',
                boxShadow: '0 2px 10px rgba(255, 193, 7, 0.3)',
              }}
            >
              Import CSV
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openAddPlayer}
              radius="xl"
              style={{
                background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
                color: '#000',
                border: 'none',
                boxShadow: '0 2px 10px rgba(255, 193, 7, 0.3)',
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
              Add Player
            </Button>
            <Button
              leftSection={<IconTrash size={16} />}
              onClick={onClearAllPlayers}
              variant="light"
              color="red"
              disabled={players.length === 0}
              radius="xl"
            >
              Clear All Players
            </Button>
          </Group>
        </Group>
        </Stack>
      </Paper>

      {/* Players Grid */}
      {players.length === 0 ? (
        <Paper p="xl" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <IconChartBar size={48} color="var(--mantine-color-gray-4)" />
              <Text size="lg" c="dimmed">No players added yet</Text>
              <Text size="sm" c="dimmed">
                Import a CSV file or add players manually to get started
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Grid>
          {players
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((player) => (
            <Grid.Col key={player.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <PlayerCard
                player={player}
                onEdit={() => setEditingPlayer(player)}
                onDelete={() => deletePlayer(player.id)}
                players={players}
                onPlayersChange={onPlayersChange}
              />
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Add Player Name Modal */}
      <Modal
        opened={addPlayerOpened}
        onClose={closeAddPlayer}
        title="Add New Player"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Player Name"
            placeholder="Enter player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newPlayerName.trim()) {
                handleNameSubmit();
              }
            }}
            autoFocus
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={closeAddPlayer} radius="xl">
              Cancel
            </Button>
            <Button 
              onClick={handleNameSubmit}
              disabled={!newPlayerName.trim()}
              radius="xl"
              style={{
                background: newPlayerName.trim() 
                  ? 'linear-gradient(45deg, #FFC107, #FFD54F)'
                  : undefined,
                color: newPlayerName.trim() ? '#000' : undefined,
                fontWeight: 600,
                boxShadow: newPlayerName.trim() 
                  ? '0 2px 10px rgba(255, 193, 7, 0.3)' 
                  : undefined,
              }}
            >
              Next
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add Player Stats Modal */}
      <Modal
        opened={statsOpened}
        onClose={closeStats}
        title={`Add Stats for ${newPlayerName}`}
        size="lg"
        centered
      >
        <PlayerStatsForm
          playerName={newPlayerName}
          onSave={handleStatsSubmit}
          onCancel={() => {
            closeStats();
            setNewPlayerName('');
          }}
        />
      </Modal>

      {/* Edit Player Modal */}
      {editingPlayer && (
        <Modal
          opened={!!editingPlayer}
          onClose={() => setEditingPlayer(null)}
          title={`Edit ${editingPlayer.name}`}
          size="lg"
          centered
        >
          <PlayerForm
            player={editingPlayer}
            onSave={(data) => {
              updatePlayer(editingPlayer.id, data);
              setEditingPlayer(null);
            }}
            onCancel={() => setEditingPlayer(null)}
          />
        </Modal>
      )}
    </Stack>
  );
};

// Player Card Component
interface PlayerCardProps {
  player: Player;
  onEdit: () => void;
  onDelete: () => void;
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onEdit, onDelete, players, onPlayersChange }) => {
  const getConfidenceLevel = (pa: number) => {
    if (pa >= 15) return { level: 'High', color: 'green' };
    if (pa >= 8) return { level: 'Medium', color: 'yellow' };
    if (pa >= 4) return { level: 'Low', color: 'orange' };
    return { level: 'Excluded', color: 'red' };
  };

  const confidence = getConfidenceLevel(player.pa || 0);

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack gap="xs">
        {/* Name and buttons on same line */}
        <Group justify="space-between">
          <Text fw={500} size="lg">{player.name}</Text>
          <Group gap="xs">
            <Tooltip label="Edit player" position="top">
              <ActionIcon 
                color="blue" 
                variant="light" 
                onClick={onEdit}
                size="sm"
              >
                <IconEdit size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete player" position="top">
              <ActionIcon 
                color="red" 
                variant="light" 
                onClick={onDelete}
                size="sm"
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        {/* Bats section on next line */}
        <Group gap="xs">
          <Text size="xs" c="dimmed">Bats:</Text>
          <ActionIcon
            size="xs"
            variant={player.battingHand === 'L' ? 'filled' : 'light'}
            color={player.battingHand === 'L' ? 'red' : 'gray'}
            onClick={() => {
              const updatedPlayer = { ...player, battingHand: (player.battingHand === 'R' ? 'L' : 'R') as 'R' | 'L' };
              onPlayersChange(players.map(p => p.id === player.id ? updatedPlayer : p));
              // Save handedness for persistence
              savePlayerHandedness(player.name, updatedPlayer.battingHand);
            }}
          >
            L
          </ActionIcon>
          <ActionIcon
            size="xs"
            variant={player.battingHand === 'R' ? 'filled' : 'light'}
            color={player.battingHand === 'R' ? 'blue' : 'gray'}
            onClick={() => {
              const updatedPlayer = { ...player, battingHand: (player.battingHand === 'L' ? 'R' : 'L') as 'R' | 'L' };
              onPlayersChange(players.map(p => p.id === player.id ? updatedPlayer : p));
              // Save handedness for persistence
              savePlayerHandedness(player.name, updatedPlayer.battingHand);
            }}
          >
            R
          </ActionIcon>
        </Group>
      </Stack>
      
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">AVG</Text>
          <Text fw={500}>{player.avg.toFixed(3)}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">OBP</Text>
          <Text fw={500}>{player.obp.toFixed(3)}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">OPS</Text>
          <Text fw={500}>{player.ops.toFixed(3)}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">PA</Text>
          <Text fw={500}>{player.pa || 0}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Confidence</Text>
          <Badge color={confidence.color} size="sm">
            {confidence.level}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
};

// Player Form Component
interface PlayerFormProps {
  player?: Player | null;
  onSave: (playerData: Omit<Player, 'id'>) => void;
  onCancel: () => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({ player, onSave, onCancel }) => {
  const form = useForm({
    initialValues: {
      name: player?.name || '',
      firstName: player?.firstName || '',
      lastName: player?.lastName || '',
      avg: player?.avg || 0,
      obp: player?.obp || 0,
      slg: player?.slg || 0,
      ops: player?.ops || 0,
      ab: player?.ab || 0,
      pa: player?.pa || 0,
      sb: player?.sb || 0,
      sb_percent: player?.sb_percent || 0,
      bb_k: player?.bb_k || 0,
      contact_percent: player?.contact_percent || 0,
      qab_percent: player?.qab_percent || 0,
      ba_risp: player?.ba_risp || 0,
      two_out_rbi: player?.two_out_rbi || 0,
      xbh: player?.xbh || 0,
      hr: player?.hr || 0,
      tb: player?.tb || 0,
      ab_risp: player?.ab_risp || 0
    }
  });

  // Auto-calculate OPS when OBP and SLG change
  React.useEffect(() => {
    const obp = form.values.obp || 0;
    const slg = form.values.slg || 0;
    const calculatedOps = obp + slg;
    form.setFieldValue('ops', calculatedOps);
  }, [form.values.obp, form.values.slg, form]);

  const handleSubmit = (values: typeof form.values) => {
    // Calculate rate-based stats
    const hr_rate = (values.ab || 0) > 0 ? (values.hr || 0) / (values.ab || 1) : 0;
    const xbh_rate = (values.ab || 0) > 0 ? (values.xbh || 0) / (values.ab || 1) : 0;
    const two_out_rbi_rate = (values.ab_risp || 0) > 0 ? (values.two_out_rbi || 0) / (values.ab_risp || 1) : 0;
    
    onSave({
      ...values,
      hr_rate,
      xbh_rate,
      two_out_rbi_rate
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Divider label="Basic Information" />
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="First Name"
              {...form.getInputProps('firstName')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Last Name"
              {...form.getInputProps('lastName')}
            />
          </Grid.Col>
        </Grid>

        <Divider label="Batting Statistics" />
        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="AVG (Batting Average)"
              decimalScale={3}
              min={0}
              max={1}
              step={0.001}
              {...form.getInputProps('avg')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="OBP (On-Base %)"
              decimalScale={3}
              min={0}
              max={1}
              step={0.001}
              {...form.getInputProps('obp')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="SLG (Slugging %)"
              decimalScale={3}
              min={0}
              max={1}
              step={0.001}
              {...form.getInputProps('slg')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="OPS (On-Base + Slugging)"
              decimalScale={3}
              min={0}
              step={0.001}
              {...form.getInputProps('ops')}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="PA (Plate Appearances)"
              min={0}
              {...form.getInputProps('pa')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="SB (Stolen Bases)"
              min={0}
              {...form.getInputProps('sb')}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={onCancel} radius="xl">
            Cancel
          </Button>
          <Button 
            type="submit"
            style={{
              background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
              color: '#000',
              border: 'none',
              boxShadow: '0 2px 10px rgba(255, 193, 7, 0.3)',
            }}
          >
            Save Player
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

// Player Stats Form Component
interface PlayerStatsFormProps {
  playerName: string;
  onSave: (statsData: Partial<Player>) => void;
  onCancel: () => void;
}

const PlayerStatsForm: React.FC<PlayerStatsFormProps> = ({ playerName, onSave, onCancel }) => {
  const form = useForm({
    initialValues: {
      avg: 0,
      obp: 0,
      slg: 0,
      ops: 0,
      pa: 0,
      sb: 0,
      sb_percent: 0,
      bb_k: 0,
      contact_percent: 0,
      qab_percent: 0,
      ba_risp: 0,
      two_out_rbi: 0,
      xbh: 0,
      hr: 0,
      tb: 0,
      ab_risp: 0
    }
  });

  // Auto-calculate OPS when OBP and SLG change
  React.useEffect(() => {
    const obp = form.values.obp || 0;
    const slg = form.values.slg || 0;
    const calculatedOps = obp + slg;
    form.setFieldValue('ops', calculatedOps);
  }, [form.values.obp, form.values.slg, form]);

  const handleSubmit = (values: typeof form.values) => {
    onSave(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Alert icon={<IconCheck size={16} />} color="blue">
          You can add baseball statistics now or leave them blank and add them later.
        </Alert>

        <Divider label="Basic Statistics" />
        <Grid>
          <Grid.Col span={6}>
            <NumberInput
              label="AVG (Batting Average)"
              decimalScale={3}
              min={0}
              max={1}
              step={0.001}
              {...form.getInputProps('avg')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="OBP (On-Base %)"
              decimalScale={3}
              min={0}
              max={1}
              step={0.001}
              {...form.getInputProps('obp')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="SLG (Slugging %)"
              decimalScale={3}
              min={0}
              max={1}
              step={0.001}
              {...form.getInputProps('slg')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="OPS (On-Base + Slugging)"
              decimalScale={3}
              min={0}
              step={0.001}
              {...form.getInputProps('ops')}
              readOnly
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="PA (Plate Appearances)"
              min={0}
              {...form.getInputProps('pa')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="SB (Stolen Bases)"
              min={0}
              {...form.getInputProps('sb')}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={onCancel} radius="xl">
            Cancel
          </Button>
          <Button variant="light" onClick={() => onSave({})}>
            Skip Stats
          </Button>
          <Button 
            type="submit"
            style={{
              background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
              color: '#000',
              border: 'none',
              boxShadow: '0 2px 10px rgba(255, 193, 7, 0.3)',
            }}
          >
            Add Player
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
