import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header style={{
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        padding: '2rem',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1>⚾ Jack's Baseball Dashboard</h1>
        <p>AI-Powered Batting Order Optimizer</p>
      </header>
      
      <main style={{ padding: '2rem' }}>
        <div style={{
          background: '#f5f5f5',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2>🚀 MVP Coming Soon</h2>
          <p>Import GameChanger CSV → Generate Optimal Batting Orders</p>
          
          <button style={{
            background: '#FFC107',
            color: 'black',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Import CSV (Coming Soon)
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;