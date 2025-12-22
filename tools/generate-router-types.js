#!/usr/bin/env node

/**
 * Script to generate router type definitions from actual router implementations
 * This eliminates the need to manually maintain app-router.ts
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROUTER_DIR = 'apps/backend/src/trpc/routers';
const OUTPUT_FILE = 'apps/backend/src/types/app-router.generated.ts';

function extractRouterInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract @Router({ alias: 'xyz' }) and class name
  const aliasMatch = content.match(/@Router\(\s*{\s*alias:\s*['"`]([^'"`]+)['"`]/);
  const classMatch = content.match(/export\s+class\s+(\w+Router)/);
  
  if (aliasMatch && classMatch) {
    return {
      alias: aliasMatch[1],
      className: classMatch[1],
      filePath: filePath.replace(/\.ts$/, ''),
    };
  }
  return null;
}

function generateRouterTypes() {
  const routerFiles = glob.sync(`${ROUTER_DIR}/**/*.router.ts`);
  const routers = routerFiles
    .map(extractRouterInfo)
    .filter(Boolean)
    .sort((a, b) => a.alias.localeCompare(b.alias));

  const imports = routers
    .map(r => `import type { ${r.className} } from '${r.filePath}';`)
    .join('\n');

  const routerMap = routers
    .map(r => `  ${r.alias}: ${r.className};`)
    .join('\n');

  const generatedContent = `// This file is auto-generated. Do not edit manually.
// Run 'npm run generate:router-types' to regenerate.

${imports}

export type AppRouter = {
${routerMap}
};

export type RouterAliases = keyof AppRouter;
`;

  fs.writeFileSync(OUTPUT_FILE, generatedContent);
  process.stdout.write(`Generated router types at ${OUTPUT_FILE}\n`);
  process.stdout.write(`Found ${routers.length} routers\n`);
}

if (require.main === module) {
  generateRouterTypes();
}

module.exports = { generateRouterTypes };
