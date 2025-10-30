import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Paper,
  FileInput,
  Image,
  Center,
  Box,
  ColorInput,
  Title
} from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import StorageService, { TeamInfo, TeamData } from './StorageService';
import { getLocalizedText, detectUserLocation, getLocalizationSettings } from './utils/LocalizationUtils';
import { processLogoFileToPngWithAlpha } from './utils/ImageProcessing';

interface TeamCustomizerProps {
  teamInfo: TeamInfo;
  onTeamInfoChange: (teamInfo: TeamInfo) => void;
  onClose: () => void;
  isOpen: boolean;
}

const TeamCustomizer: React.FC<TeamCustomizerProps> = ({
  teamInfo,
  onTeamInfoChange,
  onClose,
  isOpen
}) => {
  const [formData, setFormData] = useState({
    teamName: teamInfo.name || '',
    pdfHeaderColor: teamInfo.pdfHeaderColor || '#FFC107'
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(teamInfo.logo || null);
  const [localizationSettings, setLocalizationSettings] = useState<{ spelling: 'us' | 'uk' | 'au' | 'ca' }>({ spelling: 'us' });
  const [isDragging, setIsDragging] = useState(false);

  // Detect user location and set localization
  useEffect(() => {
    const detectLocation = async () => {
      const location = await detectUserLocation();
      const settings = getLocalizationSettings(location);
      setLocalizationSettings(settings);
    };
    detectLocation();
  }, []);

  // Update form data when teamInfo changes
  useEffect(() => {
    setFormData({
      teamName: teamInfo.name || '',
      pdfHeaderColor: teamInfo.pdfHeaderColor || '#FFC107'
    });
    setLogoPreview(teamInfo.logo || null);
  }, [teamInfo]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    try {
      const processed = await processLogoFileToPngWithAlpha(file);
      setLogoPreview(processed);
    } catch {
      // Fallback to raw
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleLogoUpload(files[0]);
    }
  };

  const handleSave = () => {
    const updatedTeamInfo: TeamInfo = {
      ...teamInfo,
      name: formData.teamName.trim() || '',
      logo: logoPreview ?? undefined,
      pdfHeaderColor: formData.pdfHeaderColor,
      hasBeenCustomized: true
    };
    
    onTeamInfoChange(updatedTeamInfo);
    // Immediate persist to avoid loss on refresh
    try {
      const existing: TeamData | null = StorageService.loadTeamData();
      const merged: TeamData = existing ? {
        ...existing,
        teamInfo: updatedTeamInfo,
        lastUpdated: new Date().toISOString()
      } : {
        ...StorageService.getDefaultTeamData(),
        teamInfo: updatedTeamInfo,
        lastUpdated: new Date().toISOString()
      };
      StorageService.saveTeamData(merged);
    } catch {}
    onClose();
  };

  const handleReset = () => {
    setFormData({
      teamName: '',
      pdfHeaderColor: '#FFC107'
    });
    setLogoPreview(null);
    
    // Reset the team info to remove logo
    const resetTeamInfo: TeamInfo = {
      ...teamInfo,
      name: '',
      logo: undefined,
      pdfHeaderColor: '#FFC107',
      hasBeenCustomized: false
    };
    onTeamInfoChange(resetTeamInfo);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={<Title order={2} component="div">Customise my team</Title>}
      size="md"
      centered
      styles={{ content: { border: '1px solid color-mix(in srgb, var(--theme-primary) 40%, transparent)' } }}
    >
      <Stack gap="md">
        {/* Team Name */}
        <TextInput
          label="Team Name"
          placeholder="Enter team name"
          value={formData.teamName}
          onChange={(event) => handleInputChange('teamName', event.currentTarget.value)}
          required
        />

        {/* Main Team Colour (move before logo) */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            {getLocalizedText('mainTeamColor', localizationSettings.spelling)}
          </Text>
          <ColorInput
            placeholder={getLocalizedText('selectColor', localizationSettings.spelling)}
            value={formData.pdfHeaderColor}
            onChange={(value) => handleInputChange('pdfHeaderColor', value)}
            withEyeDropper={false}
            format="hex"
            swatches={[
              '#FFC107', // Default yellow
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

        {/* Logo Upload (click or drag) */}
        <Box>
          <Group justify="space-between" align="center" mb="xs">
            <Text size="sm" fw={500}>Team Logo (click or drag image)</Text>
            {logoPreview && (
              <Button size="xs" variant="light" color="red" onClick={() => { setLogoPreview(null); onTeamInfoChange({ ...teamInfo, logo: undefined }); }}>
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

          <Paper
            p="lg"
            mt="sm"
            withBorder
            style={{
              borderStyle: 'dashed',
              borderColor: isDragging ? 'rgba(255,193,7,0.8)' : 'rgba(255,255,255,0.25)',
              background: isDragging ? 'rgba(255,193,7,0.08)' : 'transparent',
              textAlign: 'center',
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Text size="sm" c="dimmed">Drag & drop your logo here</Text>
          </Paper>
          
          {logoPreview && (
            <Paper p="md" mt="md" withBorder>
              <Text size="sm" fw={500} mb="sm">Logo Preview:</Text>
              <Center>
                <Image
                  src={logoPreview}
                  alt="Team logo preview"
                  w={100}
                  h={100}
                  fit="contain"
                  style={{
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    padding: '8px'
                  }}
                />
              </Center>
            </Paper>
          )}
        </Box>

        {/* Action Buttons */}
        <Group justify="space-between">
          <Button
            variant="outline"
            color="red"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Group>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default TeamCustomizer;
