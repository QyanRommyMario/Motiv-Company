/**
 * Manual Webhook Trigger for Testing
 * Simulates Midtrans notification callback
 * 
 * Usage: node scripts/manual-trigger-webhook.js
 */

const crypto = require('crypto');

// Configuration
const ORDER_NUMBER = 'ORD-1770266710052-TOA7PG';
const GROSS_AMOUNT = '967500'; // Total dari order
const STATUS_CODE = '200';
const TRANSACTION_STATUS = 'settlement'; // settlement = sukses bayar
const FRAUD_STATUS = 'accept';
const PAYMENT_TYPE = 'bank_transfer';

// Configuration - Midtrans Sandbox Credentials
const SERVER_KEY = 'SB-Mid-server-WcccSpmvIemTb3UMknSd6r5b';
const WEBHOOK_URL = 'https://motivcompany.vercel.app/api/payment/notification';

// Generate Midtrans signature
function generateSignature(orderId, statusCode, grossAmount, serverKey) {
  const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash('sha512').update(signatureString).digest('hex');
}

// Create Midtrans notification payload
const payload = {
  order_id: ORDER_NUMBER,
  status_code: STATUS_CODE,
  gross_amount: GROSS_AMOUNT,
  transaction_status: TRANSACTION_STATUS,
  fraud_status: FRAUD_STATUS,
  payment_type: PAYMENT_TYPE,
  transaction_time: new Date().toISOString(),
  settlement_time: new Date().toISOString(),
  signature_key: generateSignature(ORDER_NUMBER, STATUS_CODE, GROSS_AMOUNT, SERVER_KEY),
};

// Add VA number jika bank transfer
if (PAYMENT_TYPE === 'bank_transfer') {
  payload.va_numbers = [{
    bank: 'bca',
    va_number: '12345678901234567890'
  }];
}

console.log('🚀 MANUAL WEBHOOK TRIGGER');
console.log('='.repeat(50));
console.log('📍 Webhook URL:', WEBHOOK_URL);
console.log('📦 Order Number:', ORDER_NUMBER);
console.log('💰 Amount:', GROSS_AMOUNT);
console.log('📊 Status:', TRANSACTION_STATUS);
console.log('🔑 Signature Key:', payload.signature_key.substring(0, 20) + '...');
console.log('='.repeat(50));
console.log('\n📤 Sending payload...\n');

// Send to webhook
fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
  .then(async (response) => {
    const data = await response.json();
    console.log('✅ Response Status:', response.status);
    console.log('📥 Response Body:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Webhook berhasil dipanggil!');
      console.log('📋 Sekarang cek:');
      console.log('   1. Status order di database (harusnya PAID & PROCESSING)');
      console.log('   2. Stok variant (harusnya berkurang dari 22 ke 7)');
      console.log('   3. Transaction data (harusnya updated)');
    } else {
      console.error('\n❌ Webhook gagal!');
      console.error('Error:', data);
    }
  })
  .catch((error) => {
    console.error('\n❌ FETCH ERROR:', error.message);
    console.error('Stack:', error.stack);
  });
