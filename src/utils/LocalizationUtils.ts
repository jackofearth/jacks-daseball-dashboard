// Localization utilities for Lineup Star
// Handles region-specific spelling and formatting

export interface UserLocation {
  country: string;
  region: string;
  timezone: string;
}

export interface LocalizationSettings {
  spelling: 'us' | 'uk' | 'au' | 'ca';
  dateFormat: 'us' | 'uk' | 'au' | 'ca';
  currency: string;
}

// Detect user location based on IP (with timeout and graceful fallbacks)
export const detectUserLocation = async (): Promise<UserLocation | null> => {
  try {
    // Avoid network calls during local dev to prevent noisy CORS errors
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        const locale = (navigator.language || 'en-US').toLowerCase();
        const parts = locale.split('-');
        const country = (parts[1] || 'us').toLowerCase();
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        return { country, region: '', timezone: tz };
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Location detection failed');
    const data = await response.json();
    return {
      country: data.country_code?.toLowerCase() || 'us',
      region: data.region?.toLowerCase() || '',
      timezone: data.timezone || 'UTC'
    };
  } catch (error) {
    // Fallback to navigator locale
    try {
      const locale = (navigator.language || 'en-US').toLowerCase();
      const parts = locale.split('-');
      const country = (parts[1] || 'us').toLowerCase();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      return { country, region: '', timezone: tz };
    } catch {
      // As a last resort, return null and use defaults
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Localization fallback to defaults');
      }
      return null;
    }
  }
};

// Get localization settings based on location
export const getLocalizationSettings = (location: UserLocation | null): LocalizationSettings => {
  if (!location) {
    return {
      spelling: 'us',
      dateFormat: 'us',
      currency: 'USD'
    };
  }

  const { country } = location;

  // Determine spelling variant
  let spelling: 'us' | 'uk' | 'au' | 'ca' = 'us';
  if (country === 'au') {
    spelling = 'au';
  } else if (country === 'gb' || country === 'ie') {
    spelling = 'uk';
  } else if (country === 'ca') {
    spelling = 'ca';
  }

  // Determine date format
  let dateFormat: 'us' | 'uk' | 'au' | 'ca' = 'us';
  if (country === 'au' || country === 'gb' || country === 'ie') {
    dateFormat = 'uk';
  } else if (country === 'ca') {
    dateFormat = 'ca';
  }

  return {
    spelling,
    dateFormat,
    currency: country === 'ca' ? 'CAD' : country === 'au' ? 'AUD' : 'USD'
  };
};

// Get localized text based on spelling variant
export const getLocalizedText = (key: string, spelling: 'us' | 'uk' | 'au' | 'ca'): string => {
  const texts: Record<string, Record<string, string>> = {
    color: {
      us: 'Color',
      uk: 'Colour',
      au: 'Colour',
      ca: 'Colour'
    },
    customize: {
      us: 'Customize',
      uk: 'Customise',
      au: 'Customise',
      ca: 'Customize'
    },
    customizeTeam: {
      us: 'Customize Team Info',
      uk: 'Customise Team Info',
      au: 'Customise Team Info',
      ca: 'Customize Team Info'
    },
    customizeYourTeam: {
      us: 'Customize your team name, color, and logo',
      uk: 'Customise your team name, colour, and logo',
      au: 'Customise your team name, colour, and logo',
      ca: 'Customize your team name, colour, and logo'
    },
    mainTeamColor: {
      us: 'Main Team Color',
      uk: 'Main Team Colour',
      au: 'Main Team Colour',
      ca: 'Main Team Colour'
    },
    selectColor: {
      us: 'Select color for PDF header text',
      uk: 'Select colour for PDF header text',
      au: 'Select colour for PDF header text',
      ca: 'Select colour for PDF header text'
    }
  };

  return texts[key]?.[spelling] || texts[key]?.['us'] || key;
};

// Format date based on locale
export const formatDate = (date: Date, format: 'us' | 'uk' | 'au' | 'ca'): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  let locale = 'en-US';
  switch (format) {
    case 'uk':
      locale = 'en-GB';
      break;
    case 'au':
      locale = 'en-AU';
      break;
    case 'ca':
      locale = 'en-CA';
      break;
  }

  return date.toLocaleDateString(locale, options);
};
