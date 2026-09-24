const { execSync } = require('child_process');

const isProductionOrPostgres =
  process.env.VERCEL ||
  process.env.DATABASE_URL?.startsWith('postgres://') ||
  process.env.DATABASE_URL?.startsWith('postgresql://');

const schemaPath = isProductionOrPostgres
  ? 'prisma/schema.postgresql.prisma'
  : 'prisma/schema.prisma';

console.log(`[Build] Generating Prisma client using schema: ${schemaPath}`);
execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit' });

console.log('[Build] Building Next.js application...');
execSync('next build', { stdio: 'inherit' });
