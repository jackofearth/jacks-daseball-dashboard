import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { PlayerManager } from './PlayerManager';
import { Player, ThemeSettings } from './StorageService';
import { DraggableBattingOrder } from './DraggableBattingOrder';
import StorageService, { TeamData, TeamInfo, CSVFile, BattingOrderConfig, UserSettings } from './StorageService';
import ThemeCustomizer from './ThemeCustomizer';
import ConfirmationDialog from './ConfirmationDialog';
import HelpPage from './HelpPage';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [battingOrder, setBattingOrder] = useState<Player[]>([]);
  const [teamInfo, setTeamInfo] = useState<TeamInfo>(StorageService.getDefaultTeamData().teamInfo);
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([]);
  const [savedBattingOrders, setSavedBattingOrders] = useState<BattingOrderConfig[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getDefaultTeamData().settings);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showClearPlayersDialog, setShowClearPlayersDialog] = useState(false);

  // Auto-load data on app start
  useEffect(() => {
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
  };

  const handleBattingOrderChange = (newOrder: Player[]) => {
    setBattingOrder(newOrder);
  };

  const handleCSVImport = (csvData: CSVFile) => {
    setCsvFiles(prev => [...prev, csvData]);
  };

  const handleTeamInfoChange = (newTeamInfo: TeamInfo) => {
    setTeamInfo(newTeamInfo);
  };

  const handleThemeChange = (newTheme: ThemeSettings) => {
    setSettings(prev => ({
      ...prev,
      customTheme: newTheme
    }));
  };

  const handleClearAllPlayers = () => {
    setShowClearPlayersDialog(true);
  };

  const confirmClearAllPlayers = () => {
    setPlayers([]);
    setBattingOrder([]);
    setCsvFiles([]);
    setShowClearPlayersDialog(false);
  };

  const getStorageInfo = () => {
    return StorageService.getStorageInfo();
  };

  // Apply theme colors as CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    const colors = settings.customTheme?.colors || { primary: '#007bff', secondary: '#6c757d', accent: '#28a745' };
    
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);
  }, [settings.customTheme]);

  return (
    <Router>
      <Routes>
        <Route path="/help" element={<HelpPage />} />
        <Route path="/" element={
          <div className="App">
      <header style={{
        background: `linear-gradient(135deg, ${settings.customTheme?.colors?.primary || '#007bff'} 0%, ${settings.customTheme?.colors?.secondary || '#6c757d'} 100%)`,
        padding: '2rem',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Left side - Logo */}
          <div style={{ flex: '0 0 auto' }}>
            {teamInfo.logo ? (
              <img
                src={teamInfo.logo}
                alt={`${teamInfo.name} logo`}
                style={{
                  maxWidth: '120px',
                  maxHeight: '80px',
                  objectFit: 'contain'
                }}
              />
            ) : showThemeCustomizer ? (
              <div style={{
                fontSize: '3rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '80px'
              }}>
                ⚾
              </div>
            ) : null}
          </div>

          {/* Center - Team name with customize button */}
          <div style={{ flex: '1', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <h1 style={{ margin: 0, fontSize: '2.5rem' }}>
                {teamInfo.name || 'Baseball Dashboard'}
              </h1>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => setShowThemeCustomizer(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={() => {
                    setShowTooltip(true);
                  }}
                  onMouseLeave={() => {
                    setShowTooltip(false);
                  }}
                >
                  ✏️
                </button>
                {showTooltip && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    marginBottom: '0.25rem',
                    zIndex: 1000
                  }}>
                    Customise
                  </div>
                )}
              </div>
            </div>
            {teamInfo.location && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
                {teamInfo.location}
              </p>
            )}
          </div>

          {/* Right side - Help button */}
          <div style={{ flex: '0 0 auto' }}>
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'white',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                background: 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.background = 'rgba(255, 255, 255, 0.2)';
                (e.target as HTMLAnchorElement).style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLAnchorElement).style.background = 'rgba(255, 255, 255, 0.1)';
                (e.target as HTMLAnchorElement).style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Help
            </a>
          </div>
        </div>

      </header>
      
      {/* Tab Navigation */}
      <nav style={{
        background: '#f8f9fa',
        padding: '1rem 2rem',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}>

      </nav>
      
      <main style={{ 
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 200px)'
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Loading your team data...</div>
            <div style={{ color: '#666' }}>Please wait while we restore your saved data.</div>
          </div>
        ) : (
          <>
            <PlayerManager 
              players={players}
              onPlayersChange={handlePlayersChange}
              csvFiles={csvFiles}
              onCSVImport={handleCSVImport}
            />
            
            <DraggableBattingOrder 
              players={players} 
              battingOrder={battingOrder}
              onBattingOrderChange={handleBattingOrderChange}
              savedBattingOrders={savedBattingOrders}
              onSaveBattingOrder={(config) => setSavedBattingOrders(prev => [...prev, config])}
              settings={settings}
              onSettingsChange={setSettings}
              onClearAllPlayers={handleClearAllPlayers}
            />
          </>
        )}
      </main>

      {/* Theme Customizer Modal */}
      {showThemeCustomizer && (
        <ThemeCustomizer
          teamInfo={teamInfo}
          themeSettings={settings.customTheme || { colors: { primary: '#007bff', secondary: '#6c757d', accent: '#28a745' } }}
          onTeamInfoChange={handleTeamInfoChange}
          onThemeChange={handleThemeChange}
          onClose={() => setShowThemeCustomizer(false)}
        />
      )}

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

          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;