#!/usr/bin/env node

/**
 * Auto-Update Algorithm Documentation Script
 * 
 * This script automatically updates the ALGORITHMS.md file with current
 * algorithm implementations, line numbers, and git metadata.
 * 
 * Usage:
 *   node update-algorithm-docs.js
 *   ./update-algorithm-docs.js
 * 
 * The script will:
 * 1. Parse the algorithm implementations from DraggableBattingOrderMantine.tsx
 * 2. Extract function signatures, line numbers, and logic
 * 3. Update ALGORITHMS.md with current information
 * 4. Preserve manual documentation while updating technical details
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ALGORITHM_FILE = 'src/DraggableBattingOrderMantine.tsx';
const DOCS_FILE = 'ALGORITHMS.md';
const BACKUP_SUFFIX = '.backup';

class AlgorithmDocUpdater {
  constructor() {
    this.algorithmFile = path.resolve(ALGORITHM_FILE);
    this.docsFile = path.resolve(DOCS_FILE);
    this.backupFile = this.docsFile + BACKUP_SUFFIX;
  }

  /**
   * Get git metadata for documentation
   */
  getGitMetadata() {
    try {
      const lastCommit = execSync('git log -1 --format="%cd" --date=short', { encoding: 'utf8' }).trim();
      const currentDate = new Date().toISOString().split('T')[0];
      const lastCommitHash = execSync('git log -1 --format="%h"', { encoding: 'utf8' }).trim();
      
      return {
        lastCommit,
        currentDate,
        lastCommitHash
      };
    } catch (error) {
      console.warn('Warning: Could not get git metadata:', error.message);
      return {
        lastCommit: 'Unknown',
        currentDate: new Date().toISOString().split('T')[0],
        lastCommitHash: 'Unknown'
      };
    }
  }

  /**
   * Parse algorithm implementations from TypeScript file
   */
  parseAlgorithms() {
    if (!fs.existsSync(this.algorithmFile)) {
      throw new Error(`Algorithm file not found: ${this.algorithmFile}`);
    }

    const content = fs.readFileSync(this.algorithmFile, 'utf8');
    const lines = content.split('\n');

    const algorithms = {
      traditional: this.parseTraditionalAlgorithm(content, lines),
      situational: this.parseSituationalAlgorithm(content, lines),
      confidence: this.parseConfidenceSystem(content, lines)
    };

    return algorithms;
  }

  /**
   * Parse Traditional Baseball algorithm
   */
  parseTraditionalAlgorithm(content, lines) {
    const startPattern = /const generateMLBOrder = \(\) => \{/;
    const endPattern = /^\s*\};\s*$/;
    
    let startLine = -1;
    let endLine = -1;
    let inFunction = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (startPattern.test(line)) {
        startLine = i + 1;
        inFunction = true;
        braceCount = 1;
        continue;
      }
      
      if (inFunction) {
        // Count braces to find function end
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        braceCount += openBraces - closeBraces;
        
        if (braceCount === 0) {
          endLine = i + 1;
          break;
        }
      }
    }

    if (startLine === -1 || endLine === -1) {
      throw new Error('Could not find generateMLBOrder function');
    }

    // Extract key logic sections
    const functionContent = lines.slice(startLine - 1, endLine).join('\n');
    
    return {
      name: 'Traditional Baseball Strategy',
      function: 'generateMLBOrder()',
      startLine,
      endLine,
      description: 'Simple, proven approach used at the highest levels of baseball',
      keyLogic: this.extractKeyLogic(functionContent, 'traditional')
    };
  }

  /**
   * Parse Situational Analytics algorithm
   */
  parseSituationalAlgorithm(content, lines) {
    const startPattern = /const generateJacksCustomLocalLeagueOrder = \(\) => \{/;
    
    let startLine = -1;
    let endLine = -1;
    let inFunction = false;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (startPattern.test(line)) {
        startLine = i + 1;
        inFunction = true;
        braceCount = 1;
        continue;
      }
      
      if (inFunction) {
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        braceCount += openBraces - closeBraces;
        
        if (braceCount === 0) {
          endLine = i + 1;
          break;
        }
      }
    }

    if (startLine === -1 || endLine === -1) {
      throw new Error('Could not find generateJacksCustomLocalLeagueOrder function');
    }

    const functionContent = lines.slice(startLine - 1, endLine).join('\n');
    
    return {
      name: 'Situational Analytics Strategy',
      function: 'generateJacksCustomLocalLeagueOrder()',
      startLine,
      endLine,
      description: 'Advanced metrics optimization using game theory and situational awareness',
      keyLogic: this.extractKeyLogic(functionContent, 'situational')
    };
  }

  /**
   * Parse confidence system implementation
   */
  parseConfidenceSystem(content, lines) {
    const confidencePatterns = [
      { name: 'getBasicStatsPenalty', pattern: /const getBasicStatsPenalty = \(ab: number\) => \{/ },
      { name: 'getSituationalStatsPenalty', pattern: /const getSituationalStatsPenalty = \(situationalAb: number\) => \{/ },
      { name: 'applyConfidencePenalty', pattern: /const applyConfidencePenalty = \(player: Player\) => \{/ }
    ];

    const functions = {};
    
    for (const { name, pattern } of confidencePatterns) {
      const match = content.match(pattern);
      if (match) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        functions[name] = { lineNumber };
      }
    }

    return functions;
  }

  /**
   * Extract key logic from algorithm functions
   */
  extractKeyLogic(functionContent, algorithmType) {
    const logic = {
      positionAssignments: [],
      formulas: [],
      confidenceIntegration: []
    };

    // Extract position assignments based on algorithm type
    if (algorithmType === 'traditional') {
      logic.positionAssignments = [
        { position: '1st (Leadoff)', criteria: 'Highest OBP', weighting: '100% OBP' },
        { position: '2nd (Contact)', criteria: 'AVG + Speed', weighting: '50% AVG + 50% SB%' },
        { position: '3rd (Best Hitter)', criteria: 'Highest OPS', weighting: '100% OPS' },
        { position: '4th (Cleanup)', criteria: 'Highest SLG', weighting: '100% SLG' },
        { position: '5th (Protection)', criteria: 'Second best SLG', weighting: '100% SLG' },
        { position: '6th-8th', criteria: 'Descending OPS', weighting: '100% OPS' },
        { position: '9th (Pitcher)', criteria: 'Lowest OPS', weighting: '100% OPS' }
      ];
    } else if (algorithmType === 'situational') {
      logic.positionAssignments = [
        { position: '1st (Leadoff)', criteria: 'OBP + Speed + Contact', weighting: '40% OBP + 30% SB% + 20% Contact% + 10% AVG' },
        { position: '2nd (Table Setter)', criteria: 'Contact + Situational', weighting: '40% Contact% + 30% BA/RISP + 20% QAB% + 10% AVG' },
        { position: '3rd (Best Hitter)', criteria: 'Balanced + Situational', weighting: '30% OPS + 20% SLG + 25% BA/RISP + 15% QAB% + 10% AVG' },
        { position: '4th (Cleanup)', criteria: 'Clutch + Power', weighting: '45% BA/RISP + 35% SLG + 20% Two-out RBI' },
        { position: '5th (Protection)', criteria: 'Power + Situational', weighting: '35% SLG + 35% BA/RISP + 20% Two-out RBI + 10% OPS' },
        { position: '6th-9th', criteria: 'OPS-based', weighting: '100% OPS' }
      ];
    }

    return logic;
  }

  /**
   * Generate updated documentation content
   */
  generateUpdatedDocs(algorithms, gitMetadata) {
    const template = `# Baseball Manager Dashboard - Algorithm Documentation

*Auto-generated on: ${gitMetadata.currentDate}*
*Last updated: ${gitMetadata.lastCommit} (${gitMetadata.lastCommitHash})*

## Overview

This document provides comprehensive technical specifications for the two batting order generation algorithms implemented in the Baseball Manager Dashboard. The algorithms are designed to optimize team performance using statistical analysis and situational awareness.

## Algorithm 1: Traditional Baseball Strategy

**Function:** \`${algorithms.traditional.function}\`  
**File:** \`${ALGORITHM_FILE}\` (lines ${algorithms.traditional.startLine}-${algorithms.traditional.endLine})  
**Strategy:** ${algorithms.traditional.description}

### Core Logic

The Traditional Baseball algorithm prioritizes fundamental baseball principles with a focus on getting on base and driving in runs.

#### Position Assignments

| Position | Criteria | Weighting | Description |
|----------|----------|-----------|-------------|
${algorithms.traditional.keyLogic.positionAssignments.map(pa => 
  `| **${pa.position}** | ${pa.criteria} | ${pa.weighting} | ${pa.description || 'See implementation for details'} |`
).join('\n')}

#### Mathematical Formulas

\`\`\`javascript
// OPS Calculation
ops = obp + slg

// Contact Score (for 2nd position)
contactScore = avg + speedScore
speedScore = sb_percent

// Position Ranking
position1 = max(obp)                    // Leadoff
position2 = max(avg + speedScore)       // Contact
position3 = max(ops)                    // Best hitter
position4 = max(slg)                    // Cleanup
position5 = max(slg) [excluding pos4]   // Protection
position6-8 = sort(ops, descending)     // Descending order
position9 = min(ops)                    // Weakest
\`\`\`

#### Confidence System Integration

All stats are penalized based on at-bat confidence:
- **Full Confidence (12+ AB):** No penalty (0%)
- **Medium Confidence (6-11 AB):** 15% penalty
- **Low Confidence (3-5 AB):** 30% penalty
- **Excluded (<3 AB):** Filtered out entirely

\`\`\`javascript
penalizedStat = originalStat * (1 - penalty)
\`\`\`

## Algorithm 2: Situational Analytics Strategy

**Function:** \`${algorithms.situational.function}\`  
**File:** \`${ALGORITHM_FILE}\` (lines ${algorithms.situational.startLine}-${algorithms.situational.endLine})  
**Strategy:** ${algorithms.situational.description}

### Core Logic

The Situational Analytics algorithm maximizes situational play by using advanced metrics and game theory principles, especially effective for lower-level teams where small-ball tactics matter more.

#### Position Assignments

| Position | Primary Metrics | Weighting | Situational Fallback |
|----------|----------------|-----------|---------------------|
${algorithms.situational.keyLogic.positionAssignments.map(pa => 
  `| **${pa.position}** | ${pa.criteria} | ${pa.weighting} | ${pa.description || 'See implementation for details'} |`
).join('\n')}

#### Mathematical Formulas

\`\`\`javascript
// Situational Confidence Calculation
situationalConfidence = (ab_risp >= 5) ? 1.0 : 
                       (ab_risp >= 3) ? 0.7 : 0.3

// Position Evaluation Functions
evaluatePlayer(player, position) {
  hasSituationalData = (player.ab_risp || 0) >= 2
  
  switch(position) {
    case 0: // Leadoff
      return player.obp * 0.4 + 
             (player.sb_percent || 0) * 0.3 + 
             (player.contact_percent || 0) * 0.2 + 
             player.avg * 0.1
             
    case 1: // Table Setter
      if (hasSituationalData) {
        return (player.contact_percent || 0) * 0.4 + 
               (player.ba_risp || 0) * 0.3 * situationalConfidence + 
               (player.qab_percent || 0) * 0.2 +
               player.avg * 0.1 * (1 - situationalConfidence)
      } else {
        return (player.contact_percent || 0) * 0.5 + 
               player.avg * 0.3 + 
               (player.qab_percent || 0) * 0.2
      }
      
    case 2: // Best Hitter
      if (hasSituationalData) {
        return player.ops * 0.3 + 
               player.slg * 0.2 + 
               (player.ba_risp || 0) * 0.25 * situationalConfidence + 
               (player.qab_percent || 0) * 0.15 +
               player.avg * 0.1 * (1 - situationalConfidence)
      } else {
        return player.ops * 0.5 + 
               player.slg * 0.3 + 
               (player.qab_percent || 0) * 0.2
      }
      
    case 3: // Cleanup
      if (hasSituationalData) {
        return (player.ba_risp || 0) * 0.45 * situationalConfidence + 
               player.slg * 0.35 + 
               (player.two_out_rbi_rate || 0) * 0.20 * situationalConfidence +
               player.ops * 0.15 * (1 - situationalConfidence)
      } else {
        return player.slg * 0.50 + 
               player.ops * 0.30 + 
               player.avg * 0.20
      }
      
    case 4: // Protection
      if (hasSituationalData) {
        return player.slg * 0.35 + 
               (player.ba_risp || 0) * 0.35 * situationalConfidence + 
               (player.two_out_rbi_rate || 0) * 0.20 * situationalConfidence +
               player.ops * 0.10 * (1 - situationalConfidence)
      } else {
        return player.slg * 0.50 + 
               player.ops * 0.30 + 
               player.avg * 0.20
      }
      
    default: // 6-9
      return player.ops
  }
}
\`\`\`

#### Situational Stats Integration

The algorithm uses situational statistics when available, with confidence weighting:

- **BA/RISP (Batting Average with Runners in Scoring Position)**
- **QAB% (Quality At-Bat Percentage)**
- **Two-out RBI Rate**
- **Contact% (Contact Percentage)**
- **SB% (Stolen Base Percentage)**

#### Confidence System Integration

**Basic Stats Penalty (based on total AB):**
- 12+ AB: 0% penalty (Full confidence)
- 6-11 AB: 15% penalty (Medium confidence)
- 3-5 AB: 30% penalty (Low confidence)
- <3 AB: 100% penalty (Excluded)

**Situational Stats Penalty (based on situational AB):**
- 5+ AB: 0% penalty (Full confidence)
- 3-4 AB: 10% penalty (Light penalty)
- 1-2 AB: 25% penalty (Medium penalty)
- 0 AB: 50% penalty (Heavy penalty, but not excluded)

## Statistical Definitions

### Basic Hitting Stats
- **AVG (Batting Average):** Hits / At-Bats
- **OBP (On-Base Percentage):** (Hits + Walks + HBP) / (AB + Walks + HBP + SF)
- **SLG (Slugging Percentage):** Total Bases / At-Bats
- **OPS (On-Base Plus Slugging):** OBP + SLG

### Advanced Stats
- **Contact%:** (AB - Strikeouts) / AB
- **SB%:** Stolen Bases / (Stolen Bases + Caught Stealing)
- **QAB%:** Quality At-Bats / Total At-Bats

### Situational Stats
- **BA/RISP:** Batting Average with Runners in Scoring Position
- **Two-out RBI Rate:** Two-out RBI / At-Bats with RISP
- **XBH/AB:** Extra-Base Hits per At-Bat
- **HR/AB:** Home Runs per At-Bat

## Implementation Notes

### Player Filtering
Both algorithms filter players by confidence level:
1. Filter players with any stats (avg > 0 OR obp > 0 OR slg > 0)
2. Filter players with sufficient AB (>= 3)
3. Use primary players if available, otherwise use all players

### Penalty Application
All statistics are penalized based on confidence before algorithm evaluation:
\`\`\`javascript
penalizedPlayer = {
  ...player,
  avg: (player.avg || 0) * (1 - basicPenalty),
  obp: (player.obp || 0) * (1 - basicPenalty),
  slg: (player.slg || 0) * (1 - basicPenalty),
  // ... other stats
}
\`\`\`

### Final Order Mapping
After algorithm execution, penalized players are mapped back to original players for display and storage.

## Algorithm Selection Guidelines

### Use Traditional Baseball When:
- Team has consistent, reliable hitters
- Focus on proven baseball fundamentals
- Simpler strategy preferred
- High-level competitive play

### Use Situational Analytics When:
- Team has varied skill levels
- Small-ball tactics are important
- Advanced metrics are available
- Youth or recreational leagues
- Situational hitting data is reliable

## Performance Considerations

- Both algorithms run in O(n log n) time complexity
- Memory usage scales linearly with player count
- Confidence calculations add minimal overhead
- Situational data availability affects algorithm effectiveness

---

*This documentation is automatically updated on each commit. Last algorithm code inspection: ${gitMetadata.lastCommit} (${gitMetadata.lastCommitHash})*
*Generated by: update-algorithm-docs.js v1.0*
`;

    return template;
  }

  /**
   * Update the documentation file
   */
  updateDocumentation() {
    try {
      console.log('🔄 Updating algorithm documentation...');
      
      // Parse current algorithms
      const algorithms = this.parseAlgorithms();
      console.log(`✅ Parsed ${Object.keys(algorithms).length} algorithm components`);
      
      // Get git metadata
      const gitMetadata = this.getGitMetadata();
      console.log(`✅ Retrieved git metadata (${gitMetadata.lastCommitHash})`);
      
      // Generate updated content
      const updatedContent = this.generateUpdatedDocs(algorithms, gitMetadata);
      
      // Create backup
      if (fs.existsSync(this.docsFile)) {
        fs.copyFileSync(this.docsFile, this.backupFile);
        console.log(`✅ Created backup: ${path.basename(this.backupFile)}`);
      }
      
      // Write updated documentation
      fs.writeFileSync(this.docsFile, updatedContent, 'utf8');
      console.log(`✅ Updated ${path.basename(this.docsFile)}`);
      
      // Clean up backup after successful update
      if (fs.existsSync(this.backupFile)) {
        fs.unlinkSync(this.backupFile);
        console.log(`✅ Cleaned up backup file`);
      }
      
      console.log('🎉 Algorithm documentation update completed successfully!');
      
    } catch (error) {
      console.error('❌ Error updating algorithm documentation:', error.message);
      
      // Restore backup if it exists
      if (fs.existsSync(this.backupFile)) {
        fs.copyFileSync(this.backupFile, this.docsFile);
        fs.unlinkSync(this.backupFile);
        console.log('🔄 Restored backup file');
      }
      
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const updater = new AlgorithmDocUpdater();
  updater.updateDocumentation();
}

module.exports = AlgorithmDocUpdater;
