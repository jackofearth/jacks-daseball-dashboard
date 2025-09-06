import React, { useState } from 'react';
import './App.css';
import { CSVImport } from './CSVImport';

function App() {
  const [csvData, setCsvData] = useState<any[]>([]);

  const handleDataImported = (data: any[]) => {
    setCsvData(data);
    console.log('Imported data:', data);
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
        <p>AI-Powered Batting Order Optimizer</p>
      </header>
      
      <main style={{ padding: '2rem' }}>
        <CSVImport onDataImported={handleDataImported} />
        
        {csvData.length > 0 && (
          <div style={{
            background: '#e8f5e8',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <h3>✅ CSV Imported Successfully!</h3>
            <p>Found {csvData.length} rows of data</p>
            <p>Check the browser console (F12) to see the data</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;