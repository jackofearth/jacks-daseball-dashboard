import React from 'react';
import { AppShell, Group, Title, ActionIcon, Text, Image, Center, Anchor, ThemeIcon } from '@mantine/core';
import { IconHelp, IconUsers, IconGripVertical, IconPencil } from '@tabler/icons-react';
import { TeamInfo } from './StorageService';

interface AppLayoutProps {
  children: React.ReactNode;
  teamInfo: TeamInfo;
  activeSection: 'players' | 'lineup' | 'help';
  onSectionChange: (section: 'players' | 'lineup' | 'help') => void;
  onCustomizeTeam: () => void;
}

export function AppLayout({ children, teamInfo, activeSection, onSectionChange, onCustomizeTeam }: AppLayoutProps) {
  return (
    <AppShell
      header={{ height: 100 }}
      padding="md"
    >
      <AppShell.Header style={{ background: 'var(--mantine-color-dark-7)' }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Group gap="lg">
              {teamInfo.logo && (
                <Image
                  src={teamInfo.logo}
                  alt={`${teamInfo.name} logo`}
                  w={80}
                  h={80}
                  fit="contain"
                  style={{ 
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: '8px'
                  }}
                />
              )}
              <div>
                <Group gap="md" align="center">
                  <Title order={1} c="white" size="h2">
                    {teamInfo.name || 'Baseball Dashboard'}
                  </Title>
                  <ActionIcon
                    variant="subtle"
                    size="lg"
                    color="white"
                    onClick={onCustomizeTeam}
                    style={{ color: 'white' }}
                    title="Customize Team Info"
                  >
                    <IconPencil size={20} />
                  </ActionIcon>
                </Group>
              </div>
            </Group>
          </Group>
          
          <Center style={{ height: '100%', flex: 1 }}>
            <Group gap="xl">
              <Anchor
                href="#players"
                c="white"
                fw={activeSection === 'players' ? 700 : 500}
                style={{ 
                  textDecoration: 'none',
                  color: activeSection === 'players' ? 'var(--mantine-color-blue-4)' : 'white',
                  fontSize: '16px'
                }}
                onClick={() => onSectionChange('players')}
              >
                <Group gap="xs">
                  <ThemeIcon size="sm" radius="md" color="blue" variant="light">
                    <IconUsers size={16} />
                  </ThemeIcon>
                  Player Management
                </Group>
              </Anchor>
              
              <Anchor
                href="#lineup"
                c="white"
                fw={activeSection === 'lineup' ? 700 : 500}
                style={{ 
                  textDecoration: 'none',
                  color: activeSection === 'lineup' ? 'var(--mantine-color-orange-4)' : 'white',
                  fontSize: '16px'
                }}
                onClick={() => onSectionChange('lineup')}
              >
                <Group gap="xs">
                  <ThemeIcon size="sm" radius="md" color="orange" variant="light">
                    <IconGripVertical size={16} />
                  </ThemeIcon>
                  Batting Order
                </Group>
              </Anchor>
              
              <Anchor
                href="#help"
                c="white"
                fw={activeSection === 'help' ? 700 : 500}
                style={{ 
                  textDecoration: 'none',
                  color: activeSection === 'help' ? 'var(--mantine-color-green-4)' : 'white',
                  fontSize: '16px'
                }}
                onClick={() => onSectionChange('help')}
              >
                <Group gap="xs">
                  <ThemeIcon size="sm" radius="md" color="green" variant="light">
                    <IconHelp size={16} />
                  </ThemeIcon>
                  Help
                </Group>
              </Anchor>
            </Group>
          </Center>
        </Group>
      </AppShell.Header>

      <AppShell.Main style={{ scrollPaddingTop: '150px' }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
