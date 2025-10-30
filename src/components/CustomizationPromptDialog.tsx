import React from 'react';
import {
  Modal,
  Text,
  Button,
  Group,
  Stack,
  Paper,
  ThemeIcon,
  Title
} from '@mantine/core';
import { IconPalette, IconUsers, IconPhoto } from '@tabler/icons-react';
import { getLocalizedText } from '../utils/LocalizationUtils';

interface CustomizationPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomize: () => void;
  onSkip: () => void;
  localizationSettings: {
    spelling: 'us' | 'uk' | 'au' | 'ca';
  };
}

export const CustomizationPromptDialog: React.FC<CustomizationPromptDialogProps> = ({
  isOpen,
  onClose,
  onCustomize,
  onSkip,
  localizationSettings
}) => {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={<Title order={2}>{`${getLocalizedText('customize', localizationSettings.spelling)} Your Team?`}</Title>}
      size="md"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {getLocalizedText('customizeYourTeam', localizationSettings.spelling)}
        </Text>

        {/* Feature highlights */}
        <Paper p="md" withBorder style={{
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%)',
          borderColor: 'rgba(255, 193, 7, 0.15)',
        }}>
          <Stack gap="sm">
            <Group gap="sm">
              <ThemeIcon size="sm" color="blue" variant="light">
                <IconUsers size={16} />
              </ThemeIcon>
              <Text size="sm" fw={500}>Team Name & Location</Text>
            </Group>
            
            <Group gap="sm">
              <ThemeIcon size="sm" color="purple" variant="light">
                <IconPalette size={16} />
              </ThemeIcon>
              <Text size="sm" fw={500}>Custom {getLocalizedText('color', localizationSettings.spelling)}</Text>
            </Group>
            
            <Group gap="sm">
              <ThemeIcon size="sm" color="green" variant="light">
                <IconPhoto size={16} />
              </ThemeIcon>
              <Text size="sm" fw={500}>Team Logo</Text>
            </Group>
          </Stack>
        </Paper>

        <Text size="xs" c="dimmed" ta="center">
          You can always customize later from the team settings menu.
        </Text>

        {/* Action Buttons */}
        <Group justify="space-between">
          <Button
            variant="outline"
            onClick={onSkip}
          >
            Skip for Now
          </Button>
          <Button
            onClick={onCustomize}
            style={{
              background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
              color: '#000',
              fontWeight: 600,
            }}
          >
            {getLocalizedText('customize', localizationSettings.spelling)}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
