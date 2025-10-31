import React from 'react';
import { Modal, Stack, Group, Badge, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconBolt, IconAlertTriangle, IconX } from '@tabler/icons-react';

interface ConfidenceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConfidenceInfoModal: React.FC<ConfidenceInfoModalProps> = ({ isOpen, onClose }) => {
  const isMobile = useMediaQuery('(max-width: 767px)') ?? false;
  
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={<Title order={2} component="div">Confidence System</Title>}
      centered={!isMobile}
      fullScreen={isMobile}
      size="md"
      styles={{ 
        content: { 
          border: '1px solid color-mix(in srgb, var(--theme-primary) 40%, transparent)',
        },
        header: {
          padding: isMobile ? 'md' : undefined,
        },
        body: {
          padding: isMobile ? 'md' : undefined,
        },
      }}
    >
      <Stack gap="lg">
        <Text size="md">
          You might have noticed the symbols next to some players' names. This is our confidence system, and here's why it matters:
        </Text>

        <Text size="sm" c="dimmed">
          A player who goes 2-for-3 in one game looks like a .667 hitter, but that doesn't mean they're better than your .350 hitter who's played 20 games. Small sample sizes can be misleading.
        </Text>

        <Text size="sm" c="dimmed">
          With this system in place, your experienced players don't get unfairly bumped down the order by someone who just had one or two lucky at-bats.
        </Text>

        <Text fw={500} size="md">Here's what the symbols mean:</Text>

        <Stack gap="sm">
          <Group>
            <Badge size="lg" variant="light" color="green">High Confidence</Badge>
            <Text size="sm" c="dimmed">(15+ plate appearances): We trust these stats - they've played enough for the numbers to be reliable</Text>
          </Group>
          <Group>
            <Badge size="lg" variant="light" color="yellow" leftSection={<IconBolt size={12} />}>Medium Confidence</Badge>
            <Text size="sm" c="dimmed">(8-14 plate appearances): Pretty good idea of their ability, but we apply a 15% penalty to account for the smaller sample size</Text>
          </Group>
          <Group>
            <Badge size="lg" variant="light" color="orange" leftSection={<IconAlertTriangle size={12} />}>Low Confidence</Badge>
            <Text size="sm" c="dimmed">(4-7 plate appearances): Take these stats with a grain of salt - we apply a 30% penalty because the numbers might not reflect their true ability yet</Text>
          </Group>
          <Group>
            <Badge size="lg" variant="light" color="red" leftSection={<IconX size={12} />}>Excluded</Badge>
            <Text size="sm" c="dimmed">(Under 4 plate appearances): Not enough data to make any reliable assessment - these players are filtered out of the batting order by default, but can be manually added back</Text>
          </Group>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default ConfidenceInfoModal;
