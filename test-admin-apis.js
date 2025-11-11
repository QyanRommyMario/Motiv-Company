/**
 * Test all admin API endpoints
 * Run: node test-admin-apis.js
 */

const endpoints = [
  '/api/admin/stats',
  '/api/admin/customers',
  '/api/admin/products',
  '/api/admin/orders',
  '/api/admin/vouchers',
  '/api/admin/b2b/requests',
  '/api/upload',
];

const BASE_URL = 'https://motivcompany.vercel.app';

// You need to get this from browser after login
const SESSION_TOKEN = 'YOUR_SESSION_TOKEN_HERE';

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
      },
    });

    const data = await response.json();
    
    console.log(`\n========================================`);
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    console.log(`========================================`);

    return {
      endpoint,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(`\n❌ Error testing ${endpoint}:`, error.message);
    return {
      endpoint,
      status: 'ERROR',
      error: error.message,
    };
  }
}

async function testAll() {
  console.log('🔍 Testing all admin API endpoints...\n');
  console.log('⚠️  Make sure to replace SESSION_TOKEN in the code first!\n');

  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between requests
  }

  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(50));
  results.forEach(r => {
    const statusEmoji = r.status === 200 ? '✅' : '❌';
    console.log(`${statusEmoji} ${r.endpoint}: ${r.status}`);
    if (r.data?.error) {
      console.log(`   Error: ${r.data.error}`);
    }
  });
}

testAll();
