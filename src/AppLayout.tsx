import React from 'react';
import { AppShell, Burger, Group, Title, ActionIcon, Text, Avatar, Stack, NavLink, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHelp, IconUsers, IconGripVertical, IconPencil } from '@tabler/icons-react';
import { TeamInfo } from './StorageService';

interface AppLayoutProps {
  children: React.ReactNode;
  teamInfo: TeamInfo;
  activeSection: 'players' | 'lineup' | 'help';
  onSectionChange: (section: 'players' | 'lineup' | 'help') => void;
  onCustomizeTheme: () => void;
}

export function AppLayout({ children, teamInfo, activeSection, onSectionChange, onCustomizeTheme }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 100 }}
      navbar={{ 
        width: 300, 
        breakpoint: 'sm', 
        collapsed: { mobile: !opened } 
      }}
      padding="md"
    >
      <AppShell.Header style={{ background: 'var(--mantine-color-dark-7)' }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="white" />
            <Group gap="lg">
              {teamInfo.logo && (
                <Avatar
                  src={teamInfo.logo}
                  alt={`${teamInfo.name} logo`}
                  size="xl"
                  radius="md"
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
                    onClick={onCustomizeTheme}
                    style={{ color: 'white' }}
                    title="Customize Theme"
                  >
                    <IconPencil size={20} />
                  </ActionIcon>
                </Group>
                {teamInfo.location && (
                  <Text size="md" c="dimmed" fw={500}>
                    {teamInfo.location}
                  </Text>
                )}
              </div>
            </Group>
          </Group>
          
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ backgroundColor: '#0a0f1c' }}>
        <Stack gap="xs">
          
          <NavLink
            href="#players"
            label="Player Management"
            leftSection={
              <ThemeIcon size="md" radius="md" color="blue" variant="light">
                <IconUsers size={18} />
              </ThemeIcon>
            }
            active={activeSection === 'players'}
            onClick={() => onSectionChange('players')}
            style={{ borderRadius: '8px', marginBottom: '4px' }}
          />
          
          <NavLink
            href="#lineup"
            label="Batting Order"
            leftSection={
              <ThemeIcon size="md" radius="md" color="orange" variant="light">
                <IconGripVertical size={18} />
              </ThemeIcon>
            }
            active={activeSection === 'lineup'}
            onClick={() => onSectionChange('lineup')}
            style={{ borderRadius: '8px', marginBottom: '4px' }}
          />
          
          <NavLink
            href="#help"
            label="Help"
            leftSection={
              <ThemeIcon size="md" radius="md" color="orange" variant="light">
                <IconHelp size={18} />
              </ThemeIcon>
            }
            active={activeSection === 'help'}
            onClick={() => onSectionChange('help')}
            style={{ borderRadius: '8px', marginBottom: '4px' }}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
