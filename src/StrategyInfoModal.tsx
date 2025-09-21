import React from 'react';
import { Modal, Text, Group, Button, Stack, Paper, Image, Title, Divider } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';

interface StrategyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToHelp: () => void;
}

const StrategyInfoModal: React.FC<StrategyInfoModalProps> = ({ isOpen, onClose, onNavigateToHelp }) => {
  const handleHelpClick = () => {
    onNavigateToHelp();
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Strategy Comparison"
      centered
      size="md"
    >
      <Stack gap="lg">
        <Paper p="md" withBorder>
          <Group gap="md" mb="sm">
            <Image
              src="/mlblogo.png"
              alt="MLB Logo"
              w={60}
              h={45}
              fit="contain"
            />
            <Title order={4} c="blue">
              Modern Baseball Consensus Strategy
            </Title>
          </Group>
          <Text size="sm" c="dimmed">
            Data-driven approach based on modern analytical consensus and current baseball optimization strategies
          </Text>
        </Paper>

        <Paper p="md" withBorder>
          <Group gap="md" mb="sm">
            <Image
              src="/situational2.jpg"
              alt="Situational Strategy Logo"
              w={60}
              h={45}
              fit="contain"
            />
            <Title order={4} c="green">
              Situational Analytics Strategy
            </Title>
          </Group>
          <Text size="sm" c="dimmed">
            Advanced metrics for situational play and game theory
          </Text>
        </Paper>

        <Divider />

        <Group justify="center">
          <Button
            variant="subtle"
            rightSection={<IconExternalLink size={16} />}
            onClick={handleHelpClick}
          >
            More info
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default StrategyInfoModal;
