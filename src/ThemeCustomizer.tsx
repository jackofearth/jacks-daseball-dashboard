import React, { useState, useEffect } from 'react';
import {
  Modal,
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Paper,
  ColorSwatch,
  Grid,
  FileInput,
  Image,
  Center,
  Box
} from '@mantine/core';
import { IconUpload, IconPalette } from '@tabler/icons-react';
import { TeamInfo, ThemeSettings } from './StorageService';

interface ThemeCustomizerProps {
  teamInfo: TeamInfo;
  themeSettings: ThemeSettings;
  onTeamInfoChange: (teamInfo: TeamInfo) => void;
  onThemeChange: (theme: ThemeSettings) => void;
  onClose: () => void;
  isOpen: boolean;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  teamInfo,
  themeSettings,
  onTeamInfoChange,
  onThemeChange,
  onClose,
  isOpen
}) => {
  const [formData, setFormData] = useState({
    teamName: teamInfo.name || '',
    location: teamInfo.location || ''
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(teamInfo.logo || null);
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>('blue');
  const [customColors, setCustomColors] = useState({
    primary: '#007bff',
    secondary: '#6c757d'
  });

  // Predefined color schemes
  const colorSchemes = {
    blue: { primary: '#007bff', secondary: '#6c757d', accent: '#28a745' },
    red: { primary: '#dc3545', secondary: '#6c757d', accent: '#b8860b' }, // Dark goldenrod instead of bright yellow
    green: { primary: '#28a745', secondary: '#6c757d', accent: '#17a2b8' },
    purple: { primary: '#6f42c1', secondary: '#6c757d', accent: '#fd7e14' }
  };

  // Update form data when teamInfo changes
  useEffect(() => {
    setFormData({
      teamName: teamInfo.name || '',
      location: teamInfo.location || ''
    });
    setLogoPreview(teamInfo.logo || null);
  }, [teamInfo]);

  // Update color scheme when themeSettings changes
  useEffect(() => {
    if (themeSettings?.colors) {
      const colors = themeSettings.colors;
      // Check if colors match any predefined scheme
      const matchingScheme = Object.keys(colorSchemes).find(scheme => {
        const schemeColors = colorSchemes[scheme as keyof typeof colorSchemes];
        return schemeColors.primary === colors.primary && 
               schemeColors.secondary === colors.secondary && 
               schemeColors.accent === colors.accent;
      });
      
      if (matchingScheme) {
        setSelectedColorScheme(matchingScheme);
      } else {
        setSelectedColorScheme('custom');
        setCustomColors({
          primary: colors.primary,
          secondary: colors.secondary
        });
      }
    }
  }, [themeSettings]);

  // Basic colors for custom selection
  const basicColors = [
    '#000000', '#ffffff', '#007bff', '#dc3545', '#28a745', '#b8860b', // Dark goldenrod instead of bright yellow
    '#17a2b8', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c', '#343a40', 
    '#6c757d', '#721c24'
  ];

  // Color name mapping
  const getColorName = (hex: string): string => {
    const colorNames: { [key: string]: string } = {
      '#000000': 'Black',
      '#ffffff': 'White',
      '#007bff': 'Blue',
      '#dc3545': 'Red',
      '#28a745': 'Green',
      '#b8860b': 'Yellow',
      '#17a2b8': 'Teal',
      '#6f42c1': 'Purple',
      '#fd7e14': 'Orange',
      '#20c997': 'Teal',
      '#e83e8c': 'Pink',
      '#343a40': 'Navy',
      '#6c757d': 'Gray',
      '#721c24': 'Maroon'
    };
    return colorNames[hex] || hex;
  };

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

  const handleCustomColorChange = (colorType: 'primary' | 'secondary', color: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorType]: color
    }));
    setSelectedColorScheme('custom');
  };

  const handleSave = () => {
    const colors = selectedColorScheme === 'custom' 
      ? { ...customColors, accent: '#28a745' }
      : colorSchemes[selectedColorScheme as keyof typeof colorSchemes];
    
    const updatedTeamInfo: TeamInfo = {
      ...teamInfo,
      name: formData.teamName,
      location: formData.location,
      logo: logoPreview || undefined,
      logoType: logoPreview ? 'uploaded' : 'none',
      colors: colors
    };

    const updatedTheme: ThemeSettings = {
      colors: colors
    };

    onTeamInfoChange(updatedTeamInfo);
    onThemeChange(updatedTheme);
    onClose();
  };

  const handleReset = () => {
    // Reset to default values
    setFormData({
      teamName: '',
      location: ''
    });
    setLogoPreview(null);
    setSelectedColorScheme('blue');
    setCustomColors({
      primary: '#007bff',
      secondary: '#6c757d'
    });
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconPalette size={20} />
          <Text fw={600}>Customize Theme</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="xl">

        {/* Team Information */}
        <Paper p="md" withBorder>
          <Title order={3} mb="md">Team Information</Title>
          <Stack gap="md">
            <TextInput
              label="Team Name"
              placeholder="Enter team name"
              value={formData.teamName}
              onChange={(e) => handleInputChange('teamName', e.target.value)}
            />
            <TextInput
              label="Location"
              placeholder="Enter city/state"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </Stack>
        </Paper>

        {/* Logo Section */}
        <Paper p="md" withBorder>
          <Title order={3} mb="md">Team Logo</Title>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Upload your team logo (PNG, JPG, or SVG recommended).
            </Text>
            
            <FileInput
              label="Upload Logo"
              placeholder="Choose file"
              accept="image/*"
              onChange={handleLogoUpload}
              leftSection={<IconUpload size={16} />}
            />

            <Box>
              <Text fw={500} mb="sm">Logo Preview:</Text>
              <Center>
                {logoPreview ? (
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    w={200}
                    h={200}
                    fit="contain"
                    style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: '4px' }}
                  />
                ) : (
                  <Center
                    w={200}
                    h={200}
                    style={{ 
                      border: '1px solid var(--mantine-color-gray-3)', 
                      borderRadius: '4px',
                      background: 'var(--mantine-color-gray-1)'
                    }}
                  >
                    <Text size="4xl">⚾</Text>
                  </Center>
                )}
              </Center>
            </Box>
          </Stack>
        </Paper>

        {/* Color Scheme Selection */}
        <Paper p="md" withBorder>
          <Title order={3} mb="md">Color Scheme</Title>
          <Text size="sm" c="dimmed" mb="lg">
            Choose a predefined scheme or create your own.
          </Text>
          
          {/* Predefined Schemes */}
          <Box mb="xl">
            <Title order={4} mb="md">Predefined Schemes</Title>
            <Grid>
              {Object.entries(colorSchemes).map(([key, colors]) => (
                <Grid.Col key={key} span={6}>
                  <Paper
                    p="md"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      border: selectedColorScheme === key ? '3px solid var(--mantine-color-blue-6)' : '2px solid var(--mantine-color-gray-3)',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setSelectedColorScheme(key)}
                  >
                    <Group justify="center" mb="sm">
                      <ColorSwatch color={colors.primary} size={20} />
                      <ColorSwatch color={colors.secondary} size={20} />
                      <ColorSwatch color={colors.accent} size={20} />
                    </Group>
                    <Text 
                      size="sm" 
                      fw={500} 
                      ta="center" 
                      tt="capitalize"
                      c={selectedColorScheme === key ? 'blue' : 'dimmed'}
                    >
                      {key}
                    </Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Box>

          {/* Custom Colors */}
          <Box>
            <Title order={4} mb="md">Custom Colors</Title>
            <Paper
              p="md"
              withBorder
              style={{
                border: selectedColorScheme === 'custom' ? '3px solid var(--mantine-color-blue-6)' : '2px solid var(--mantine-color-gray-3)'
              }}
            >
              <Grid>
                <Grid.Col span={6}>
                  <Text fw={500} mb="sm">
                    Primary Color: <Text component="span" c={customColors.primary}>({getColorName(customColors.primary)})</Text>
                  </Text>
                  <Group gap="xs" wrap="wrap">
                    {basicColors.map(color => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        size={24}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCustomColorChange('primary', color)}
                      />
                    ))}
                  </Group>
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Text fw={500} mb="sm">
                    Secondary Color: <Text component="span" c={customColors.secondary}>({getColorName(customColors.secondary)})</Text>
                  </Text>
                  <Group gap="xs" wrap="wrap">
                    {basicColors.map(color => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        size={24}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCustomColorChange('secondary', color)}
                      />
                    ))}
                  </Group>
                </Grid.Col>
              </Grid>
            </Paper>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Group justify="space-between">
          <Button
            variant="outline"
            color="red"
            onClick={handleReset}
          >
            Reset Customization
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

export default ThemeCustomizer;