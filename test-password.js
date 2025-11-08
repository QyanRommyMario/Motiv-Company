const bcrypt = require('bcryptjs');

// Test password
const password = 'Motiv@Admin123';

// Generate new hash
const newHash = bcrypt.hashSync(password, 10);
console.log('=== GENERATE NEW HASH ===');
console.log('Password:', password);
console.log('New Hash:', newHash);
console.log('');

// Verify new hash
bcrypt.compare(password, newHash).then(result => {
  console.log('=== VERIFY NEW HASH ===');
  console.log('Match:', result);
  console.log('');
});

// Test old hash
const oldHash = '$2a$10$5W0XShrzWwv5qTDHnS3c9.OlgmkciKFq44quZ4NX45KsRF1Jc58XC';
bcrypt.compare(password, oldHash).then(result => {
  console.log('=== TEST OLD HASH ===');
  console.log('Old Hash:', oldHash);
  console.log('Match with Motiv@Admin123:', result);
});
