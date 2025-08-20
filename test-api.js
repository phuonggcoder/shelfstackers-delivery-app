// Test API endpoints for userRouter.js
const API_BASE = 'https://server-shelf-stacker-w1ds.onrender.com';

async function testAPI() {
  console.log('🧪 Testing API endpoints for userRouter.js...\n');

  // Test 1: Health check
  try {
    const response = await fetch(API_BASE);
    console.log('✅ Health check:', response.status, response.statusText);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test 2: Auth endpoints
  console.log('\n🔐 Testing Auth Endpoints:');
  
  try {
    const response = await fetch(`${API_BASE}/auth`);
    console.log('✅ Auth base:', response.status, response.statusText);
  } catch (error) {
    console.log('❌ Auth base failed:', error.message);
  }

  // Test 3: Request OTP (POST)
  try {
    const response = await fetch(`${API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0962936927' })
    });
    console.log('✅ Request OTP:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📱 OTP Response:', data);
    } else {
      const errorText = await response.text();
      console.log('⚠️ OTP Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Request OTP failed:', error.message);
  }

  // Test 4: Google Auth Status
  try {
    const response = await fetch(`${API_BASE}/auth/google-auth-status`);
    console.log('✅ Google Auth Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🔧 Google Auth Status:', data.success ? 'Available' : 'Not Available');
    }
  } catch (error) {
    console.log('❌ Google Auth Status failed:', error.message);
  }

  // Test 5: Users endpoints
  console.log('\n👥 Testing Users Endpoints:');
  
  try {
    const response = await fetch(`${API_BASE}/api/users`);
    console.log('✅ Users base:', response.status, response.statusText);
  } catch (error) {
    console.log('❌ Users base failed:', error.message);
  }

  // Test 6: Register endpoint
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123456',
        full_name: 'Test User',
        phone_number: '0962936927'
      })
    });
    console.log('✅ Register endpoint:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🎉 Registration successful:', data.message);
    } else {
      const errorText = await response.text();
      console.log('⚠️ Registration Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Register failed:', error.message);
  }

  // Test 7: Shipper endpoints
  console.log('\n🚚 Testing Shipper Endpoints:');
  
  try {
    const response = await fetch(`${API_BASE}/api/shipper`);
    console.log('✅ Shipper base:', response.status, response.statusText);
  } catch (error) {
    console.log('❌ Shipper base failed:', error.message);
  }

  console.log('\n🎯 API testing completed!');
  console.log('\n📋 Summary:');
  console.log('- Auth endpoints: /auth/*');
  console.log('- User endpoints: /api/users/*');
  console.log('- Shipper endpoints: /api/shipper/*');
}

// Run test
testAPI();

