import React from 'react';
import { Button, ActionIcon, Tooltip, useMantineTheme } from '@mantine/core';
import { IconCoffee } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

export const BuyMeCoffeeHeaderButton: React.FC = () => {
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  const handleClick = () => {
    // Track click
    const clicks = parseInt(localStorage.getItem('coffeeButtonClicks') || '0', 10);
    localStorage.setItem('coffeeButtonClicks', (clicks + 1).toString());
    
    // Open Buy Me a Coffee page in new tab
    window.open('https://www.buymeacoffee.com/jackofearth', '_blank');
  };

  // Desktop: Show button with text
  if (isDesktop) {
    return (
      <Button
        leftSection={<IconCoffee size={16} />}
        onClick={handleClick}
        variant="light"
        color="yellow"
        size="sm"
        style={{
          transition: 'all 0.2s ease',
        }}
        styles={{
          root: {
            '&:hover': {
              transform: 'translateY(-2px)',
            },
          },
        }}
      >
        Buy Me a Coffee
      </Button>
    );
  }

  // Mobile: Show icon only
  return (
    <Tooltip label="Support ☕" position="bottom" withArrow>
      <ActionIcon
        onClick={handleClick}
        size="lg"
        variant="subtle"
        color="yellow"
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
        <IconCoffee size={20} />
      </ActionIcon>
    </Tooltip>
  );
};
