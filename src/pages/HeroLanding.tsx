import React from 'react';
import { Container, Title, Text, Stack, Group, Image, Button } from '@mantine/core';
import { TeamInfo } from '../StorageService';
import { HeroTeamCustomizer } from '../components/HeroTeamCustomizer';
import { IconChartBar, IconUsers, IconTrophy } from '@tabler/icons-react';
import PrismaticBurst from '../components/PrismaticBurst';
import './HeroLanding.css';

interface HeroLandingProps {
  onGetStarted: () => void;
  teamInfo: TeamInfo;
  onTeamInfoChange: (teamInfo: TeamInfo) => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onGetStarted, teamInfo, onTeamInfoChange }) => {
  const [showCustomize, setShowCustomize] = React.useState(false);

  const handlePrimaryCTA = () => {
    setShowCustomize(true);
  };

  const handleReady = (updated: TeamInfo) => {
    onTeamInfoChange(updated);
    onGetStarted();
  };

  const handleLater = () => {
    onGetStarted();
  };
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

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl" py={80}>

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
                  Your Best Batting Order, Backed by Data
                </Text>
              </Stack>

              {/* Value Proposition */}
              <Text
                size="lg"
                c="white"
                maw={600}
                style={{ textAlign: 'center', lineHeight: 1.6 }}
              >
                No more guesswork or spreadsheet headaches.<br />
                Import your GameChanger stats, 
                customise your data-driven batting order, export a dugout-ready lineup card. Boom.
              </Text>

              {/* CTA Button - Overlaid on PrismaticBurst */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <Button
                  size="lg"
                  variant="filled"
                  color="yellow"
                  onClick={handlePrimaryCTA}
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
                  Let's Go!
                </Button>
              </div>

              {/* Feature Highlights */}
              <Group gap={50} mt={40}>
                <Stack align="center" gap="xs">
                  <IconUsers size={40} color="#FFC107" />
                  <Text fw={600} c="white">Import in Seconds</Text>
                </Stack>
                
                <Stack align="center" gap="xs">
                  <IconChartBar size={40} color="#FFC107" />
                  <Text fw={600} c="white">Smart Algorithms</Text>
                </Stack>
                
                <Stack align="center" gap="xs">
                  <IconTrophy size={40} color="#FFC107" />
                  <Text fw={600} c="white">Easy Lineup Cards</Text>
                </Stack>
              </Group>
        </Stack>
      </Container>
      <HeroTeamCustomizer
        isOpen={showCustomize}
        onReady={handleReady}
        onLater={handleLater}
        teamInfo={teamInfo}
      />
    </div>
  );
};
