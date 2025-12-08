#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Available seeders mapping
const AVAILABLE_SEEDERS = [
  'countries',
  'permissions',
  'seo',
  'admin',
  'settings',
  'user-activity'
];

// Read current package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Generate seed scripts for each seeder
const baseCommand = 'cd apps/backend && npx ts-node -r tsconfig-paths/register --project tsconfig.scripts.json src/database/seeders/dynamic.seeder.ts';

AVAILABLE_SEEDERS.forEach(seederName => {
  const scriptName = `seed:${seederName}`;
  const command = `${baseCommand} ${seederName}`;
  packageJson.scripts[scriptName] = command;
});

// Write updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log('✅ Generated dynamic seed scripts:');
AVAILABLE_SEEDERS.forEach(seederName => {
  console.log(`   - npm run seed:${seederName}`);
});