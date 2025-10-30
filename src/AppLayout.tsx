import React from 'react';
import { AppShell, Group, Title, Button, Tooltip, ActionIcon } from '@mantine/core';
import { IconHelp, IconUsers, IconCoffee, IconChartBar } from '@tabler/icons-react';
import { TeamInfo } from './StorageService';

interface AppLayoutProps {
  children: React.ReactNode;
  teamInfo: TeamInfo;
  activeSection: 'players' | 'lineup' | 'help';
  onSectionChange: (section: 'players' | 'lineup' | 'help') => void;
  onCustomizeTeam: () => void;
  currentView?: string;
  setCurrentView?: (view: string) => void;
  setShowTeamSettings?: (show: boolean) => void;
  onShowHero?: () => void;
}

export function AppLayout({ children, teamInfo, activeSection, onSectionChange, onCustomizeTeam, currentView, setCurrentView, setShowTeamSettings, onShowHero }: AppLayoutProps) {
  return (
    <AppShell
      header={{ height: 100 }}
      padding="md"
    >
      <AppShell.Header
        h={70}
        style={{
          background: 'rgba(8, 10, 18, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          borderTop: '1px solid color-mix(in srgb, var(--theme-primary) 50%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--theme-primary) 50%, transparent)'
        }}
      >
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
          {/* Left: Team Branding */}
          <Group gap="md" style={{ minWidth: '280px' }}>
              {teamInfo.logo && (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid color-mix(in srgb, var(--theme-primary) 60%, transparent)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 18px color-mix(in srgb, var(--theme-primary) 40%, transparent)'
                }}
              >
                <img 
                  src={teamInfo.logo}
                  alt="Team Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            )}
            <div>
              <Title 
                order={2} 
                size="h3"
                style={{ 
                  color: 'var(--theme-primary)',
                  lineHeight: 1.1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {teamInfo.location || ''}
              </Title>
              <Tooltip label="Customise my team" position="bottom" withArrow>
                <Title 
                  order={3} 
                  size="h2"
                  onClick={() => setShowTeamSettings?.(true)}
                  style={{ 
                    color: 'var(--theme-primary)',
                    lineHeight: 1.05,
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'transform 120ms ease, text-shadow 120ms ease'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLHeadingElement).style.textShadow = '0 0 12px color-mix(in srgb, var(--theme-primary) 40%, transparent)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLHeadingElement).style.textShadow = 'none'; }}
                >
                  {teamInfo.name || 'My team name'}
                  </Title>
              </Tooltip>
            </div>
            
            {/* Settings icon removed; click team name instead */}
          </Group>

          {/* Center: Main Navigation */}
          <Group gap="lg" style={{ flex: 1, justifyContent: 'center' }}>
            <Button
              variant="subtle"
              leftSection={<IconUsers size={16} />}
              onClick={() => setCurrentView?.('players')}
              size="md"
              className={`nav-btn ${currentView === 'players' ? 'nav-btn--active' : ''}`}
              styles={{
                root: {
                  position: 'relative',
                  color: currentView === 'players' ? 'var(--theme-primary)' : '#fff',
                  fontWeight: currentView === 'players' ? 700 : 400,
                  borderRadius: 999,
                  paddingInline: 14,
                  background: currentView === 'players' ? 'color-mix(in srgb, var(--theme-primary) 20%, transparent)' : 'transparent',
                  boxShadow: currentView === 'players' ? 'inset 0 -2px 0 var(--theme-primary)' : 'none',
                  transition: 'transform 140ms ease, background 140ms ease, box-shadow 140ms ease',
                  cursor: 'pointer',
                  '&:hover': {
                    background: currentView === 'players' ? 'color-mix(in srgb, var(--theme-primary) 30%, transparent)' : 'color-mix(in srgb, var(--theme-primary) 25%, transparent)',
                    transform: 'translateY(-1px)',
                    boxShadow: currentView === 'players' ? 'inset 0 -2px 0 var(--theme-primary), 0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : '0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)'
                  },
                  // Focus-visible styles removed to avoid unsupported inline pseudo-selector warning
                },
              }}
            >
              Player Management
            </Button>
            
            <Button
                    variant="subtle" 
              leftSection={<IconChartBar size={16} />}
              onClick={() => setCurrentView?.('lineup')}
              size="md"
              className={`nav-btn ${currentView === 'lineup' ? 'nav-btn--active' : ''}`}
              styles={{
                root: {
                  position: 'relative',
                  color: currentView === 'lineup' ? 'var(--theme-primary)' : '#fff',
                  fontWeight: currentView === 'lineup' ? 700 : 400,
                  borderRadius: 999,
                  paddingInline: 14,
                  background: currentView === 'lineup' ? 'color-mix(in srgb, var(--theme-primary) 20%, transparent)' : 'transparent',
                  boxShadow: currentView === 'lineup' ? 'inset 0 -2px 0 var(--theme-primary)' : 'none',
                  transition: 'transform 140ms ease, background 140ms ease, box-shadow 140ms ease',
                  cursor: 'pointer',
                  '&:hover': {
                    background: currentView === 'lineup' ? 'color-mix(in srgb, var(--theme-primary) 30%, transparent)' : 'color-mix(in srgb, var(--theme-primary) 25%, transparent)',
                    transform: 'translateY(-1px)',
                    boxShadow: currentView === 'lineup' ? 'inset 0 -2px 0 var(--theme-primary), 0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : '0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)'
                  },
                  // Focus-visible styles removed to avoid unsupported inline pseudo-selector warning
                },
              }}
            >
              Batting Order
            </Button>
          </Group>
          
          {/* Right: Utility Actions */}
          <Group gap="sm" style={{ minWidth: '150px', justifyContent: 'flex-end' }}>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)', marginInline: 8 }} />

            {/* Temporary: Back to Hero */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowHero?.()}
              styles={{
                root: {
                  color: 'var(--theme-primary)',
                  borderColor: 'color-mix(in srgb, var(--theme-primary) 60%, transparent)',
                  background: 'transparent',
                  '&:hover': {
                    background: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)'
                  }
                }
              }}
            >
              Hero
            </Button>

            <Button
              variant="subtle"
              leftSection={<IconHelp size={16} />}
              onClick={() => setCurrentView?.('help')}
              size="md"
              className={`nav-btn ${currentView === 'help' ? 'nav-btn--active' : ''}`}
              styles={{
                root: {
                  position: 'relative',
                  color: currentView === 'help' ? 'var(--theme-primary)' : '#fff',
                  fontWeight: currentView === 'help' ? 700 : 400,
                  borderRadius: 999,
                  paddingInline: 14,
                  background: currentView === 'help' ? 'color-mix(in srgb, var(--theme-primary) 20%, transparent)' : 'transparent',
                  boxShadow: currentView === 'help' ? 'inset 0 -2px 0 var(--theme-primary)' : 'none',
                  transition: 'transform 140ms ease, background 140ms ease, box-shadow 140ms ease',
                  cursor: 'pointer',
                  '&:hover': {
                    background: currentView === 'help' ? 'color-mix(in srgb, var(--theme-primary) 30%, transparent)' : 'color-mix(in srgb, var(--theme-primary) 25%, transparent)',
                    transform: 'translateY(-1px)',
                    boxShadow: currentView === 'help' ? 'inset 0 -2px 0 var(--theme-primary), 0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)' : '0 2px 8px color-mix(in srgb, var(--theme-primary) 30%, transparent)'
                  },
                  // Focus-visible styles removed to avoid unsupported inline pseudo-selector warning
                },
              }}
            >
              Help
            </Button>
            
            {/* Coffee Button - More Subtle */}
            <Tooltip label="Buy me a coffee" position="bottom" withArrow>
              <ActionIcon
                variant="light"
                color="yellow"
                size="lg"
                onClick={() => {
                  const win = window as any;
                  if (win.BMC && win.BMC.Widget) {
                    win.BMC.Widget.open();
                  } else {
                    window.open('https://www.buymeacoffee.com/jackofearth', '_blank');
                  }
                }}
                style={{
                  transition: 'all 0.2s ease',
                }}
                styles={{
                  root: {
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                <IconCoffee size={22} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ scrollPaddingTop: '150px', position: 'relative' }}>
        {teamInfo.logo && (
          <div
            aria-hidden
            style={{
              position: 'fixed',
              inset: 0,
              backgroundImage: `url(${teamInfo.logo})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top center',
              backgroundSize: '100% auto',
              opacity: 0.02,
              pointerEvents: 'none',
              zIndex: 0,
              filter: 'grayscale(100%)'
            }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
