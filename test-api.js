const fetch = require('node-fetch');

async function testRegistration() {
  try {
    const response = await fetch('https://nginx-kny-moncada-master-50g6dlmpa-baraqsss-projects.vercel.app/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test1234!'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegistration(); 