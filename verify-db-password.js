const bcrypt = require('bcryptjs');

// Password dari screenshot Supabase (tooltip yang terlihat)
const hashFromDB = '$2a$10$5W0XShrz2WvxSqTDHnS3c9.OIgmkc1KFq44quZ4NX45KsRF1Jc58XG';

// Password yang diketik user
const password1 = 'Motiv@Admin123';
const password2 = 'Admin@Motiv123';  // Alternative
const password3 = 'admin123';        // Old password

console.log('=== VERIFY PASSWORD FROM SUPABASE ===\n');

bcrypt.compare(password1, hashFromDB).then(result => {
  console.log(`Password: ${password1}`);
  console.log(`Match: ${result ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

bcrypt.compare(password2, hashFromDB).then(result => {
  console.log(`Password: ${password2}`);
  console.log(`Match: ${result ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

bcrypt.compare(password3, hashFromDB).then(result => {
  console.log(`Password: ${password3}`);
  console.log(`Match: ${result ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

// Also show what the hash should be for Motiv@Admin123
const correctHash = bcrypt.hashSync('Motiv@Admin123', 10);
console.log('=== CORRECT HASH ===');
console.log('For password: Motiv@Admin123');
console.log('Hash should be:', correctHash);
console.log('');
console.log('=== HASH IN DATABASE ===');
console.log('Hash in DB:', hashFromDB);
