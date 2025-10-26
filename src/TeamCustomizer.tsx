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
  ColorInput
} from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { TeamInfo } from './StorageService';
import { getLocalizedText, detectUserLocation, getLocalizationSettings } from './utils/LocalizationUtils';

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

  const handleLogoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedTeamInfo: TeamInfo = {
      ...teamInfo,
      name: formData.teamName.trim() || '',
      logo: logoPreview || teamInfo.logo,
      pdfHeaderColor: formData.pdfHeaderColor,
      hasBeenCustomized: true
    };
    
    onTeamInfoChange(updatedTeamInfo);
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
      title={getLocalizedText('customizeTeam', localizationSettings.spelling)}
      size="md"
      centered
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

        {/* Logo Upload */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Team Logo
          </Text>
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

        {/* PDF Header Color */}
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
              '#8A7A8A', // Desaturated purple
              '#7A6B7A', // Desaturated purple 2
              '#6B5C6B', // Desaturated purple 3
              '#5C4D5C', // Desaturated purple 4
              '#6B7A8A', // Desaturated blue
              '#5C6B7A', // Desaturated blue 2
              '#4D5C6B', // Desaturated blue 3
              '#7A8A7A', // Desaturated green
              '#6B7A6B', // Desaturated green 2
              '#5C6B5C', // Desaturated green 3
              '#8A7A6B', // Desaturated yellow
              '#7A6B5C', // Desaturated yellow 2
              '#8A6B6B', // Desaturated orange
              '#7A5C5C', // Desaturated orange 2
              '#7A6B8A', // Desaturated pink
              '#6B5C7A', // Desaturated pink 2
            ]}
          />
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
