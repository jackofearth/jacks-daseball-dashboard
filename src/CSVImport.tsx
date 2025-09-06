import React, { useState } from 'react';
import Papa from 'papaparse';

interface CSVImportProps {
  onDataImported: (data: any[]) => void;
}

export const CSVImport: React.FC<CSVImportProps> = ({ onDataImported }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        console.log('CSV data:', result.data);
        onDataImported(result.data);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('CSV parse error:', error);
        setIsLoading(false);
      }
    });
  };

  return (
    <div style={{
      border: '2px dashed #ccc',
      padding: '2rem',
      textAlign: 'center',
      borderRadius: '8px',
      margin: '1rem 0'
    }}>
      <h3>📄 Import GameChanger CSV</h3>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ margin: '1rem 0' }}
      />
      {isLoading && <p>Loading CSV...</p>}
    </div>
  );
};