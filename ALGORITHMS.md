# Baseball Manager Dashboard - Algorithm Documentation

*Auto-generated on: 2025-10-30*
*Last updated: 2025-10-31 (c97ca61)*

## Overview

This document provides comprehensive technical specifications for the two batting order generation algorithms implemented in the Baseball Manager Dashboard. The algorithms are designed to optimize team performance using statistical analysis and situational awareness.

## Algorithm 1: Traditional Baseball Strategy

**Function:** `generateMLBOrder()`  
**File:** `src/DraggableBattingOrderMantine.tsx` (lines 547-654)  
**Strategy:** Simple, proven approach used at the highest levels of baseball

### Core Logic

The Traditional Baseball algorithm prioritizes fundamental baseball principles with a focus on getting on base and driving in runs.

#### Position Assignments

| Position | Criteria | Weighting | Description |
|----------|----------|-----------|-------------|
| **1st (Leadoff)** | Highest OBP | 100% OBP | See implementation for details |
| **2nd (Elite Hitter)** | Highest remaining OPS | 100% OPS | See implementation for details |
| **3rd (Remaining Talent)** | Gets remaining top talent | 100% OPS | See implementation for details |
| **4th (Cleanup)** | Highest SLG | 100% SLG | See implementation for details |
| **5th (Protection)** | Second best SLG | 100% SLG | See implementation for details |
| **6th-9th** | Descending OPS | 100% OPS | See implementation for details |

#### Mathematical Formulas

```javascript
// OPS Calculation
ops = obp + slg

// Contact Score (for 2nd position)
contactScore = avg + speedScore
speedScore = sb_percent

// Position Ranking (Modern Analytics Order)
position1 = max(obp)                    // Leadoff
position4 = max(slg)                    // Cleanup (priority #2)
position2 = max(ops) [remaining]        // Elite hitter (priority #3)
position5 = max(slg) [excluding pos4]   // Protection (priority #4)
position3 = max(ops) [remaining]        // Remaining talent (priority #5)
position6-9 = sort(ops, descending)     // Descending order (remaining players)
```

#### Confidence System Integration

All stats are penalized based on plate appearance confidence:
- **Full Confidence (15+ PA):** No penalty (0%)
- **Medium Confidence (8-14 PA):** 15% penalty
- **Low Confidence (4-7 PA):** 30% penalty
- **Excluded (<4 PA):** Filtered out entirely

```javascript
penalizedStat = originalStat * (1 - penalty)
```

## Algorithm 2: Situational Analytics Strategy

**Function:** `generateJacksCustomLocalLeagueOrder()`  
**File:** `src/DraggableBattingOrderMantine.tsx` (lines 656-812)  
**Strategy:** Advanced metrics optimization using game theory and situational awareness

### Core Logic

The Situational Analytics algorithm maximizes situational play by using advanced metrics and game theory principles, especially effective for lower-level teams where small-ball tactics matter more.

#### Position Assignments

| Position | Primary Metrics | Weighting | Situational Fallback |
|----------|----------------|-----------|---------------------|
| **1st (Leadoff)** | OBP + Speed + Contact | 40% OBP + 30% SB% + 20% Contact% + 10% AVG | See implementation for details |
| **2nd (Table Setter)** | Contact + Situational | 40% Contact% + 30% BA/RISP + 20% QAB% + 10% AVG | See implementation for details |
| **3rd (Best Hitter)** | Balanced + Situational | 30% OPS + 20% SLG + 25% BA/RISP + 15% QAB% + 10% AVG | See implementation for details |
| **4th (Cleanup)** | Clutch + Power | 45% BA/RISP + 35% SLG + 20% Two-out RBI | See implementation for details |
| **5th (Protection)** | Power + Situational | 35% SLG + 35% BA/RISP + 20% Two-out RBI + 10% OPS | See implementation for details |
| **6th-9th** | OPS-based | 100% OPS | See implementation for details |

#### Mathematical Formulas

```javascript
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
```

#### Situational Stats Integration

The algorithm uses situational statistics when available, with confidence weighting:

- **BA/RISP (Batting Average with Runners in Scoring Position)**
- **QAB% (Quality At-Bat Percentage)**
- **Two-out RBI Rate**
- **Contact% (Contact Percentage)**
- **SB% (Stolen Base Percentage)**

#### Confidence System Integration

**Basic Stats Penalty (based on total PA):**
- 15+ PA: 0% penalty (Full confidence)
- 8-14 PA: 15% penalty (Medium confidence)
- 4-7 PA: 30% penalty (Low confidence)
- <4 PA: 100% penalty (Excluded)

**Situational Stats Penalty (based on situational AB):**
- 5+ AB: 0% penalty (Full confidence)
- 3-4 AB: 10% penalty (Light penalty)
- 1-2 AB: 25% penalty (Medium penalty)
- 0 AB: 50% penalty (Heavy penalty, but not excluded)

## Statistical Definitions

### Basic Hitting Stats
- **AVG (Batting Average):** Hits / At-Bats
- **OBP (On-Base Percentage):** (Hits + Walks + HBP) / (PA)
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
2. Filter players with sufficient PA (>= 4)
3. Use primary players if available, otherwise use all players

### Penalty Application
All statistics are penalized based on confidence before algorithm evaluation:
```javascript
penalizedPlayer = {
  ...player,
  avg: (player.avg || 0) * (1 - basicPenalty),
  obp: (player.obp || 0) * (1 - basicPenalty),
  slg: (player.slg || 0) * (1 - basicPenalty),
  // ... other stats
}
```

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

*This documentation is automatically updated on each commit. Last algorithm code inspection: 2025-10-31 (c97ca61)*
*Generated by: update-algorithm-docs.js v1.0*
