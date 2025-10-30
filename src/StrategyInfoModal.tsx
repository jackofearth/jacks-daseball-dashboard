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
      title={<Title order={2} component="div">Strategy Comparison</Title>}
      centered
      size="md"
      styles={{ content: { border: '1px solid color-mix(in srgb, var(--theme-primary) 40%, transparent)' } }}
    >
      <Stack gap="lg">
        <Paper p="md" withBorder>
          <Group gap="md" mb="sm">
            <Image
              src="/mlblogo.png"
              alt="MLB Logo"
              w={72}
              h={54}
              fit="contain"
            />
            <Title order={4} c="blue">
              Modern Baseball Consensus
            </Title>
          </Group>
          <Text size="sm" c="dimmed">
            A straightforward approach focused on your best hitters. Easy to understand and explain to players & parents.
          </Text>
        </Paper>

        <Paper p="md" withBorder>
          <Group gap="md" mb="sm">
            <Image
              src={process.env.PUBLIC_URL + '/situational.png'}
              alt="Situational Strategy Logo"
              w={72}
              h={54}
              fit="contain"
              onError={(e) => { (e.currentTarget as any).src = '/situational.png'; }}
            />
            <Title order={4} c="green">
              Situational Analytics
            </Title>
          </Group>
          <Text size="sm" c="dimmed">
            Maximizes situational play using a finely-tuned balance of advanced metrics. Designed specifically for lower-level and youth teams to get the most out of every situation.
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
