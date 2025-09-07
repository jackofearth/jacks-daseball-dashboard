import React, { useState, useEffect } from 'react';
import './App.css';
import { PlayerManager, Player } from './PlayerManager';
import { DraggableBattingOrder } from './DraggableBattingOrder';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [battingOrder, setBattingOrder] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState<'players' | 'batting-order'>('players');

  // Load data from localStorage on app start
  useEffect(() => {
    const savedPlayers = localStorage.getItem('baseball-players');
    const savedBattingOrder = localStorage.getItem('baseball-batting-order');
    
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    
    if (savedBattingOrder) {
      setBattingOrder(JSON.parse(savedBattingOrder));
    }
  }, []);

  // Save players to localStorage whenever they change
  useEffect(() => {
    if (players.length > 0 || localStorage.getItem('baseball-players')) {
      localStorage.setItem('baseball-players', JSON.stringify(players));
    }
  }, [players]);

  // Save batting order to localStorage whenever it changes
  useEffect(() => {
    if (battingOrder.length > 0 || localStorage.getItem('baseball-batting-order')) {
      localStorage.setItem('baseball-batting-order', JSON.stringify(battingOrder));
    }
  }, [battingOrder]);

  const handlePlayersChange = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
  };

  const handleBattingOrderChange = (newOrder: Player[]) => {
    setBattingOrder(newOrder);
  };

  return (
    <div className="App">
      <header style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        padding: '2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1>⚾ Jack's Baseball Dashboard</h1>
        <p>AI-Powered Batting Order Optimizer with Drag & Drop</p>
      </header>
      
      {/* Tab Navigation */}
      <nav style={{
        background: '#f8f9fa',
        padding: '1rem 2rem',
        borderBottom: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setActiveTab('players')}
            style={{
              background: activeTab === 'players' ? '#007bff' : 'transparent',
              color: activeTab === 'players' ? 'white' : '#007bff',
              border: '1px solid #007bff',
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
              background: activeTab === 'batting-order' ? '#007bff' : 'transparent',
              color: activeTab === 'batting-order' ? 'white' : '#007bff',
              border: '1px solid #007bff',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ⚾ Batting Order
          </button>
        </div>
      </nav>
      
      <main style={{ padding: '2rem' }}>
        {activeTab === 'players' && (
          <PlayerManager 
            players={players}
            onPlayersChange={handlePlayersChange} 
          />
        )}
        
        {activeTab === 'batting-order' && (
          <DraggableBattingOrder 
            players={players} 
            battingOrder={battingOrder}
            onBattingOrderChange={handleBattingOrderChange}
          />
        )}
      </main>
    </div>
  );
}

export default App;