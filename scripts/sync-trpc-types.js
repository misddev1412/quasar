#!/usr/bin/env node

/**
 * Sync tRPC AppRouter types from actual nestjs-trpc router files
 * This script reads the router files and generates the AppRouter type automatically
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROUTERS_DIRS = [
  'apps/backend/src/modules',
  'apps/backend/src/trpc/routers'
];
const OUTPUT_FILE = 'apps/backend/src/@generated/server.ts';

/**
 * Extract router information from a router file
 */
function extractRouterInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract router alias from @Router decorator
  // Handle both @Router('alias') and @Router({ alias: 'alias' }) formats
  let routerMatch = content.match(/@Router\(\s*['"`]([^'"`]+)['"`]\s*\)/);
  if (!routerMatch) {
    routerMatch = content.match(/@Router\(\s*\{\s*alias:\s*['"`]([^'"`]+)['"`]/);
  }
  if (!routerMatch) return null;

  const alias = routerMatch[1];
  
  // Extract methods decorated with @Query or @Mutation
  const procedures = [];
  const methodRegex = /@(Query|Mutation)\([\s\S]*?\)\s*async\s+(\w+)\s*\(/g;
  let match;
  
  while ((match = methodRegex.exec(content)) !== null) {
    const [, type, methodName] = match;
    procedures.push({
      name: methodName,
      type: type.toLowerCase()
    });
  }
  
  return {
    alias,
    procedures
  };
}

/**
 * Find all router files in the specified directories
 */
function findRouterFiles(dirs) {
  const routerFiles = [];

  function scanDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (item.endsWith('.router.ts')) {
        routerFiles.push(fullPath);
      }
    }
  }

  for (const dir of dirs) {
    scanDir(dir);
  }
  return routerFiles;
}

/**
 * Generate the AppRouter type definition
 */
function generateAppRouterType(routers) {
  let typeDefinition = `// AppRouter types for tRPC client
// This file is auto-generated from actual nestjs-trpc routers
// Run 'npm run sync:trpc-types' to regenerate this file
// Generated on: ${new Date().toISOString()}

import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Initialize tRPC for type creation
const t = initTRPC.create();

// Define the AppRouter using tRPC's router structure
// This matches the actual @Router aliases and procedures from nestjs-trpc routers
const appRouter = t.router({
`;

  for (const router of routers) {
    // Use bracket notation for aliases with dots or other special characters
    const aliasKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(router.alias) 
      ? router.alias 
      : `'${router.alias}'`;
    typeDefinition += `  ${aliasKey}: t.router({\n`;
    
    for (const procedure of router.procedures) {
      // Check if procedure needs input schema - mutations generally need input, some queries too
      const hasInput = procedure.type === 'mutation' ||
                      ['list', 'detail', 'getById', 'getByIdWithTranslations', 'getCategoryTranslations', 'getBrandTranslations', 'getAttributeTranslations', 'getByCustomerId', 'getByCustomerIdAndType', 'getByPath'].includes(procedure.name);
      const inputPart = hasInput ? '.input(z.any())' : '';
      const procedureType = procedure.type === 'query' ? 'query' : 'mutation';

      typeDefinition += `    ${procedure.name}: t.procedure${inputPart}.${procedureType}(() => null),\n`;
    }
    
    typeDefinition += `  }),\n`;
  }
  
  typeDefinition += `});

// Export the proper tRPC router type
export type AppRouter = typeof appRouter;
`;
  
  return typeDefinition;
}

/**
 * Main function
 */
function main() {
  try {
    console.log('🔍 Scanning for tRPC router files...');
    
    // Find all router files
    const routerFiles = findRouterFiles(ROUTERS_DIRS);
    console.log(`📁 Found ${routerFiles.length} router files:`);
    routerFiles.forEach(file => console.log(`   - ${file}`));
    
    // Extract router information
    const routers = [];
    for (const file of routerFiles) {
      const routerInfo = extractRouterInfo(file);
      if (routerInfo) {
        routers.push(routerInfo);
        console.log(`✅ Extracted router: ${routerInfo.alias} (${routerInfo.procedures.length} procedures)`);
      }
    }
    
    if (routers.length === 0) {
      console.log('⚠️  No routers found. Make sure your router files use @Router decorator with alias.');
      return;
    }
    
    // Generate type definition
    console.log('🔧 Generating AppRouter type...');
    const typeDefinition = generateAppRouterType(routers);
    
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write to output file
    fs.writeFileSync(OUTPUT_FILE, typeDefinition);
    console.log(`✨ Successfully generated ${OUTPUT_FILE}`);
    
    // Summary
    console.log('\n📊 Summary:');
    for (const router of routers) {
      console.log(`   ${router.alias}: ${router.procedures.map(p => p.name).join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error syncing tRPC types:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };