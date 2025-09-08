import React, { useState } from 'react';
import { TeamInfo, ThemeSettings } from './StorageService';

interface ThemeCustomizerProps {
  teamInfo: TeamInfo;
  themeSettings: ThemeSettings;
  onTeamInfoChange: (teamInfo: TeamInfo) => void;
  onThemeChange: (theme: ThemeSettings) => void;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  teamInfo,
  themeSettings,
  onTeamInfoChange,
  onThemeChange,
  onClose
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

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, color: '#333' }}>🎨 Customize Theme</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* Team Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#555' }}>Team Information</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Team Name:
            </label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => handleInputChange('teamName', e.target.value)}
              placeholder="Enter team name"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Location:
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter city/state"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        {/* Logo Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#555' }}>Team Logo</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>
            Upload your team logo (PNG, JPG, or SVG recommended).
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Upload Logo:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {logoPreview && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#555' }}>Logo Preview:</h4>
              <img
                src={logoPreview}
                alt="Logo preview"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '0.5rem',
                  background: 'white',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
        </div>

        {/* Color Scheme Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#555' }}>Color Scheme</h3>
          <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '0.9rem' }}>
            Choose a predefined scheme or create your own.
          </p>
          
          {/* Predefined Schemes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#555', fontSize: '1rem' }}>Predefined Schemes</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem' 
            }}>
              {Object.entries(colorSchemes).map(([key, colors]) => (
                <div
                  key={key}
                  onClick={() => setSelectedColorScheme(key)}
                  style={{
                    border: selectedColorScheme === key ? '3px solid #333' : '2px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '0.5rem' 
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: colors.primary
                    }}></div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: colors.secondary
                    }}></div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: colors.accent
                    }}></div>
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold', 
                    textTransform: 'capitalize',
                    color: selectedColorScheme === key ? '#333' : '#666'
                  }}>
                    {key}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#555', fontSize: '1rem' }}>Custom Colors</h4>
            <div style={{
              border: selectedColorScheme === 'custom' ? '3px solid #333' : '2px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              background: 'white'
            }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Primary Color: <span style={{ color: customColors.primary, fontWeight: 'normal' }}>({getColorName(customColors.primary)})</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: '200px' }}>
                    {basicColors.map(color => (
                      <div
                        key={color}
                        onClick={() => handleCustomColorChange('primary', color)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: color,
                          cursor: 'pointer',
                          border: customColors.primary === color ? '3px solid #333' : '2px solid #ddd',
                          transition: 'all 0.2s ease'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Secondary Color: <span style={{ color: customColors.secondary, fontWeight: 'normal' }}>({getColorName(customColors.secondary)})</span>
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: '200px' }}>
                    {basicColors.map(color => (
                      <div
                        key={color}
                        onClick={() => handleCustomColorChange('secondary', color)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: color,
                          cursor: 'pointer',
                          border: customColors.secondary === color ? '3px solid #333' : '2px solid #ddd',
                          transition: 'all 0.2s ease'
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              color: '#666',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              background: '#007bff',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;