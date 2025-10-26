import React from 'react';
import { Container, Title, Text, Stack, Group, Image, ActionIcon, Button } from '@mantine/core';
import { IconChartBar, IconUsers, IconTrophy, IconX } from '@tabler/icons-react';
import PrismaticBurst from '../components/PrismaticBurst';
import './HeroLanding.css';

interface HeroLandingProps {
  onGetStarted: () => void;
  teamInfo: {
    name?: string;
    logo?: string;
    location?: string;
  };
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onGetStarted, teamInfo }) => {
  return (
    <div className="hero-landing">
      <PrismaticBurst
        animationType="rotate3d"
        intensity={3.6}
        speed={0.15}
        distort={0}
        paused={false}
        offset={{ x: 0, y: 0 }}
        hoverDampness={0.25}
        rayCount={0}
        mixBlendMode="lighten"
        colors={['#870a8a', '#ff7300', '#79024d']}
      />
      {/* Skip Button */}
      <ActionIcon
        variant="subtle"
        color="gray"
        size="lg"
        onClick={onGetStarted}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          color: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <IconX size={24} />
      </ActionIcon>

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl" py={80}>
          {/* Logo */}
          {teamInfo.logo && (
            <Image
              src={teamInfo.logo}
              alt={`${teamInfo.name} logo`}
              w={160}
              h={160}
              fit="contain"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 193, 7, 0.5))',
              }}
            />
          )}

              {/* Main Heading */}
              <Stack align="center" gap="md">
                <Title
                  order={1}
                  size={56}
                  fw={800}
                  style={{
                    textAlign: 'center',
                    background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    textShadow: '0 2px 10px rgba(255, 193, 7, 0.3)',
                  }}
                >
                  Lineup Star
                </Title>
                
                <Text
                  size="xl"
                  c="dimmed"
                  fw={500}
                  style={{
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#FFC107',
                  }}
                >
                  Your Best Lineup, Backed by Data
                </Text>
              </Stack>

              {/* Value Proposition */}
              <Text
                size="lg"
                c="white"
                maw={600}
                style={{ textAlign: 'center', lineHeight: 1.6 }}
              >
                No more gut feelings or spreadsheet headaches. Import your GameChanger stats, 
                get a proven batting order, export a professional lineup card. Done.
              </Text>

              {/* CTA Button - Overlaid on PrismaticBurst */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <Button
                  size="lg"
                  variant="filled"
                  color="yellow"
                  onClick={onGetStarted}
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    padding: '16px 48px',
                    background: 'linear-gradient(45deg, #FFC107, #FFD54F)',
                    border: 'none',
                    borderRadius: '25px',
                    boxShadow: '0 4px 20px rgba(255, 193, 7, 0.4), 0 0 30px rgba(255, 193, 7, 0.2)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Get Started
                </Button>
              </div>

              {/* Feature Highlights */}
              <Group gap={50} mt={40}>
                <Stack align="center" gap="xs">
                  <IconChartBar size={40} color="#FFC107" />
                  <Text fw={600} c="white">Smart Algorithms</Text>
                </Stack>
                
                <Stack align="center" gap="xs">
                  <IconUsers size={40} color="#FFC107" />
                  <Text fw={600} c="white">Import in Seconds</Text>
                </Stack>
                
                <Stack align="center" gap="xs">
                  <IconTrophy size={40} color="#FFC107" />
                  <Text fw={600} c="white">Professional PDFs</Text>
                </Stack>
              </Group>
        </Stack>
      </Container>
    </div>
  );
};
