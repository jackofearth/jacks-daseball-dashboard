import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Loader, Center, Text, Alert, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import './App.css';
import './styles/animations.css';
import { PlayerManager } from './PlayerManagerMantine';
import { Player } from './StorageService';
import { DraggableBattingOrder } from './DraggableBattingOrderMantine';
import StorageService, { TeamData, TeamInfo, CSVFile, BattingOrderConfig, UserSettings } from './StorageService';
import { clearProcessedLogoCache } from './utils/ImageProcessing';
import ConfirmationDialog from './ConfirmationDialog';
import HelpPage from './HelpPage';
import { AppLayout } from './AppLayout';
import TeamCustomizer from './TeamCustomizer';
import { HeroLanding } from './pages/HeroLanding';

function App() {
  const isMobile = useMediaQuery('(max-width: 767px)') ?? false;
  const [players, setPlayers] = useState<Player[]>([]);
  const [battingOrder, setBattingOrder] = useState<Player[]>([]);
  const [teamInfo, setTeamInfo] = useState<TeamInfo>(StorageService.getDefaultTeamData().teamInfo);
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([]);
  const [savedBattingOrders, setSavedBattingOrders] = useState<BattingOrderConfig[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getDefaultTeamData().settings);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showClearPlayersDialog, setShowClearPlayersDialog] = useState(false);
  const [showTeamCustomizer, setShowTeamCustomizer] = useState(false);
  const [showHeroLanding, setShowHeroLanding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeSection, setActiveSection] = useState<'players' | 'lineup' | 'help'>(() => {
    // Get active section from localStorage or default to 'players'
    const saved = localStorage.getItem('activeSection');
    return (saved as 'players' | 'lineup' | 'help') || 'players';
  });

  // Auto-load data on app start
  useEffect(() => {
    // One-time purge of processed logo cache
    try {
      const key = 'logoCacheClearedV1';
      if (!localStorage.getItem(key)) {
        clearProcessedLogoCache();
        localStorage.setItem(key, 'true');
      }
    } catch {}

    const loadTeamData = () => {
      try {
        const savedData = StorageService.loadTeamData();
        if (savedData) {
          setPlayers(savedData.players || []);
          setBattingOrder(savedData.currentBattingOrder || []);
          setTeamInfo(savedData.teamInfo || StorageService.getDefaultTeamData().teamInfo);
          setCsvFiles(savedData.csvFiles || []);
          setSavedBattingOrders(savedData.battingOrders || []);
          setSettings(savedData.settings || StorageService.getDefaultTeamData().settings);
          console.log('Team data loaded successfully');
        } else {
          console.log('No saved data found, using defaults');
        }
      } catch (error) {
        console.error('Failed to load team data:', error);
        setSaveStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, []);

  // Check if user has visited before
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setShowHeroLanding(true);
    }
  }, []);

  // Auto-save data whenever it changes
  const saveTeamData = useCallback(() => {
    if (isLoading) return; // Don't save during initial load

    setSaveStatus('saving');
    
    const teamData: TeamData = {
      teamInfo,
      players,
      csvFiles,
      battingOrders: savedBattingOrders,
      currentBattingOrder: battingOrder,
      settings,
      lastUpdated: new Date().toISOString()
    };

    const success = StorageService.saveTeamData(teamData);
    setSaveStatus(success ? 'saved' : 'error');
    
    // Cleanup old data periodically
    if (Math.random() < 0.1) { // 10% chance to cleanup
      StorageService.cleanupOldData(10);
    }
  }, [teamInfo, players, csvFiles, savedBattingOrders, battingOrder, settings, isLoading]);

  // Debounced auto-save
  useEffect(() => {
    if (isLoading) return;
    
    const timeoutId = setTimeout(saveTeamData, 1000); // 1 second delay
    return () => clearTimeout(timeoutId);
  }, [saveTeamData, isLoading]);

  const handlePlayersChange = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    
    // Update batting order to reflect any changes in player data
    setBattingOrder(prevOrder => 
      prevOrder.map(battingOrderPlayer => {
        const updatedPlayer = newPlayers.find(p => p.id === battingOrderPlayer.id);
        return updatedPlayer ? updatedPlayer : battingOrderPlayer;
      })
    );
  };

  const handleBattingOrderChange = (newOrder: Player[]) => {
    setBattingOrder(newOrder);
  };

  const handleCSVImport = (csvData: CSVFile) => {
    setCsvFiles(prev => [...prev, csvData]);
    
    toast.success(`Successfully imported ${csvData.playerCount} players!`, {
      icon: '✅',
      duration: 5000,
    });
  };

  const handleTeamInfoChange = (newTeamInfo: TeamInfo) => {
    setTeamInfo(newTeamInfo);
  };

  // Keep global theme color in sync with selected team color
  useEffect(() => {
    const color = teamInfo.pdfHeaderColor || '#FFC107';
    document.documentElement.style.setProperty('--theme-primary', color);
  }, [teamInfo.pdfHeaderColor]);

  const handleGetStarted = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      localStorage.setItem('hasVisitedBefore', 'true');
      setShowHeroLanding(false);
      setIsTransitioning(false);
    }, 500);
  };


  const handleClearAllPlayers = () => {
    setShowClearPlayersDialog(true);
  };

  const handleSectionChange = (section: 'players' | 'lineup' | 'help') => {
    setActiveSection(section);
    localStorage.setItem('activeSection', section);
  };

  const handleNavigateToHelp = () => {
    handleSectionChange('help');
    // Add a small delay to ensure the help page renders before scrolling
    setTimeout(() => {
      const strategiesSection = document.getElementById('strategies');
      if (strategiesSection) {
        // Scroll to slightly above the strategies section to account for header
        const elementPosition = strategiesSection.offsetTop;
        const offsetPosition = elementPosition - 100; // 100px above the section
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };



  const confirmClearAllPlayers = () => {
    setPlayers([]);
    setBattingOrder([]);
    setCsvFiles([]);
    setShowClearPlayersDialog(false);
  };




  // Show hero landing on first visit
  if (showHeroLanding) {
    return (
      <div className={isTransitioning ? 'hero-landing fade-out' : 'hero-landing'}>
        <HeroLanding 
          onGetStarted={handleGetStarted}
          teamInfo={teamInfo}
          onTeamInfoChange={handleTeamInfoChange}
        />
          </div>
    );
  }

  return (
    <Router>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--mantine-color-dark-7)',
            color: '#fff',
            border: '1px solid var(--mantine-color-yellow-4)',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={
          <AppLayout 
            teamInfo={teamInfo}
            activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                  onCustomizeTeam={() => setShowTeamCustomizer(true)}
                  currentView={activeSection}
                  setCurrentView={(view) => handleSectionChange(view as 'players' | 'lineup' | 'help')}
                  setShowTeamSettings={() => setShowTeamCustomizer(true)}
                  onShowHero={() => setShowHeroLanding(true)}
          >
            <Container size={isMobile ? "100%" : "xl"} px={isMobile ? "sm" : "md"}>
              {isLoading ? (
                <Center h={400}>
                  <Stack align="center" gap="md">
                    <Loader size="lg" />
                    <Text size="lg" fw={500}>Loading your team data...</Text>
                    <Text c="dimmed">Please wait while we restore your saved data.</Text>
                  </Stack>
                </Center>
              ) : saveStatus === 'error' ? (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="Error" 
                  color="red"
                  mb="md"
                >
                  Failed to load team data. Please refresh the page.
                </Alert>
              ) : (
                <>
                  {activeSection === 'players' && (
                    <PlayerManager 
                      players={players}
                      onPlayersChange={handlePlayersChange}
                      csvFiles={csvFiles}
                      onCSVImport={handleCSVImport}
                      onClearAllPlayers={handleClearAllPlayers}
                    />
                  )}
                  
                  {activeSection === 'lineup' && (
                    <DraggableBattingOrder 
                      players={players} 
                      battingOrder={battingOrder}
                      onBattingOrderChange={handleBattingOrderChange}
                      savedBattingOrders={savedBattingOrders}
                      onSaveBattingOrder={(config) => setSavedBattingOrders(prev => [...prev, config])}
                      settings={settings}
                      onSettingsChange={setSettings}
                      onClearAllPlayers={handleClearAllPlayers}
                      teamInfo={teamInfo}
                      onNavigateToHelp={handleNavigateToHelp}
                      onOpenCustomization={() => setShowTeamCustomizer(true)}
                    />
                  )}
                  
                  {activeSection === 'help' && (
                    <HelpPage />
                  )}
                </>
              )}
            </Container>


            {/* Confirmation Dialogs */}
            <ConfirmationDialog
              isOpen={showClearPlayersDialog}
              title="Clear All Players"
              message="Are you sure you want to clear all players? This will also clear your batting order and imported CSV files."
              confirmText="Clear Players"
              cancelText="Cancel"
              type="warning"
              onConfirm={confirmClearAllPlayers}
              onCancel={() => setShowClearPlayersDialog(false)}
            />

            {/* Team Customizer Modal */}
            <TeamCustomizer
              teamInfo={teamInfo}
              onTeamInfoChange={handleTeamInfoChange}
              onClose={() => setShowTeamCustomizer(false)}
              isOpen={showTeamCustomizer}
            />
          </AppLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;