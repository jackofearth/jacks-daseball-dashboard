import React from 'react';

const HelpPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#333',
          fontSize: '2.5rem'
        }}>
          Batting Order Help
        </h1>

        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#6c757d',
            marginBottom: '1.5rem',
            fontSize: '1.8rem',
            borderBottom: '2px solid #6c757d',
            paddingBottom: '0.5rem'
          }}>
            Quick Navigation
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Getting Started</h3>
              <ul style={{ paddingLeft: '1rem', lineHeight: '1.5', fontSize: '0.9rem' }}>
                <li><a href="#quick-start" style={{ color: '#007bff', textDecoration: 'none' }}>Quick Start Guide</a></li>
                <li><a href="#manual-adjustments" style={{ color: '#007bff', textDecoration: 'none' }}>Making Manual Adjustments</a></li>
                <li><a href="#common-questions" style={{ color: '#007bff', textDecoration: 'none' }}>Frequently Asked Questions</a></li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Batting Order Strategies</h3>
              <ul style={{ paddingLeft: '1rem', lineHeight: '1.5', fontSize: '0.9rem' }}>
                <li><a href="#traditional-mlb" style={{ color: '#007bff', textDecoration: 'none' }}>Traditional Baseball Strategy</a></li>
                <li><a href="#situational-analytics" style={{ color: '#007bff', textDecoration: 'none' }}>Situational Analytics Strategy</a></li>
                <li><a href="#confidence-system" style={{ color: '#007bff', textDecoration: 'none' }}>Confidence System</a></li>
              </ul>
            </div>
            <div>
              <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Reference</h3>
              <ul style={{ paddingLeft: '1rem', lineHeight: '1.5', fontSize: '0.9rem' }}>
                <li><a href="#baseball-stats-glossary" style={{ color: '#007bff', textDecoration: 'none' }}>Baseball Stats Glossary</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div id="quick-start" style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#28a745',
            marginBottom: '1.5rem',
            fontSize: '1.8rem',
            borderBottom: '2px solid #28a745',
            paddingBottom: '0.5rem'
          }}>
            Quick Start Guide
          </h2>
          
          <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            <li><strong>Upload your <a href="https://gc.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>GameChanger</a> CSV</strong> - Import your team's stats in seconds<br />
            <em>OR manually add your players (with or without their stats)</em></li>
            <li><strong>Choose your strategy and generate lineup</strong> - Click <u>Traditional Baseball</u> for proven approach or <u>Situational Analytics</u> for advanced optimization to get your optimized lineup</li>
            <li><strong>Make adjustments</strong> - Drag players to different positions or exclude players as needed</li>
            <li><strong>Export for game day</strong> - Export a PDF or print your professional lineup card</li>
          </ol>
          
          <p style={{ 
            fontStyle: 'italic', 
            color: '#6c757d', 
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            borderLeft: '4px solid #28a745'
          }}>
            New to the app? Start with <u>Traditional Baseball</u> strategy - it's simple and proven.
          </p>
        </div>

        <div id="manual-adjustments" style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#6c757d',
            marginBottom: '1.5rem',
            fontSize: '1.8rem',
            borderBottom: '2px solid #6c757d',
            paddingBottom: '0.5rem'
          }}>
            Making Manual Adjustments
          </h2>
          
          <p style={{ marginBottom: '1rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
            <strong>The algorithms are smart, but you know your team best.</strong> Here's when and how to override:
          </p>
          
          <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Common Override Situations:</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            <li>Player returning from injury (exclude them until they're back to form)</li>
            <li>Matchup advantages (lefty vs righty pitcher preferences)</li>
            <li>Player availability (can't make today's game)</li>
            <li>Team chemistry (separating players who don't work well together)</li>
            <li>Defensive positioning needs (your best shortstop might not be your best hitter)</li>
          </ul>
          
          <h3 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.2rem' }}>How to Override:</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            <li><strong>Drag and drop</strong> players to different batting positions</li>
            <li><strong>Exclude players</strong> using the ✕ button (removes from algorithm completely)</li>
            <li><strong>Manual additions</strong> - click their name at the bottom to add back excluded players to the bottom of the lineup</li>
          </ul>
        </div>

        <div id="common-questions" style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#dc3545',
            marginBottom: '1.5rem',
            fontSize: '1.8rem',
            borderBottom: '2px solid #dc3545',
            paddingBottom: '0.5rem'
          }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Q: Why did I create this app?</p>
            <p style={{ marginBottom: '1rem', paddingLeft: '1rem', lineHeight: '1.6' }}>
              A: There's no reason teams who play for fun or juniors shouldn't benefit from all the advanced stats we have at our fingertips. Why base your lineup on vibes when you can base it on cold hard stats?
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Q: Why is my best hitter batting 3rd instead of 4th?</p>
            <p style={{ marginBottom: '1rem', paddingLeft: '1rem', lineHeight: '1.6' }}>
              A: The 3rd spot gets more at-bats over a season. Your best hitter will have more opportunities to impact the game.
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Q: What if a player has great stats but I know they're struggling recently?</p>
            <p style={{ marginBottom: '1rem', paddingLeft: '1rem', lineHeight: '1.6' }}>
              A: Use the exclude feature (✕) to remove them temporarily, or manually move them down in the order.
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Q: How often should I regenerate my lineup?</p>
            <p style={{ marginBottom: '1rem', paddingLeft: '1rem', lineHeight: '1.6' }}>
              A: With this app, you can regenerate as often as you like - every game if you have the stats! Previously coaches might update lineups every 3-4 games, but now you can optimize based on the most current performance data available.
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Q: What if the algorithm puts a slow player in leadoff?</p>
            <p style={{ marginBottom: '1rem', paddingLeft: '1rem', lineHeight: '1.6' }}>
              A: The Traditional Baseball algorithm prioritizes getting on base. If you want speed emphasis, try Situational Analytics or manually adjust.
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Q: My CSV import isn't working - what's wrong?</p>
            <p style={{ marginBottom: '1rem', paddingLeft: '1rem', lineHeight: '1.6' }}>
              A: This app accepts all GameChanger CSV exports. While GameChanger allows CSV exports of selected games, full season stats exports are recommended for this app to ensure the confidence system works properly. For help exporting your stats from GameChanger, see their instructions here: <a href="https://help.gc.com/hc/en-us/articles/360043583651-Exporting-Season-Stats" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>https://help.gc.com/hc/en-us/articles/360043583651-Exporting-Season-Stats</a>
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Q: Can I use this for different age groups?</p>
            <p style={{ marginBottom: '1rem', paddingLeft: '1rem', lineHeight: '1.6' }}>
              A: Yes! Traditional Baseball works well for all levels. Situational Analytics is especially effective for younger players where small-ball tactics matter more.
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Q: What if I don't agree with the lineup?</p>
            <p style={{ marginBottom: '1rem', paddingLeft: '1rem', lineHeight: '1.6' }}>
              A: The algorithm provides a data-driven starting point, but you know things about your players that the strategy doesn't. Use it as a guide, then make adjustments based on team chemistry, matchups, and your coaching instincts.
            </p>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Q: How accurate are these algorithms?</p>
            <p style={{ marginBottom: '1rem', paddingLeft: '1rem', lineHeight: '1.6' }}>
              A: They're based on proven baseball strategy (Traditional Baseball) and modern analytics (Situational). They optimize for statistical probability, but baseball is still a game where anything can happen.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#333',
            marginBottom: '2rem',
            fontSize: '2rem',
            borderBottom: '3px solid #333',
            paddingBottom: '0.5rem',
            textAlign: 'center'
          }}>
            Batting Order Strategies
          </h2>
        </div>

        <div id="traditional-mlb" style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#007bff',
            marginBottom: '2rem',
            fontSize: '1.8rem',
            borderBottom: '2px solid #007bff',
            paddingBottom: '0.5rem'
          }}>
            Traditional Baseball Strategy
          </h2>
          
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#333'
          }}>
            Why this strategy?
          </h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            <li>A simple, proven approach used at the highest levels of baseball.</li>
          </ul>

          <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>The Logic:</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li><strong>1st batter:</strong> Best at getting on base (starts rallies)</li>
            <li><strong>2nd batter:</strong> Good contact hitter (moves runners along)</li>
            <li><strong>3rd batter:</strong> Your best overall hitter (gets most at-bats)</li>
            <li><strong>4th batter:</strong> Your power hitter (drives in runs)</li>
            <li><strong>5th-9th:</strong> Everyone else, best to worst</li>
          </ul>
        </div>

        <div id="situational-analytics" style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#28a745',
            marginBottom: '2rem',
            fontSize: '1.8rem',
            borderBottom: '2px solid #28a745',
            paddingBottom: '0.5rem'
          }}>
            Situational Analytics Strategy
          </h2>
          
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#333'
          }}>
            Why this strategy?
          </h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            <li>Maximizes situational play by using game theory and a finely-tuned balance of advanced metrics.</li>
            <li>Especially effective for lower-level teams and youth teams where games often come down to small ball situations like moving runners, avoiding strikeouts, and capitalizing on defensive mistakes.</li>
          </ul>

          <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>The Logic:</h3>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li><strong>1st batter:</strong> Gets on base AND can steal</li>
            <li><strong>2nd batter:</strong> Makes contact in clutch situations</li>
            <li><strong>3rd batter:</strong> Balanced hitter with power and situational awareness</li>
            <li><strong>4th batter:</strong> Drives in runs when it matters</li>
            <li><strong>5th-9th:</strong> Optimized for turning the lineup over</li>
          </ul>
        </div>

        <div id="confidence-system" style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#6c757d',
            marginBottom: '2rem',
            fontSize: '1.8rem',
            borderBottom: '2px solid #6c757d',
            paddingBottom: '0.5rem'
          }}>
            Confidence System
          </h2>
          
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '1rem',
            color: '#333',
            lineHeight: '1.6'
          }}>
            You might have noticed the symbols next to some players' names. This is our confidence system, and here's why it matters:
          </p>

          <p style={{
            fontSize: '1.1rem',
            marginBottom: '1rem',
            color: '#333',
            lineHeight: '1.6'
          }}>
            A player who goes 2-for-3 in one game looks like a .667 hitter, but that doesn't mean they're better than your .350 hitter who's played 20 games. Small sample sizes can be misleading.
          </p>

          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            color: '#333',
            lineHeight: '1.6'
          }}>
            With this system in place, your experienced players don't get unfairly bumped down the order by someone who just had one or two lucky at-bats.
          </p>

          <p style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#333'
          }}>
            Here's what the symbols mean:
          </p>

          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li><strong>(NO SYMBOL) Full Confidence (12+ at-bats):</strong> We trust these stats - they've played enough for the numbers to be reliable</li>
            <li><strong>⚡ Medium Confidence (6-11 at-bats):</strong> Pretty good idea of their ability, but we apply a 15% penalty to account for the smaller sample size</li>
            <li><strong>⚠️ Low Confidence (3-5 at-bats):</strong> Take these stats with a grain of salt - we apply a 30% penalty because the numbers might not reflect their true ability yet</li>
            <li><strong>🚫 Excluded (Under 3 at-bats):</strong> Not enough data to make any reliable assessment - these players are filtered out of the batting order by default, but can be manually added back.</li>
          </ul>
        </div>

        <div id="baseball-stats-glossary" style={{ marginBottom: '3rem' }}>
          <h2 style={{
            color: '#6f42c1',
            marginBottom: '0.5rem',
            fontSize: '1.8rem',
            borderBottom: '2px solid #6f42c1',
            paddingBottom: '0.5rem'
          }}>
            Baseball Stats Glossary
          </h2>
          <p style={{ 
            color: '#6c757d', 
            fontSize: '1rem', 
            marginBottom: '1.5rem',
            fontStyle: 'italic'
          }}>
            The nerdy engine that powers our strategies
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.3rem' }}>Basic Hitting Stats</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>AVG (Batting Average):</span> How often a player gets a hit. Just hits divided by at-bats. .300 is really good, anything under .200 is pretty rough.
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>OBP (On-Base Percentage):</span> How often a player reaches base safely - includes hits, walks, and getting hit by pitches. Good players get on base about 40% of the time.
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>SLG (Slugging Percentage):</span> Measures power hitting. Singles count as 1, doubles as 2, triples as 3, home runs as 4. Higher numbers mean more extra-base hits.
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>OPS (On-Base Plus Slugging):</span> Just adds OBP and SLG together. It's a quick way to see if someone's a good overall hitter. Over 1.000 is elite territory.
              </p>
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.3rem' }}>Advanced Stats</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>Contact% (Contact Percentage):</span> How often a player makes contact when they swing. High contact hitters are usually more consistent - they don't strike out much.
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>SB% (Stolen Base Percentage):</span> Success rate for stealing bases. You need to succeed about 75% of the time to actually help your team.
              </p>
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.3rem' }}>Clutch Hitting</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>BA/RISP (Batting Average with Runners in Scoring Position):</span> How well someone hits when runners are on second or third base - the spots where they can actually score on a single.
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>QAB% (Quality At-Bat Percentage):</span> Percentage of "good" at-bats - getting hits, walks, moving runners over, or at least making the pitcher work hard.
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>Two-Out RBI:</span> Driving in runs with two outs already - when it's do-or-die time and you're the team's last chance to score.
              </p>
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.3rem' }}>Power Numbers</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>HR (Home Runs):</span> Hit it over the fence, trot around the bases. Pretty self-explanatory.
              </p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                <span style={{ fontWeight: 'bold' }}>XBH (Extra-Base Hits):</span> Any hit that gets you past first base - doubles, triples, and home runs. Shows gap power and ability to drive the ball.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpPage;
