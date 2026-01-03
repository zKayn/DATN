require('dotenv').config();

console.log('=== Environment Variables Check ===\n');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? `${process.env.EMAIL_PASSWORD.substring(0, 4)}...${process.env.EMAIL_PASSWORD.substring(12)}` : 'NOT SET');
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log('\n=== Expected ===');
console.log('EMAIL_PASSWORD should be: rjddblzbgsubigtq (16 chars)');
console.log('\n=== Status ===');

if (!process.env.EMAIL_PASSWORD) {
  console.log('❌ EMAIL_PASSWORD is NOT set!');
  process.exit(1);
} else if (process.env.EMAIL_PASSWORD.length !== 16) {
  console.log(`❌ EMAIL_PASSWORD has wrong length: ${process.env.EMAIL_PASSWORD.length} (expected 16)`);
  process.exit(1);
} else {
  console.log('✅ EMAIL_PASSWORD is set correctly!');
  process.exit(0);
}
