import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Group, Button, Stack, Paper, TextInput, Divider, Title, Image, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconPrinter, IconFileDownload, IconArrowLeft, IconEdit } from '@tabler/icons-react';
import { Player, TeamInfo } from './StorageService';
import { generateLineupCanvas } from './utils/CanvasGenerator';
import { generateLineupPDF, downloadPDF } from './utils/PDFGenerator';

interface CanvasPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  battingOrder: Player[];
  benchPlayers: Player[];
  teamInfo: TeamInfo;
}

const CanvasPreviewModal: React.FC<CanvasPreviewModalProps> = ({
  isOpen,
  onClose,
  onBack,
  battingOrder,
  benchPlayers,
  teamInfo
}) => {
  const isMobile = useMediaQuery('(max-width: 767px)') ?? false;
  const [customTeamName, setCustomTeamName] = useState(teamInfo.name);
  const [customCityName, setCustomCityName] = useState(teamInfo.location || '');
  const [gameDate, setGameDate] = useState(new Date().toLocaleDateString());
  const [canvasPreview, setCanvasPreview] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePreview = useCallback(async () => {
    setIsGenerating(true);
    try {
      console.log('Generating canvas preview...');
      const canvasDataURL = await generateLineupCanvas({
        teamInfo: { ...teamInfo, name: customTeamName, location: customCityName },
        battingOrder,
        benchPlayers,
        gameDate,
      });
      
      console.log('Canvas preview generated:', canvasDataURL.substring(0, 100) + '...');
      setCanvasPreview(canvasDataURL);
    } catch (error) {
      console.error('Error generating canvas preview:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [teamInfo, customTeamName, customCityName, battingOrder, benchPlayers, gameDate]);

  // Generate canvas preview when modal opens or data changes
  useEffect(() => {
    if (isOpen && battingOrder.length > 0) {
      generatePreview();
    }
  }, [isOpen, battingOrder, customTeamName, customCityName, gameDate, generatePreview]);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      console.log('Generating PDF from canvas...');
      const pdfBytes = await generateLineupPDF({
        teamInfo: { ...teamInfo, name: customTeamName, location: customCityName },
        battingOrder,
        benchPlayers,
        gameDate,
      });

      const filename = `${customTeamName.replace(/[^a-zA-Z0-9]/g, '_')}_Lineup_${gameDate.replace(/\//g, '-')}.pdf`;
      downloadPDF(pdfBytes, filename);
      console.log('PDF generated and downloaded successfully');

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Canvas Lineup Preview"
      size="xl"
      centered={!isMobile}
      fullScreen={isMobile}
      styles={{
        header: {
          padding: isMobile ? 'md' : undefined,
        },
        body: {
          padding: isMobile ? 'md' : undefined,
        },
      }}
    >
      <Stack gap="md">
        {/* Customization Options */}
        <Paper p="md" withBorder>
          <Title order={4} mb="sm">Customization</Title>
          <Stack gap="sm">
            <TextInput
              label="Team Name"
              value={customTeamName}
              onChange={(e) => setCustomTeamName(e.target.value)}
              placeholder="Enter team name"
              leftSection={<IconEdit size={16} />}
            />
            <TextInput
              label="City"
              value={customCityName}
              onChange={(e) => setCustomCityName(e.target.value)}
              placeholder="Enter city name"
              leftSection={<IconEdit size={16} />}
            />
            <TextInput
              label="Game Date"
              value={gameDate}
              onChange={(e) => setGameDate(e.target.value)}
              placeholder="MM/DD/YYYY"
            />
          </Stack>
        </Paper>

        {/* Canvas Preview */}
        <Paper p="md" withBorder>
          <Title order={4} mb="sm">Canvas Preview</Title>
          {isGenerating ? (
            <Text>Generating canvas preview...</Text>
          ) : canvasPreview ? (
            <div style={{ textAlign: 'center' }}>
              <Image
                src={canvasPreview}
                alt="Lineup preview"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                }}
              />
              <Text size="sm" c="dimmed" mt="sm">
                Canvas dimensions: 2828 x 4000 pixels
              </Text>
            </div>
          ) : (
            <Text c="red">Failed to generate canvas preview</Text>
          )}
        </Paper>

        <Divider />

        {/* Action Buttons */}
        <Group justify="space-between">
          <Button variant="default" leftSection={<IconArrowLeft size={14} />} onClick={onBack}>
            Back
          </Button>
          <Group>
            <Button
              variant="outline"
              leftSection={<IconPrinter size={14} />}
              onClick={generatePreview}
              loading={isGenerating}
              disabled={isGenerating}
            >
              Regenerate Preview
            </Button>
            <Button
              leftSection={<IconFileDownload size={14} />}
              onClick={handleGeneratePDF}
              loading={isGeneratingPDF}
              disabled={isGeneratingPDF || !canvasPreview}
              color="yellow"
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default CanvasPreviewModal;
