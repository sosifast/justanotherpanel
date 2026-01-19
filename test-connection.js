const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connection...');
  try {
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Optional: Try to query to ensure read access
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('✅ Query execution successful:', result);
    
  } catch (e) {
    console.error('❌ Connection failed:');
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
