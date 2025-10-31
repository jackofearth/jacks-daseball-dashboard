import React, { useState } from 'react';
import { AppShell, Group, Title, Button, Tooltip, ActionIcon, Drawer, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconHelp, IconUsers, IconCoffee, IconChartBar, IconMenu2 } from '@tabler/icons-react';
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
  const [drawerOpened, setDrawerOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)') ?? false;
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)') ?? false;

  const handleNavClick = (section: 'players' | 'lineup' | 'help') => {
    setCurrentView?.(section);
    setDrawerOpened(false);
  };

  return (
    <AppShell
      header={{ height: isMobile ? 60 : 100 }}
      padding={isMobile ? "sm" : "md"}
    >
      <AppShell.Header
        h={isMobile ? 60 : 70}
        style={{
          background: 'rgba(8, 10, 18, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          borderTop: '1px solid color-mix(in srgb, var(--theme-primary) 50%, transparent)',
          borderBottom: '1px solid color-mix(in srgb, var(--theme-primary) 50%, transparent)'
        }}
      >
        {isMobile ? (
          // Mobile Header
          <Group h="100%" px="md" justify="space-between" wrap="nowrap" style={{ position: 'relative' }}>
            {/* Burger Menu */}
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={() => setDrawerOpened(true)}
            >
              <IconMenu2 size={24} />
            </ActionIcon>

            {/* Team Logo and Name - Centered */}
            <Group
              gap="xs"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: 'calc(100% - 120px)',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Tooltip label="Customise my team" position="bottom" withArrow>
                <div
                  onClick={() => setShowTeamSettings?.(true)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid color-mix(in srgb, #FFC107 60%, transparent)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
                >
                  {teamInfo.logo ? (
                    <img
                      src={teamInfo.logo}
                      alt="Team Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: '24px' }}>⚾</span>
                  )}
                </div>
              </Tooltip>
              <Tooltip label="Customise my team" position="bottom" withArrow>
                <Title
                  order={3}
                  size="h4"
                  onClick={() => setShowTeamSettings?.(true)}
                  style={{
                    color: '#FFC107',
                    fontSize: '18px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease',
                    margin: 0
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
                >
                  {teamInfo.name || 'My Team'}
                </Title>
              </Tooltip>
            </Group>

            {/* Spacer to balance burger menu */}
            <div style={{ width: '48px' }} />
          </Group>
        ) : (
          // Desktop Header
          <Group h="100%" px={isTablet ? "md" : "lg"} justify="space-between" wrap="nowrap">
          {/* Left: Team Branding */}
          <Group gap={isTablet ? "sm" : "md"} style={{ minWidth: isTablet ? '180px' : '280px', flexShrink: 0 }}>
              <Tooltip label="Customise my team" position="bottom" withArrow>
                <div
                  onClick={() => setShowTeamSettings?.(true)}
                  style={{
                    width: isTablet ? 48 : 64,
                    height: isTablet ? 48 : 64,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid color-mix(in srgb, var(--theme-primary) 60%, transparent)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 18px color-mix(in srgb, var(--theme-primary) 40%, transparent)',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
                >
                  {teamInfo.logo ? (
                    <img 
                      src={teamInfo.logo}
                      alt="Team Logo" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ fontSize: isTablet ? '28px' : '36px' }}>⚾</span>
                  )}
                </div>
              </Tooltip>
            <div>
              <Title 
                order={2} 
                size={isTablet ? "h4" : "h3"}
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
                  size={isTablet ? "h3" : "h2"}
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
                  {teamInfo.name || 'My Team'}
                  </Title>
              </Tooltip>
            </div>
            
            {/* Settings icon removed; click team name instead */}
          </Group>

          {/* Center: Main Navigation */}
          <Group gap={isTablet ? "sm" : "lg"} style={{ flex: 1, justifyContent: 'center', minWidth: 0 }}>
            <Button
              variant="subtle"
              leftSection={<IconUsers size={16} />}
              onClick={() => setCurrentView?.('players')}
              size={isTablet ? "sm" : "md"}
              className={`nav-btn ${currentView === 'players' ? 'nav-btn--active' : ''}`}
              styles={{
                root: {
                  position: 'relative',
                  color: currentView === 'players' ? 'var(--theme-primary)' : '#fff',
                  fontWeight: currentView === 'players' ? 700 : 400,
                  borderRadius: 999,
                  paddingInline: isTablet ? 10 : 14,
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
              size={isTablet ? "sm" : "md"}
              className={`nav-btn ${currentView === 'lineup' ? 'nav-btn--active' : ''}`}
              styles={{
                root: {
                  position: 'relative',
                  color: currentView === 'lineup' ? 'var(--theme-primary)' : '#fff',
                  fontWeight: currentView === 'lineup' ? 700 : 400,
                  borderRadius: 999,
                  paddingInline: isTablet ? 10 : 14,
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
          <Group gap="sm" style={{ minWidth: isTablet ? '120px' : '150px', justifyContent: 'flex-end', flexShrink: 0 }}>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)', marginInline: isTablet ? 4 : 8 }} />

            {/* Hero button removed */}

            <Button
              variant="subtle"
              leftSection={<IconHelp size={16} />}
              onClick={() => setCurrentView?.('help')}
              size={isTablet ? "sm" : "md"}
              className={`nav-btn ${currentView === 'help' ? 'nav-btn--active' : ''}`}
              styles={{
                root: {
                  position: 'relative',
                  color: currentView === 'help' ? 'var(--theme-primary)' : '#fff',
                  fontWeight: currentView === 'help' ? 700 : 400,
                  borderRadius: 999,
                  paddingInline: isTablet ? 10 : 14,
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
                size={isTablet ? "md" : "lg"}
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
        )}
      </AppShell.Header>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          opened={drawerOpened}
          onClose={() => setDrawerOpened(false)}
          title={
            <Title order={4} style={{ color: '#FFC107' }}>Menu</Title>
          }
          padding="md"
          size="70%"
          styles={{
            content: {
              backgroundColor: 'rgba(8, 10, 18, 0.98)',
            },
            header: {
              backgroundColor: 'rgba(8, 10, 18, 0.98)',
              borderBottom: '1px solid rgba(255, 193, 7, 0.2)',
            },
          }}
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 4,
          }}
        >
          <Stack gap="md">
            <Button
              variant={currentView === 'players' ? 'filled' : 'subtle'}
              color="yellow"
              leftSection={<IconUsers size={20} />}
              onClick={() => handleNavClick('players')}
              fullWidth
              size="md"
              styles={{
                root: {
                  justifyContent: 'flex-start',
                  height: '50px',
                  ...(currentView === 'players' ? {
                    background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
                    color: '#000',
                    fontWeight: 700,
                  } : {
                    color: '#FFC107',
                    '&:hover': {
                      background: 'rgba(255, 193, 7, 0.1)',
                    }
                  }),
                },
                inner: {
                  justifyContent: 'flex-start',
                  width: '100%',
                },
              }}
            >
              Player Management
            </Button>
            <Button
              variant={currentView === 'lineup' ? 'filled' : 'subtle'}
              color="yellow"
              leftSection={<IconChartBar size={20} />}
              onClick={() => handleNavClick('lineup')}
              fullWidth
              size="md"
              styles={{
                root: {
                  justifyContent: 'flex-start',
                  height: '50px',
                  ...(currentView === 'lineup' ? {
                    background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
                    color: '#000',
                    fontWeight: 700,
                  } : {
                    color: '#FFC107',
                    '&:hover': {
                      background: 'rgba(255, 193, 7, 0.1)',
                    }
                  }),
                },
                inner: {
                  justifyContent: 'flex-start',
                  width: '100%',
                },
              }}
            >
              Batting Order
            </Button>
            <Button
              variant={currentView === 'help' ? 'filled' : 'subtle'}
              color="yellow"
              leftSection={<IconHelp size={20} />}
              onClick={() => handleNavClick('help')}
              fullWidth
              size="md"
              styles={{
                root: {
                  justifyContent: 'flex-start',
                  height: '50px',
                  ...(currentView === 'help' ? {
                    background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
                    color: '#000',
                    fontWeight: 700,
                  } : {
                    color: '#FFC107',
                    '&:hover': {
                      background: 'rgba(255, 193, 7, 0.1)',
                    }
                  }),
                },
                inner: {
                  justifyContent: 'flex-start',
                  width: '100%',
                },
              }}
            >
              Help
            </Button>
          </Stack>
        </Drawer>
      )}

      <AppShell.Main style={{ scrollPaddingTop: isMobile ? '80px' : '150px', position: 'relative' }}>
        {!isMobile && !isTablet && (
          <div
            aria-hidden
            style={{
              position: 'fixed',
              inset: 0,
              backgroundImage: teamInfo.logo 
                ? `url(${teamInfo.logo})`
                : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext x='50%25' y='50%25' font-size='80' text-anchor='middle' dominant-baseline='middle'%3E⚾%3C/text%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'top center',
              backgroundSize: '100% auto',
              opacity: 0.01,
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
