// StorageService.ts - Comprehensive localStorage management for Lineup Star
// Handles auto-save, auto-load, and error recovery for all team data

export interface TeamInfo {
  name: string;
  location?: string; // City/Town for logo scraping
  logo?: string;
  logoType?: 'uploaded' | 'scraped' | 'none';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  pdfHeaderColor?: string; // Color for PDF header text
  hasBeenCustomized?: boolean; // Track if user has customized team info
}

export interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  customCSS?: string;
}

export interface Player {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  position?: string;
  fieldingPosition?: string;
  battingHand?: 'R' | 'L'; // Righty or Lefty
  // Basic stats
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  // Advanced stats
  ab?: number;
  pa?: number;
  sb?: number;
  cs?: number;
  sb_percent?: number;
  bb_k?: number;
  contact_percent?: number;
  qab_percent?: number;
  ba_risp?: number;
  two_out_rbi?: number;
  xbh?: number;
  hr?: number;
  tb?: number;
  lob?: number;
  // Rate-based stats (calculated from raw counts)
  hr_rate?: number; // HR/AB
  xbh_rate?: number; // XBH/AB
  two_out_rbi_rate?: number; // Two_out_RBI/AB_RISP
  ab_risp?: number; // At-bats with runners in scoring position
  // Additional stats from CSV
  [key: string]: any;
}

export interface CSVFile {
  id: string;
  filename: string;
  data: any[];
  importedAt: string;
  playerCount: number;
}

export interface BattingOrderConfig {
  id: string;
  name: string;
  strategy: 'mlb-level' | 'jacks-custom-local-league';
  players: Player[];
  createdAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  defaultStrategy: 'mlb-level' | 'jacks-custom-local-league';
  autoSave: boolean;
  showRoleDescriptions: boolean;
  showAdvancedStats: boolean;
  customTheme: ThemeSettings;
}

export interface TeamData {
  teamInfo: TeamInfo;
  players: Player[];
  csvFiles: CSVFile[];
  battingOrders: BattingOrderConfig[];
  currentBattingOrder: Player[];
  settings: UserSettings;
  lastUpdated: string;
}

class StorageService {
  private static readonly STORAGE_PREFIX = 'baseballDashboard_';
  private static readonly TEAM_DATA_KEY = 'teamData';
  private static readonly CSV_DATA_KEY = 'csvData';
  private static readonly SETTINGS_KEY = 'settings';

  // Check if localStorage is available
  private static isLocalStorageAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Get storage key with prefix
  private static getKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }

  // Safe JSON parse with error handling
  private static safeJsonParse<T>(jsonString: string, fallback: T): T {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Failed to parse JSON from localStorage:', error);
      return fallback;
    }
  }

  // Safe JSON stringify with error handling
  private static safeJsonStringify(data: any): string | null {
    try {
      return JSON.stringify(data);
    } catch (error) {
      console.error('Failed to stringify data for localStorage:', error);
      return null;
    }
  }

  // Save complete team data
  static saveTeamData(data: TeamData): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage not available - data not saved');
      return false;
    }

    try {
      const dataWithTimestamp = {
        ...data,
        lastUpdated: new Date().toISOString()
      };

      const jsonString = this.safeJsonStringify(dataWithTimestamp);
      if (jsonString === null) {
        return false;
      }

      localStorage.setItem(this.getKey(this.TEAM_DATA_KEY), jsonString);
      console.log('Team data saved successfully');
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        console.error('Storage quota exceeded - cannot save team data');
        // Could implement cleanup of old data here
      } else {
        console.error('Failed to save team data:', error);
      }
      return false;
    }
  }

  // Load complete team data
  static loadTeamData(): TeamData | null {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage not available - using default data');
      return null;
    }

    try {
      const jsonString = localStorage.getItem(this.getKey(this.TEAM_DATA_KEY));
      if (!jsonString) {
        return null;
      }

      const data = this.safeJsonParse<TeamData | null>(jsonString, null);
      if (data) {
        console.log('Team data loaded successfully');
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to load team data:', error);
      return null;
    }
  }

  // Clear all team data
  static clearTeamData(): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage not available - cannot clear data');
      return false;
    }

    try {
      localStorage.removeItem(this.getKey(this.TEAM_DATA_KEY));
      localStorage.removeItem(this.getKey(this.CSV_DATA_KEY));
      localStorage.removeItem(this.getKey(this.SETTINGS_KEY));
      console.log('All team data cleared successfully');
      return true;
    } catch (error) {
      console.error('Failed to clear team data:', error);
      return false;
    }
  }

  // Save CSV data separately (for backup/recovery)
  static saveCSVData(csvData: CSVFile[]): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }

    try {
      const jsonString = this.safeJsonStringify(csvData);
      if (jsonString === null) {
        return false;
      }

      localStorage.setItem(this.getKey(this.CSV_DATA_KEY), jsonString);
      return true;
    } catch (error) {
      console.error('Failed to save CSV data:', error);
      return false;
    }
  }

  // Load CSV data separately
  static loadCSVData(): CSVFile[] | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }

    try {
      const jsonString = localStorage.getItem(this.getKey(this.CSV_DATA_KEY));
      if (!jsonString) {
        return null;
      }

      return this.safeJsonParse<CSVFile[]>(jsonString, []);
    } catch (error) {
      console.error('Failed to load CSV data:', error);
      return null;
    }
  }

  // Save user settings
  static saveSettings(settings: UserSettings): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false;
    }

    try {
      const jsonString = this.safeJsonStringify(settings);
      if (jsonString === null) {
        return false;
      }

      localStorage.setItem(this.getKey(this.SETTINGS_KEY), jsonString);
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  // Load user settings
  static loadSettings(): UserSettings | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }

    try {
      const jsonString = localStorage.getItem(this.getKey(this.SETTINGS_KEY));
      if (!jsonString) {
        return null;
      }

      return this.safeJsonParse<UserSettings | null>(jsonString, null);
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }

  // Get default team data structure
  static getDefaultTeamData(): TeamData {
    return {
      teamInfo: {
        name: '',
        colors: {
          primary: '#1e40af',
          secondary: '#f59e0b',
          accent: '#10b981'
        },
        pdfHeaderColor: '#FFC107', // Default to yellow
        hasBeenCustomized: false
      },
      players: [],
      csvFiles: [],
      battingOrders: [],
      currentBattingOrder: [],
      settings: {
        theme: 'light',
        defaultStrategy: 'jacks-custom-local-league',
        autoSave: true,
        showRoleDescriptions: true,
        showAdvancedStats: false,
        customTheme: {
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745'
          }
        }
      },
      lastUpdated: new Date().toISOString()
    };
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isLocalStorageAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let used = 0;
      for (let key in localStorage) {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          used += localStorage[key].length;
        }
      }

      // Estimate available space (most browsers have ~5-10MB limit)
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      const available = Math.max(0, estimatedLimit - used);
      const percentage = (used / estimatedLimit) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Clean up old data (keep only last N batting orders)
  static cleanupOldData(maxBattingOrders: number = 10): boolean {
    try {
      const teamData = this.loadTeamData();
      if (!teamData) {
        return false;
      }

      if (teamData.battingOrders.length > maxBattingOrders) {
        teamData.battingOrders = teamData.battingOrders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, maxBattingOrders);
        
        return this.saveTeamData(teamData);
      }

      return true;
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
      return false;
    }
  }
}

// Player handedness persistence
const HANDEDNESS_STORAGE_KEY = 'lineup-star-player-handedness';

export const savePlayerHandedness = (playerName: string, battingHand: 'R' | 'L'): void => {
  try {
    const handednessData = getPlayerHandednessData();
    handednessData[playerName] = battingHand;
    localStorage.setItem(HANDEDNESS_STORAGE_KEY, JSON.stringify(handednessData));
  } catch (error) {
    console.warn('Failed to save player handedness:', error);
  }
};

export const getPlayerHandedness = (playerName: string): 'R' | 'L' | undefined => {
  try {
    const handednessData = getPlayerHandednessData();
    return handednessData[playerName];
  } catch (error) {
    console.warn('Failed to get player handedness:', error);
    return undefined;
  }
};

const getPlayerHandednessData = (): Record<string, 'R' | 'L'> => {
  try {
    const stored = localStorage.getItem(HANDEDNESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to parse handedness data:', error);
    return {};
  }
};

export default StorageService;
