const { execSync } = require('child_process');

const isProductionOrPostgres =
  process.env.VERCEL ||
  process.env.DATABASE_URL?.startsWith('postgres://') ||
  process.env.DATABASE_URL?.startsWith('postgresql://');

const schemaPath = isProductionOrPostgres
  ? 'prisma/schema.postgresql.prisma'
  : 'prisma/schema.prisma';

// Ensure DATABASE_URL is populated for build-time generation if unset
if (isProductionOrPostgres && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
}

console.log(`[Build] Generating Prisma client using schema: ${schemaPath}`);
execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit', env: process.env });

console.log('[Build] Building Next.js application...');
execSync('next build', { stdio: 'inherit', env: process.env });
