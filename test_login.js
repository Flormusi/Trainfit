// Test script to verify login functionality
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing login functionality...');
    
    const response = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'magagroca@gmail.com',
      password: 'magaroca'
    });
    
    console.log('✅ Login successful!');
    console.log('Response data:', response.data);
    
    if (response.data.token) {
      console.log('✅ Token received:', response.data.token.substring(0, 20) + '...');
    } else {
      console.log('❌ No token in response');
    }
    
    if (response.data.user) {
      console.log('✅ User data received:', {
        id: response.data.user.id,
        email: response.data.user.email,
        role: response.data.user.role
      });
    } else {
      console.log('❌ No user data in response');
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testLogin();
