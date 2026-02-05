/**
 * Payment System Health Check
 * Verifies all components needed for payment to work
 */

import supabase from '../src/lib/supabase.js';

console.log('🏥 PAYMENT SYSTEM HEALTH CHECK');
console.log('='.repeat(60));

async function checkHealth() {
  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };

  // 1. Check Environment Variables
  console.log('\n1️⃣ Checking Environment Variables...');
  const requiredEnvs = [
    'MIDTRANS_SERVER_KEY',
    'NEXT_PUBLIC_MIDTRANS_CLIENT_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  for (const env of requiredEnvs) {
    if (process.env[env]) {
      results.passed.push(`✅ ${env} exists`);
    } else {
      results.failed.push(`❌ ${env} missing`);
    }
  }

  // 2. Check Supabase Connection
  console.log('\n2️⃣ Checking Supabase Connection...');
  try {
    const { data, error } = await supabase.from('Product').select('id').limit(1);
    if (error) throw error;
    results.passed.push('✅ Supabase connected');
  } catch (error) {
    results.failed.push(`❌ Supabase connection failed: ${error.message}`);
  }

  // 3. Check atomic_decrement_stock function
  console.log('\n3️⃣ Checking atomic_decrement_stock function...');
  try {
    const { data, error } = await supabase.rpc('atomic_decrement_stock', {
      variant_id_param: 'test-id-that-does-not-exist',
      quantity_param: 1,
    });

    // Should return error "Variant not found" (which is expected)
    if (data && data[0] && data[0].message === 'Variant not found') {
      results.passed.push('✅ atomic_decrement_stock function exists');
    } else if (error && error.message.includes('does not exist')) {
      results.failed.push('❌ atomic_decrement_stock function NOT FOUND in database');
    } else {
      results.warnings.push('⚠️ atomic_decrement_stock function behavior unexpected');
    }
  } catch (error) {
    if (error.message.includes('does not exist')) {
      results.failed.push('❌ atomic_decrement_stock function NOT FOUND in database');
    } else {
      results.warnings.push(`⚠️ Function test error: ${error.message}`);
    }
  }

  // 4. Check Order & Transaction for test order
  console.log('\n4️⃣ Checking Test Order Data...');
  try {
    const { data: order, error } = await supabase
      .from('Order')
      .select('*, transaction:Transaction(*)')
      .eq('orderNumber', 'ORD-1770266710052-TOA7PG')
      .single();

    if (error && error.code === 'PGRST116') {
      results.warnings.push('⚠️ Test order not found (mungkin sudah dihapus)');
    } else if (error) {
      results.failed.push(`❌ Error querying order: ${error.message}`);
    } else {
      results.passed.push('✅ Test order found');
      console.log('   - Order Status:', order.status);
      console.log('   - Payment Status:', order.paymentStatus);
      console.log('   - Transaction Status:', order.transaction?.[0]?.transactionStatus || 'N/A');
    }
  } catch (error) {
    results.failed.push(`❌ Order check failed: ${error.message}`);
  }

  // 5. Check Webhook Endpoint
  console.log('\n5️⃣ Checking Webhook Endpoint...');
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/api/payment/notification`
      : 'https://motivcompany.vercel.app/api/payment/notification';

    const response = await fetch(webhookUrl, { method: 'GET' });
    const data = await response.json();

    if (response.ok && data.success) {
      results.passed.push('✅ Webhook endpoint accessible');
      console.log('   - URL:', webhookUrl);
    } else {
      results.failed.push('❌ Webhook endpoint not responding correctly');
    }
  } catch (error) {
    results.failed.push(`❌ Webhook endpoint check failed: ${error.message}`);
  }

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 HEALTH CHECK SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n✅ Passed (${results.passed.length}):`);
  results.passed.forEach((msg) => console.log('   ' + msg));

  if (results.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${results.warnings.length}):`);
    results.warnings.forEach((msg) => console.log('   ' + msg));
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed (${results.failed.length}):`);
    results.failed.forEach((msg) => console.log('   ' + msg));
  }

  console.log('\n' + '='.repeat(60));

  if (results.failed.length > 0) {
    console.log('❌ CRITICAL ISSUES FOUND! Payment system may not work.');
    process.exit(1);
  } else if (results.warnings.length > 0) {
    console.log('⚠️  Some warnings detected. Review them.');
    process.exit(0);
  } else {
    console.log('✅ All checks passed! Payment system should work.');
    process.exit(0);
  }
}

checkHealth();
