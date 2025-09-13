import React from 'react';
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
  NavLink
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
  IconHelp
} from '@tabler/icons-react';

const HelpPage: React.FC = () => {
  return (
    <>
      <Affix position={{ top: 20, right: 20 }}>
        <Button
          variant="filled"
          color="blue"
          size="sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to Top
        </Button>
      </Affix>
      <Container size="xl" py="xl">
        <Stack gap="xl">
        {/* Header */}
        <Paper p="xl" withBorder>
          <Group justify="center" mb="md">
            <ThemeIcon size="xl" radius="xl" color="blue" variant="light">
              <IconHelp size={32} />
            </ThemeIcon>
          </Group>
          <Title order={1} ta="center" mb="md">
            Batting Order Help
          </Title>
          <Text ta="center" c="dimmed" size="lg">
            Everything you need to know about optimizing your team's batting order
          </Text>
        </Paper>

        {/* Quick Navigation */}
        <Card withBorder p="lg">
          <Title order={2} mb="md" c="blue">
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
                label="Manual Adjustments" 
                href="#manual-adjustments"
                leftSection={<IconGripVertical size={14} />}
              />
              <NavLink 
                label="FAQ" 
                href="#common-questions"
                leftSection={<IconQuestionMark size={14} />}
              />
            </NavLink>
            
            <NavLink
              label="Strategies"
              leftSection={<IconTarget size={16} />}
              childrenOffset={28}
            >
              <NavLink 
                label="Traditional Baseball" 
                href="#traditional-mlb"
                leftSection={<IconChartBar size={14} />}
              />
              <NavLink 
                label="Situational Analytics" 
                href="#situational-analytics"
                leftSection={<IconTarget size={14} />}
              />
              <NavLink 
                label="Confidence System" 
                href="#confidence-system"
                leftSection={<IconBolt size={14} />}
              />
            </NavLink>
            
            <NavLink
              label="Reference"
              leftSection={<IconInfoCircle size={16} />}
              childrenOffset={28}
            >
              <NavLink 
                label="Stats Glossary" 
                href="#baseball-stats-glossary"
                leftSection={<IconInfoCircle size={14} />}
              />
            </NavLink>
          </Stack>
        </Card>

        {/* Quick Start Guide */}
        <Card id="quick-start" withBorder p="lg">
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
              <Text size="sm" c="dimmed">Select Traditional Baseball for proven approach or Situational Analytics for advanced optimization, then click the green "Generate Batting Order" button</Text>
            </List.Item>
            <List.Item icon={<IconGripVertical size={16} />}>
              <Text fw={500}>Make adjustments</Text>
              <Text size="sm" c="dimmed">Drag players to different positions, remove players with the trash icon, or use the red "Clear Order" button to start over</Text>
            </List.Item>
            <List.Item icon={<IconChartBar size={16} />}>
              <Text fw={500}>Export for game day</Text>
              <Text size="sm" c="dimmed">Export a PDF or print your professional lineup card</Text>
            </List.Item>
          </List>
          
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              <Text fw={500} component="span">New to the app?</Text> Start with Traditional Baseball strategy - it's simple and proven.
            </Text>
          </Alert>
        </Card>

        {/* Manual Adjustments */}
        <Card id="manual-adjustments" withBorder p="lg">
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

        {/* FAQ */}
        <Card id="common-questions" withBorder p="lg">
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
                <Text>The Traditional Baseball algorithm prioritizes getting on base. If you want speed emphasis, try Situational Analytics or manually adjust.</Text>
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
                <Text>Yes! Traditional Baseball works well for all levels. Situational Analytics is especially effective for younger players where small-ball tactics matter more.</Text>
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
                <Text>They're based on proven baseball strategy (Traditional Baseball) and modern analytics (Situational). They optimize for statistical probability, but baseball is still a game where anything can happen.</Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card>

        <Divider />

        {/* Strategy Sections */}
        <Title id="strategies" order={1} ta="center" mb="xl">
          Batting Order Strategies
        </Title>

        {/* Traditional MLB Strategy */}
        <Card id="traditional-mlb" withBorder p="lg">
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="blue" variant="light">
              <IconChartBar size={20} />
            </ThemeIcon>
            <Title order={2} c="blue">Traditional Baseball Strategy</Title>
          </Group>
          
          <Box mb="lg">
            <Title order={3} mb="sm">Why this strategy?</Title>
            <List size="md" spacing="xs">
              <List.Item>A simple, proven approach used at the highest levels of baseball.</List.Item>
            </List>
          </Box>

          <Box>
            <Title order={3} mb="sm">The Logic:</Title>
            <List size="md" spacing="xs">
              <List.Item><Text fw={500} component="span">1st batter:</Text> Best at getting on base (starts rallies)</List.Item>
              <List.Item><Text fw={500} component="span">2nd batter:</Text> Good contact hitter (moves runners along)</List.Item>
              <List.Item><Text fw={500} component="span">3rd batter:</Text> Your best overall hitter (gets most at-bats)</List.Item>
              <List.Item><Text fw={500} component="span">4th batter:</Text> Your power hitter (drives in runs)</List.Item>
              <List.Item><Text fw={500} component="span">5th-9th:</Text> Everyone else, best to worst</List.Item>
            </List>
          </Box>
        </Card>

        {/* Situational Analytics Strategy */}
        <Card id="situational-analytics" withBorder p="lg">
          <Group mb="md">
            <ThemeIcon size="lg" radius="md" color="orange" variant="light">
              <IconTarget size={20} />
            </ThemeIcon>
            <Title order={2}>Situational Analytics Strategy</Title>
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
              <List.Item><Text fw={500} component="span">5th-9th:</Text> Optimized for turning the lineup over</List.Item>
            </List>
          </Box>
        </Card>

        {/* Confidence System */}
        <Card id="confidence-system" withBorder p="lg">
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
              <Badge size="lg" variant="light" color="blue">Full Confidence</Badge>
              <Text size="sm" c="dimmed">(12+ at-bats): We trust these stats - they've played enough for the numbers to be reliable</Text>
            </Group>
            <Group>
              <Badge size="lg" variant="light" color="yellow" leftSection={<IconBolt size={12} />}>Medium Confidence</Badge>
              <Text size="sm" c="dimmed">(6-11 at-bats): Pretty good idea of their ability, but we apply a 15% penalty to account for the smaller sample size</Text>
            </Group>
            <Group>
              <Badge size="lg" variant="light" color="orange" leftSection={<IconAlertTriangle size={12} />}>Low Confidence</Badge>
              <Text size="sm" c="dimmed">(3-5 at-bats): Take these stats with a grain of salt - we apply a 30% penalty because the numbers might not reflect their true ability yet</Text>
            </Group>
            <Group>
              <Badge size="lg" variant="light" color="red" leftSection={<IconX size={12} />}>Excluded</Badge>
              <Text size="sm" c="dimmed">(Under 3 at-bats): Not enough data to make any reliable assessment - these players are filtered out of the batting order by default, but can be manually added back</Text>
            </Group>
          </Stack>
        </Card>

        {/* Baseball Stats Glossary */}
        <Card id="baseball-stats-glossary" withBorder p="lg">
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
        </Stack>
      </Container>
    </>
  );
};

export default HelpPage;
