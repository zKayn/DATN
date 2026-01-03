const fetch = require('node-fetch');

async function testForgotPassword() {
  console.log('🔧 Testing Forgot Password API...\n');

  try {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nphiti1503@gmail.com'
      })
    });

    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ Forgot password API works!');
      console.log('Check your inbox: nphiti1503@gmail.com');
      if (data.resetUrl) {
        console.log('\n🔗 Reset URL (dev mode):', data.resetUrl);
      }
    } else {
      console.log('\n❌ API returned error:', data.message);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testForgotPassword();
