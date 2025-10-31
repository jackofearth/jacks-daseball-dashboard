import React, { useEffect, useState } from 'react';
import { Modal, TextInput, Button, Group, Stack, Paper, FileInput, Image, Center, Box, ColorInput, Title, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconUpload } from '@tabler/icons-react';
import StorageService, { TeamInfo, TeamData } from '../StorageService';
import { processLogoFileToPngWithAlpha } from '../utils/ImageProcessing';

interface HeroTeamCustomizerProps {
  isOpen: boolean;
  teamInfo: TeamInfo;
  onReady: (updated: TeamInfo) => void;
  onLater: () => void;
}

export const HeroTeamCustomizer: React.FC<HeroTeamCustomizerProps> = ({ isOpen, teamInfo, onReady, onLater }) => {
  const isMobile = useMediaQuery('(max-width: 767px)') ?? false;
  const [teamName, setTeamName] = useState(teamInfo.name || '');
  const [pdfHeaderColor, setPdfHeaderColor] = useState(teamInfo.pdfHeaderColor || '#FFC107');
  const [logoPreview, setLogoPreview] = useState<string | null>(teamInfo.logo || null);

  useEffect(() => {
    setTeamName(teamInfo.name || '');
    setPdfHeaderColor(teamInfo.pdfHeaderColor || '#FFC107');
    setLogoPreview(teamInfo.logo || null);
  }, [teamInfo, isOpen]);

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const processed = await processLogoFileToPngWithAlpha(file);
      setLogoPreview(processed);
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleReady = () => {
    const updated: TeamInfo = {
      ...teamInfo,
      name: teamName.trim(),
      logo: logoPreview || undefined,
      pdfHeaderColor,
      hasBeenCustomized: true,
    };
    // Immediate persist
    try {
      const existing: TeamData | null = StorageService.loadTeamData();
      const merged: TeamData = existing ? { ...existing, teamInfo: updated, lastUpdated: new Date().toISOString() } : { ...StorageService.getDefaultTeamData(), teamInfo: updated, lastUpdated: new Date().toISOString() };
      StorageService.saveTeamData(merged);
      localStorage.setItem('hasVisitedBefore', 'true');
    } catch {}
    onReady(updated);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onLater}
      title={<Title order={2} component="div">Customise my team?</Title>}
      size="md"
      centered={!isMobile}
      fullScreen={isMobile}
      styles={{ 
        content: { border: 'none' },
        header: {
          padding: isMobile ? 'md' : undefined,
        },
        body: {
          padding: isMobile ? 'md' : undefined,
        },
      }}
      withCloseButton={false}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">Set your team name, color, and logo to personalise your lineup card.</Text>

        <TextInput
          label="Team Name"
          placeholder="Enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.currentTarget.value)}
          required
        />

        <Box>
          <Text size="sm" fw={500} mb="xs">Main Team Colour</Text>
          <ColorInput
            value={pdfHeaderColor}
            onChange={setPdfHeaderColor}
            withEyeDropper={false}
            format="hex"
            swatches={[
              '#FFC107', // Golden Yellow
              '#0033A0', // Royal/Dodger Blue
              '#0C2340', // Navy
              '#C8102E', // Cardinal Red
              '#FA4616', // Giants Orange
              '#134A8E', // Cubs Blue
              '#006847', // Athletics Green
              '#E31837', // Bright Red
              '#FDB827', // Athletic Gold
              '#241F20', // Black
              '#8A2BE2', // Bold Purple
              '#00A3E0'  // Bright Teal/Cyan
            ]}
          />
        </Box>

        <Box>
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" fw={500}>Team Logo</Text>
            {logoPreview && (
              <Button size="xs" variant="light" color="red" onClick={() => setLogoPreview(null)}>
                Remove Logo
              </Button>
            )}
          </Group>
          <FileInput
            placeholder="Upload team logo"
            leftSection={<IconUpload size={16} />}
            accept="image/*"
            onChange={handleLogoUpload}
          />
          {logoPreview && (
            <Paper p="md" mt="md" withBorder>
              <Text size="sm" fw={500} mb="sm">Logo Preview:</Text>
              <Center>
                <Image src={logoPreview} alt="Team logo preview" w={100} h={100} fit="contain" />
              </Center>
            </Paper>
          )}
        </Box>

        <Group justify="flex-end">
          <Button onClick={handleReady} style={{
            background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
            color: '#000',
            fontWeight: 600,
          }}>Ready!</Button>
        </Group>
      </Stack>
    </Modal>
  );
};


