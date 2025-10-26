import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  List,
  ThemeIcon,
  Alert,
  Anchor,
  Divider,
  Card,
  Group,
  Badge,
  Accordion,
  Box,
  Affix,
  Button,
  NavLink,
  Image
} from '@mantine/core';
import {
  IconCheck,
  IconInfoCircle,
  IconQuestionMark,
  IconChartBar,
  IconTarget,
  IconBolt,
  IconAlertTriangle,
  IconX,
  IconUsers,
  IconGripVertical,
  IconHelp,
  IconCoffee
} from '@tabler/icons-react';

const HelpPage: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const btn = document.getElementById('back-to-top-btn');
      if (btn) {
        btn.style.display = window.scrollY > 300 ? 'block' : 'none';
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Affix position={{ bottom: 20, right: 20 }}>
        <Button
          id="back-to-top-btn"
          variant="filled"
          color="blue"
          size="sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            display: 'none', // Hidden by default, shown via scroll handler
          }}
        >
          ↑ Top
        </Button>
      </Affix>
      <Container size="xl" py="xl">
        <Stack gap="xl">
        {/* Header */}
        <Paper p="xl" withBorder style={{
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%)',
          borderColor: 'rgba(255, 193, 7, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Group justify="center" mb="md">
            <ThemeIcon 
              size="xl" 
              radius="xl" 
              color="blue" 
              variant="light"
              style={{
                boxShadow: '0 0 15px rgba(255, 193, 7, 0.4)',
              }}
            >
              <IconHelp size={32} />
            </ThemeIcon>
          </Group>
          <Title 
            order={1} 
            ta="center" 
            mb="md"
            style={{
              color: '#FFC107',
              textShadow: '0 0 15px rgba(255, 193, 7, 0.4)',
              letterSpacing: '0.5px',
            }}
          >
            Batting Order Help
          </Title>
          <Text ta="center" c="dimmed" size="lg">
            Everything you need to know about optimizing your team's batting order
          </Text>
        </Paper>

        {/* Quick Navigation */}
        <Card withBorder p="lg" style={{
          background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%)',
          borderColor: 'rgba(255, 193, 7, 0.15)',
        }}>
          <Title 
            order={2} 
            mb="md" 
            style={{
              color: '#FFC107',
              textShadow: '0 0 10px rgba(255, 193, 7, 0.3)',
              letterSpacing: '0.3px',
            }}
          >
            Quick Navigation
          </Title>
          <Stack gap="xs">
            <NavLink
              label="Getting Started"
              leftSection={<IconCheck size={16} />}
              childrenOffset={28}
            >
              <NavLink 
                label="Quick Start Guide" 
                href="#quick-start"
                leftSection={<IconCheck size={14} />}
              />
              <NavLink 
                label="FAQ" 
                href="#common-questions"
                leftSection={<IconQuestionMark size={14} />}
                c="red"
                onClick={() => {
                  const element = document.getElementById('common-questions');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              />
            </NavLink>
            
            <NavLink
              label="Strategies"
              leftSection={<IconTarget size={16} />}
              childrenOffset={28}
            >
              <NavLink 
                label="Modern Baseball Consensus" 
                href="#modern-baseball"
                leftSection={<IconChartBar size={14} />}
                c="blue"
              />
              <NavLink 
                label="Situational Analytics" 
                href="#situational-analytics"
                leftSection={<IconTarget size={14} />}
                c="red"
              />
              <NavLink 
                label="Confidence System" 
                href="#confidence-system"
                leftSection={<IconBolt size={14} />}
                c="orange"
              />
              <NavLink 
                label="Manual Adjustments" 
                href="#manual-adjustments"
                leftSection={<IconGripVertical size={14} />}
                c="blue"
              />
            </NavLink>
            
            <NavLink 
              label="Stats Glossary" 
              href="#baseball-stats-glossary"
              leftSection={<IconInfoCircle size={16} />}
              c="violet"
            />
          </Stack>
        </Card>

        {/* Quick Start Guide */}
        <Card id="quick-start" withBorder p="lg" style={{ scrollMarginTop: '120px' }}>
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="blue" variant="light">
              <IconCheck size={20} />
            </ThemeIcon>
            <Title order={2}>Quick Start Guide</Title>
          </Group>
          
          <List size="lg" spacing="md" mb="lg">
            <List.Item icon={<IconUsers size={16} />}>
              <Text fw={500}>Upload your <Anchor href="https://gc.com/" target="_blank">GameChanger</Anchor> CSV</Text>
              <Text size="sm" c="dimmed">Import your team's stats in seconds OR manually add players</Text>
            </List.Item>
            <List.Item icon={<IconTarget size={16} />}>
              <Text fw={500}>Choose strategy and click "Generate Batting Order"</Text>
              <Text size="sm" c="dimmed">Select Modern Baseball Consensus for data-driven approach or Situational Analytics for advanced optimization, then click the green "Generate Batting Order" button</Text>
            </List.Item>
            <List.Item icon={<IconGripVertical size={16} />}>
              <Text fw={500}>Make adjustments</Text>
              <Text size="sm" c="dimmed">Drag players to different positions, remove players with the trash icon, or use the red "Clear Order" button to start over</Text>
            </List.Item>
            <List.Item icon={<IconChartBar size={16} />}>
              <Text fw={500}>Export for game day</Text>
              <Text size="sm" c="dimmed">Export a PDF lineup card</Text>
            </List.Item>
          </List>
          
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              <Text fw={500} component="span">New to the app?</Text> Start with Modern Baseball Consensus strategy - it's data-driven and proven.
            </Text>
          </Alert>
        </Card>

        {/* FAQ */}
        <Card id="common-questions" withBorder p="lg" style={{ scrollMarginTop: '120px' }}>
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="red" variant="light">
              <IconQuestionMark size={20} />
            </ThemeIcon>
            <Title order={2} c="red">Frequently Asked Questions</Title>
          </Group>
          
          <Accordion variant="separated">
            <Accordion.Item value="why-created">
              <Accordion.Control>
                <Text fw={500}>Why did I create this app?</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text>There's no reason teams who play for fun or juniors shouldn't benefit from all the advanced stats we have at our fingertips. Why base your lineup on vibes when you can base it on cold hard stats?</Text>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="best-hitter-3rd">
              <Accordion.Control>
                <Text fw={500}>Why is my best hitter batting 3rd instead of 4th?</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text>The 3rd spot gets more at-bats over a season. Your best hitter will have more opportunities to impact the game.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="struggling-player">
              <Accordion.Control>
                <Text fw={500}>What if a player has great stats but I know they're struggling recently?</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text>Use the exclude feature (✕) to remove them temporarily, or manually move them down in the order.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="regenerate-frequency">
              <Accordion.Control>
                <Text fw={500}>How often should I regenerate my lineup?</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text>With this app, you can regenerate as often as you like - every game if you have the stats! Previously coaches might update lineups every 3-4 games, but now you can optimize based on the most current performance data available.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="slow-leadoff">
              <Accordion.Control>
                <Text fw={500}>What if the algorithm puts a slow player in leadoff?</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text>The Modern Baseball Consensus algorithm prioritizes getting on base. If you want speed emphasis, try Situational Analytics or manually adjust.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="csv-import">
              <Accordion.Control>
                <Text fw={500}>My CSV import isn't working - what's wrong?</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text>This app accepts all GameChanger CSV exports. While GameChanger allows CSV exports of selected games, full season stats exports are recommended for this app to ensure the confidence system works properly. For help exporting your stats from GameChanger, see their instructions <Anchor href="https://help.gc.com/hc/en-us/articles/360043583651-Exporting-Season-Stats" target="_blank">here</Anchor>.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="age-groups">
              <Accordion.Control>
                <Text fw={500}>Can I use this for different age groups?</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text>Yes! Modern Baseball Consensus works well for all levels. Situational Analytics is especially effective for younger players where small-ball tactics matter more.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="disagree-lineup">
              <Accordion.Control>
                <Text fw={500}>What if I don't agree with the lineup?</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text>The algorithm provides a data-driven starting point, but you know things about your players that the strategy doesn't. Use it as a guide, then make adjustments based on team chemistry, matchups, and your coaching instincts.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="algorithm-accuracy">
              <Accordion.Control>
                <Text fw={500}>How accurate are these algorithms?</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text>They're based on modern analytical consensus (Modern Baseball Consensus) and advanced situational metrics (Situational Analytics). They optimize for statistical probability, but baseball is still a game where anything can happen.</Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card>

        <Divider />

        {/* Strategy Sections */}
        <Title 
          id="strategies" 
          order={1} 
          ta="center" 
          mb="xl"
          style={{
            color: '#FFC107',
            textShadow: '0 0 15px rgba(255, 193, 7, 0.4)',
            letterSpacing: '0.5px',
          }}
        >
          Batting Order Strategies
        </Title>

        {/* Modern Baseball Consensus Strategy */}
        <Card id="modern-baseball" withBorder p="lg" style={{ scrollMarginTop: '120px' }}>
          <Group mb="md">
            <Image
              src="/mlblogo.png"
              alt="Baseball Logo"
              w={60}
              h={45}
              fit="contain"
            />
            <Title order={2} c="blue">Modern Baseball Consensus</Title>
          </Group>
          
          <Box mb="lg">
            <Title order={3} mb="sm">Why this strategy?</Title>
            <List size="md" spacing="xs">
              <List.Item>Based on current baseball optimization strategies.</List.Item>
              <List.Item>Easy to understand and explain to players & parents.</List.Item>
            </List>
          </Box>

          <Box>
            <Title order={3} mb="sm">The Logic:</Title>
            <List size="md" spacing="xs">
              <List.Item><Text fw={500} component="span">1st batter:</Text> Gets on base consistently</List.Item>
              <List.Item><Text fw={500} component="span">2nd batter:</Text> Elite overall hitter</List.Item>
              <List.Item><Text fw={500} component="span">3rd batter:</Text> Third-best overall hitter</List.Item>
              <List.Item><Text fw={500} component="span">4th batter:</Text> Best power hitter</List.Item>
              <List.Item><Text fw={500} component="span">5th batter:</Text> Second-best power hitter</List.Item>
              <List.Item><Text fw={500} component="span">6th-9th:</Text> Good hitting and on-base ability</List.Item>
            </List>
          </Box>
        </Card>

        {/* Situational Analytics Strategy */}
        <Card id="situational-analytics" withBorder p="lg" style={{ scrollMarginTop: '120px' }}>
          <Group mb="md">
            <Image
              src="/situational2.jpg"
              alt="Situational Strategy Logo"
              w={60}
              h={45}
              fit="contain"
            />
            <Title order={2} c="red">Situational Analytics</Title>
          </Group>
          
          <Box mb="lg">
            <Title order={3} mb="sm">Why this strategy?</Title>
            <List size="md" spacing="xs">
              <List.Item>Maximizes situational play by using game theory and a finely-tuned balance of advanced metrics.</List.Item>
              <List.Item>Especially effective for lower-level teams and youth teams where games often come down to small ball situations like moving runners, avoiding strikeouts, and capitalizing on defensive mistakes.</List.Item>
            </List>
          </Box>

          <Box>
            <Title order={3} mb="sm">The Logic:</Title>
            <List size="md" spacing="xs">
              <List.Item><Text fw={500} component="span">1st batter:</Text> Gets on base AND can steal</List.Item>
              <List.Item><Text fw={500} component="span">2nd batter:</Text> Makes contact in clutch situations</List.Item>
              <List.Item><Text fw={500} component="span">3rd batter:</Text> Balanced hitter with power and situational awareness</List.Item>
              <List.Item><Text fw={500} component="span">4th batter:</Text> Drives in runs when it matters</List.Item>
              <List.Item><Text fw={500} component="span">5th-9th:</Text> Good hitting and on-base ability</List.Item>
            </List>
          </Box>
        </Card>

        {/* Confidence System */}
        <Card id="confidence-system" withBorder p="lg" style={{ scrollMarginTop: '120px' }}>
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="orange" variant="light">
              <IconBolt size={20} />
            </ThemeIcon>
            <Title order={2} c="orange">Confidence System</Title>
          </Group>
          
          <Text size="lg" mb="md">
            You might have noticed the symbols next to some players' names. This is our confidence system, and here's why it matters:
          </Text>

          <Text size="md" mb="md">
            A player who goes 2-for-3 in one game looks like a .667 hitter, but that doesn't mean they're better than your .350 hitter who's played 20 games. Small sample sizes can be misleading.
          </Text>

          <Text size="md" mb="lg">
            With this system in place, your experienced players don't get unfairly bumped down the order by someone who just had one or two lucky at-bats.
          </Text>

          <Text fw={500} size="lg" mb="md">Here's what the symbols mean:</Text>

        <Stack gap="sm">
          <Group>
            <Badge size="lg" variant="light" color="green">High Confidence</Badge>
            <Text size="sm" c="dimmed">(15+ plate appearances): We trust these stats - they've played enough for the numbers to be reliable</Text>
          </Group>
          <Group>
            <Badge size="lg" variant="light" color="yellow" leftSection={<IconBolt size={12} />}>Medium Confidence</Badge>
            <Text size="sm" c="dimmed">(8-14 plate appearances): Pretty good idea of their ability, but we apply a 15% penalty to account for the smaller sample size</Text>
          </Group>
          <Group>
            <Badge size="lg" variant="light" color="orange" leftSection={<IconAlertTriangle size={12} />}>Low Confidence</Badge>
            <Text size="sm" c="dimmed">(4-7 plate appearances): Take these stats with a grain of salt - we apply a 30% penalty because the numbers might not reflect their true ability yet</Text>
          </Group>
          <Group>
            <Badge size="lg" variant="light" color="red" leftSection={<IconX size={12} />}>Excluded</Badge>
            <Text size="sm" c="dimmed">(Under 4 plate appearances): Not enough data to make any reliable assessment - these players are filtered out of the batting order by default, but can be manually added back</Text>
          </Group>
        </Stack>
        </Card>

        {/* Manual Adjustments */}
        <Card id="manual-adjustments" withBorder p="lg" style={{ scrollMarginTop: '120px' }}>
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="blue" variant="light">
              <IconTarget size={20} />
            </ThemeIcon>
            <Title order={2} c="blue">Making Manual Adjustments</Title>
          </Group>
          
          <Text size="lg" mb="md" fw={500}>
            The algorithms are smart, but you know your team best.
          </Text>
          
          <Stack gap="md">
            <Box>
              <Title order={3} mb="sm">Common Override Situations:</Title>
              <List size="md" spacing="xs">
                <List.Item>Player returning from injury (exclude them until they're back to form)</List.Item>
                <List.Item>Matchup advantages (lefty vs righty pitcher preferences)</List.Item>
                <List.Item>Player availability (can't make today's game)</List.Item>
                <List.Item>Team chemistry (separating players who don't work well together)</List.Item>
                <List.Item>Defensive positioning needs</List.Item>
              </List>
            </Box>
            
            <Box>
              <Title order={3} mb="sm">How to Override:</Title>
              <List size="md" spacing="xs">
                <List.Item><Text fw={500} component="span">Drag and drop</Text> players to different batting positions</List.Item>
                <List.Item><Text fw={500} component="span">Exclude players</Text> using the ✕ button (removes from algorithm completely)</List.Item>
                <List.Item><Text fw={500} component="span">Manual additions</Text> - click their name at the bottom to add back excluded players</List.Item>
              </List>
            </Box>
          </Stack>
        </Card>

        {/* Baseball Stats Glossary */}
        <Card id="baseball-stats-glossary" withBorder p="lg" style={{ scrollMarginTop: '120px' }}>
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="violet" variant="light">
              <IconChartBar size={20} />
            </ThemeIcon>
            <Title order={2} c="violet">Baseball Stats Glossary</Title>
          </Group>
          <Text c="dimmed" size="md" mb="lg" fs="italic">
            The nerdy engine that powers our strategies
          </Text>
          
          <Accordion variant="separated">
            <Accordion.Item value="basic-stats">
              <Accordion.Control>
                <Title order={3}>Basic Hitting Stats</Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Box>
                    <Text fw={500} size="md" mb="xs">AVG (Batting Average)</Text>
                    <Text size="sm" c="dimmed">How often a player gets a hit. Just hits divided by at-bats. .300 is really good, anything under .200 is pretty rough.</Text>
                  </Box>
                  <Box>
                    <Text fw={500} size="md" mb="xs">OBP (On-Base Percentage)</Text>
                    <Text size="sm" c="dimmed">How often a player reaches base safely - includes hits, walks, and getting hit by pitches. Good players get on base about 40% of the time.</Text>
                  </Box>
                  <Box>
                    <Text fw={500} size="md" mb="xs">SLG (Slugging Percentage)</Text>
                    <Text size="sm" c="dimmed">Measures power hitting. Singles count as 1, doubles as 2, triples as 3, home runs as 4. Higher numbers mean more extra-base hits.</Text>
                  </Box>
                  <Box>
                    <Text fw={500} size="md" mb="xs">OPS (On-Base Plus Slugging)</Text>
                    <Text size="sm" c="dimmed">Just adds OBP and SLG together. It's a quick way to see if someone's a good overall hitter. Over 1.000 is elite territory.</Text>
                  </Box>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="advanced-stats">
              <Accordion.Control>
                <Title order={3}>Advanced Stats</Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Box>
                    <Text fw={500} size="md" mb="xs">Contact% (Contact Percentage)</Text>
                    <Text size="sm" c="dimmed">How often a player makes contact when they swing. High contact hitters are usually more consistent - they don't strike out much.</Text>
                  </Box>
                  <Box>
                    <Text fw={500} size="md" mb="xs">SB% (Stolen Base Percentage)</Text>
                    <Text size="sm" c="dimmed">Success rate for stealing bases. You need to succeed about 75% of the time to actually help your team.</Text>
                  </Box>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="clutch-hitting">
              <Accordion.Control>
                <Title order={3}>Clutch Hitting</Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Box>
                    <Text fw={500} size="md" mb="xs">BA/RISP (Batting Average with Runners in Scoring Position)</Text>
                    <Text size="sm" c="dimmed">How well someone hits when runners are on second or third base - the spots where they can actually score on a single.</Text>
                  </Box>
                  <Box>
                    <Text fw={500} size="md" mb="xs">QAB% (Quality At-Bat Percentage)</Text>
                    <Text size="sm" c="dimmed">Percentage of "good" at-bats - getting hits, walks, moving runners over, or at least making the pitcher work hard.</Text>
                  </Box>
                  <Box>
                    <Text fw={500} size="md" mb="xs">Two-Out RBI</Text>
                    <Text size="sm" c="dimmed">Driving in runs with two outs already - when it's do-or-die time and you're the team's last chance to score.</Text>
                  </Box>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="power-numbers">
              <Accordion.Control>
                <Title order={3}>Power Numbers</Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Box>
                    <Text fw={500} size="md" mb="xs">HR (Home Runs)</Text>
                    <Text size="sm" c="dimmed">Hit it over the fence, trot around the bases. Pretty self-explanatory.</Text>
                  </Box>
                  <Box>
                    <Text fw={500} size="md" mb="xs">XBH (Extra-Base Hits)</Text>
                    <Text size="sm" c="dimmed">Any hit that gets you past first base - doubles, triples, and home runs. Shows gap power and ability to drive the ball.</Text>
                  </Box>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card>
        
        {/* Support Section */}
        <Card 
          withBorder 
          p="xl" 
          style={{ 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(255, 152, 0, 0.08) 100%)',
            borderColor: 'rgba(255, 193, 7, 0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack gap="md" align="center">
            <Group>
              <IconCoffee size={40} color="#FFC107" />
              <Title order={3}>Enjoying Lineup Star?</Title>
            </Group>
            <Text c="dimmed" maw={500}>
              If you find Lineup Star valuable, consider buying me a coffee to support continued development!
            </Text>
            <Button
              leftSection={<IconCoffee size={16} />}
              onClick={() => window.open('https://www.buymeacoffee.com/jackofearth', '_blank')}
              size="lg"
              style={{
                background: 'linear-gradient(45deg, #FFDD00, #FFC107)',
                color: '#000',
                fontWeight: 600,
              }}
            >
              Buy Me a Coffee
            </Button>
            <Text size="xs" c="dimmed">
              Your support helps keep this tool constantly improving.
            </Text>
          </Stack>
        </Card>
        </Stack>
      </Container>
    </>
  );
};

export default HelpPage;
