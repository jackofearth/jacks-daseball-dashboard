import React, { useState } from 'react';
import { Modal, TextInput, Switch, Group, Button, Stack, Text, Paper } from '@mantine/core';

interface PDFCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: PDFExportOptions) => void;
  teamName: string;
}

export interface PDFExportOptions {
  coachName: string;
  opponent: string;
  date: string;
  showFieldingPositions: boolean;
}

const PDFCustomizationModal: React.FC<PDFCustomizationModalProps> = ({
  isOpen,
  onClose,
  onExport,
  teamName
}) => {
  const [coachName, setCoachName] = useState('');
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString());
  const [showFieldingPositions, setShowFieldingPositions] = useState(true);

  const handleExport = () => {
    onExport({
      coachName,
      opponent,
      date,
      showFieldingPositions
    });
  };

  const handleCancel = () => {
    // Reset to defaults
    setCoachName('');
    setOpponent('');
    setDate(new Date().toLocaleDateString());
    setShowFieldingPositions(true);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleCancel}
      title="Customize PDF Export"
      centered
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="Coach Name"
          placeholder="Enter coach name"
          value={coachName}
          onChange={(e) => setCoachName(e.target.value)}
        />

        <TextInput
          label="Opponent"
          placeholder="Enter opponent team name"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
        />

        <TextInput
          label="Game Date"
          placeholder="MM/DD/YYYY"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Paper p="md" withBorder>
          <Group justify="space-between">
            <div>
              <Text fw={500} size="sm">
                Show Fielding Positions
              </Text>
              <Text size="xs" c="dimmed">
                Include the baseball diamond with player positions
              </Text>
            </div>
            <Switch
              checked={showFieldingPositions}
              onChange={(e) => setShowFieldingPositions(e.currentTarget.checked)}
            />
          </Group>
        </Paper>

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="light" onClick={handleCancel} radius="xl">
            Cancel
          </Button>
          <Button onClick={handleExport} radius="xl">
            Preview
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default PDFCustomizationModal;
