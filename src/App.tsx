import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { PlayerManager } from './PlayerManager';
import { Player, ThemeSettings } from './StorageService';
import { DraggableBattingOrder } from './DraggableBattingOrder';
import StorageService, { TeamData, TeamInfo, CSVFile, BattingOrderConfig, UserSettings } from './StorageService';
import ThemeCustomizer from './ThemeCustomizer';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [battingOrder, setBattingOrder] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState<'players' | 'batting-order'>('players');
  const [teamInfo, setTeamInfo] = useState<TeamInfo>(StorageService.getDefaultTeamData().teamInfo);
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([]);
  const [savedBattingOrders, setSavedBattingOrders] = useState<BattingOrderConfig[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getDefaultTeamData().settings);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);

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

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      const success = StorageService.clearTeamData();
      if (success) {
        // Reset to defaults
        setPlayers([]);
        setBattingOrder([]);
        setCsvFiles([]);
        setSavedBattingOrders([]);
        setTeamInfo(StorageService.getDefaultTeamData().teamInfo);
        setSettings(StorageService.getDefaultTeamData().settings);
        setSaveStatus('saved');
        console.log('All data cleared successfully');
      } else {
        console.error('Failed to clear data');
        setSaveStatus('error');
      }
    }
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
    <div className="App">
      <header style={{
        background: `linear-gradient(135deg, ${settings.customTheme?.colors?.primary || '#007bff'} 0%, ${settings.customTheme?.colors?.secondary || '#6c757d'} 100%)`,
        padding: '2rem',
        color: 'white',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          {teamInfo.logo && (
            <img
              src={teamInfo.logo}
              alt={`${teamInfo.name} logo`}
              style={{
                maxWidth: '120px',
                maxHeight: '80px',
                objectFit: 'contain'
              }}
            />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem' }}>
              {teamInfo.name || 'Baseball Dashboard'}
            </h1>
            {teamInfo.location && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
                {teamInfo.location}
              </p>
            )}
          </div>
        </div>
        
        {/* Theme Customizer Button */}
        <button
          onClick={() => setShowThemeCustomizer(true)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          🎨 Customize Theme
        </button>

        {/* Save Status Indicator */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '12rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: saveStatus === 'saved' ? '#10b981' : 
                           saveStatus === 'saving' ? '#f59e0b' : '#ef4444'
          }} />
          <span>
            {saveStatus === 'saved' ? 'Saved' : 
             saveStatus === 'saving' ? 'Saving...' : 'Save Error'}
          </span>
        </div>

        {/* Storage Info */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          fontSize: '0.8rem',
          opacity: 0.8
        }}>
          Storage: {Math.round(getStorageInfo().percentage)}% used
        </div>
      </header>
      
      {/* Tab Navigation */}
      <nav style={{
        background: '#f8f9fa',
        padding: '1rem 2rem',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setActiveTab('players')}
            style={{
              background: activeTab === 'players' ? `var(--theme-primary)` : 'transparent',
              color: activeTab === 'players' ? 'white' : `var(--theme-primary)`,
              border: `1px solid var(--theme-primary)`,
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            👥 Manage Players
          </button>
          <button
            onClick={() => setActiveTab('batting-order')}
            style={{
              background: activeTab === 'batting-order' ? `var(--theme-primary)` : 'transparent',
              color: activeTab === 'batting-order' ? 'white' : `var(--theme-primary)`,
              border: `1px solid var(--theme-primary)`,
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⚾ Batting Order
          </button>
        </div>

        {/* Clear All Data Button */}
        <button
          onClick={handleClearAllData}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
          title="Clear all saved data (players, batting orders, CSV files)"
        >
          🗑️ Clear All Data
        </button>
      </nav>
      
      <main style={{ padding: '2rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Loading your team data...</div>
            <div style={{ color: '#666' }}>Please wait while we restore your saved data.</div>
          </div>
        ) : (
          <>
            {activeTab === 'players' && (
              <PlayerManager 
                players={players}
                onPlayersChange={handlePlayersChange}
                csvFiles={csvFiles}
                onCSVImport={handleCSVImport}
              />
            )}
            
            {activeTab === 'batting-order' && (
              <DraggableBattingOrder 
                players={players} 
                battingOrder={battingOrder}
                onBattingOrderChange={handleBattingOrderChange}
                savedBattingOrders={savedBattingOrders}
                onSaveBattingOrder={(config) => setSavedBattingOrders(prev => [...prev, config])}
                settings={settings}
                onSettingsChange={setSettings}
              />
            )}
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
    </div>
  );
}

export default App;