#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get current date
const now = new Date();
const dateString = now.toISOString().split('T')[0];

// Read the current features file
const featuresPath = path.join(__dirname, 'FEATURES.md');
let content = fs.readFileSync(featuresPath, 'utf8');

// Update the last updated date
content = content.replace(/\*Last updated: \d{4}-\d{2}-\d{2}\*/g, `*Last updated: ${dateString}*`);

// Write back to file
fs.writeFileSync(featuresPath, content);

console.log(`Features file updated with date: ${dateString}`);
