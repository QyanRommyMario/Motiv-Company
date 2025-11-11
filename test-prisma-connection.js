/**
 * Test Prisma Connection
 * Run: node test-prisma-connection.js
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('\n🔍 Testing Prisma Connection...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test 1: Check if Prisma Client is loaded
    console.log('✅ Step 1: Prisma Client loaded successfully');
    
    // Test 2: Check database connection
    console.log('⏳ Step 2: Testing database connection...');
    await prisma.$connect();
    console.log('✅ Step 2: Connected to database');
    
    // Test 3: Run a simple query
    console.log('⏳ Step 3: Running test query...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Step 3: Query successful');
    console.log('   Database Time:', result[0].current_time);
    console.log('   Database Version:', result[0].db_version);
    
    // Test 4: Count users
    console.log('⏳ Step 4: Counting users...');
    const userCount = await prisma.user.count();
    console.log('✅ Step 4: User count:', userCount);
    
    // Test 5: Find admin user
    console.log('⏳ Step 5: Finding admin user...');
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (admin) {
      console.log('✅ Step 5: Admin user found');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
    } else {
      console.log('⚠️  Step 5: No admin user found');
    }
    
    console.log('\n✅ All tests passed!\n');
    
  } catch (error) {
    console.error('\n❌ Error during testing:\n');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('\nFull Error:', error);
    
    // Provide helpful hints based on error code
    if (error.code === 'P1001') {
      console.error('\n💡 Hint: Cannot reach database server');
      console.error('   - Check DATABASE_URL in .env.local');
      console.error('   - Verify Supabase database is running');
      console.error('   - Check network connection');
    } else if (error.code === 'P1003') {
      console.error('\n💡 Hint: Database authentication failed');
      console.error('   - Check database password in DATABASE_URL');
      console.error('   - Verify Supabase credentials');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database\n');
  }
}

// Run the test
testConnection();
