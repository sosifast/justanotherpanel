const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Checking existing tables...');
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables in public schema:', tables);
    
    const enums = await prisma.$queryRaw`
      SELECT n.nspname AS schema, t.typname AS name, e.enumlabel AS value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public';
    `;
    console.log('Enums in public schema:', enums);

  } catch (e) {
    console.error('Error querying tables:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
