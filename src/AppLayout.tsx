import React from 'react';
import { AppShell, Group, Title, ActionIcon, Image, Center, Anchor, ThemeIcon, Button, Tooltip } from '@mantine/core';
import { IconHelp, IconUsers, IconGripVertical, IconPencil, IconMail, IconCoffee, IconSettings, IconChartBar } from '@tabler/icons-react';
import { TeamInfo } from './StorageService';
import { BuyMeCoffeeHeaderButton } from './components/BuyMeCoffeeHeaderButton';

interface AppLayoutProps {
  children: React.ReactNode;
  teamInfo: TeamInfo;
  activeSection: 'players' | 'lineup' | 'help';
  onSectionChange: (section: 'players' | 'lineup' | 'help') => void;
  onCustomizeTeam: () => void;
  currentView?: string;
  setCurrentView?: (view: string) => void;
  setShowTeamSettings?: (show: boolean) => void;
}

export function AppLayout({ children, teamInfo, activeSection, onSectionChange, onCustomizeTeam, currentView, setCurrentView, setShowTeamSettings }: AppLayoutProps) {
  return (
    <AppShell
      header={{ height: 100 }}
      padding="md"
    >
      <AppShell.Header h={70}>
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
          {/* Left: Team Branding */}
          <Group gap="md" style={{ minWidth: '280px' }}>
            {teamInfo.logo && (
              <Image 
                src={teamInfo.logo}
                alt="Team Logo" 
                h={50} 
                w={50}
                fit="contain"
              />
            )}
            <div>
              <Title 
                order={2} 
                size="h3"
                style={{ 
                  color: '#FFC107',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {teamInfo.location || ''}
              </Title>
              <Title 
                order={3} 
                size="h2"
                style={{ 
                  color: '#FFC107',
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                  fontWeight: 800
                }}
              >
                {teamInfo.name || 'My team name'}
              </Title>
            </div>
            
            {/* Settings icon instead of pencil */}
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={() => setShowTeamSettings?.(true)}
            >
              <IconSettings size={18} />
            </ActionIcon>
          </Group>

          {/* Center: Main Navigation */}
          <Group gap="lg" style={{ flex: 1, justifyContent: 'center' }}>
            <Button
              variant="subtle"
              leftSection={<IconUsers size={18} />}
              onClick={() => setCurrentView?.('players')}
              size="md"
              styles={{
                root: {
                  color: currentView === 'players' ? '#FFC107' : '#fff',
                  fontWeight: currentView === 'players' ? 600 : 400,
                  '&:hover': {
                    background: 'rgba(255, 193, 7, 0.1)',
                  },
                },
              }}
            >
              Player Management
            </Button>
            
            <Button
              variant="subtle"
              leftSection={<IconChartBar size={18} />}
              onClick={() => setCurrentView?.('lineup')}
              size="md"
              styles={{
                root: {
                  color: currentView === 'lineup' ? '#FFC107' : '#fff',
                  fontWeight: currentView === 'lineup' ? 600 : 400,
                  '&:hover': {
                    background: 'rgba(255, 193, 7, 0.1)',
                  },
                },
              }}
            >
              Batting Order
            </Button>
            
            <Button
              variant="subtle"
              leftSection={<IconHelp size={18} />}
              onClick={() => setCurrentView?.('help')}
              size="md"
              styles={{
                root: {
                  color: currentView === 'help' ? '#FFC107' : '#fff',
                  fontWeight: currentView === 'help' ? 600 : 400,
                  '&:hover': {
                    background: 'rgba(255, 193, 7, 0.1)',
                  },
                },
              }}
            >
              Help
            </Button>
          </Group>

          {/* Right: Utility Actions */}
          <Group gap="sm" style={{ minWidth: '150px', justifyContent: 'flex-end' }}>
            {/* Contact Icon */}
            <Tooltip label="Contact support" position="bottom" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={() => window.open('mailto:your@email.com')}
              >
                <IconMail size={22} />
              </ActionIcon>
            </Tooltip>
            
            {/* Coffee Button - More Subtle */}
            <Tooltip label="Support development ☕" position="bottom" withArrow>
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

      <AppShell.Main style={{ scrollPaddingTop: '150px' }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
