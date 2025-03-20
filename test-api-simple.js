import https from 'https';

const data = JSON.stringify({
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test1234!'
});

const options = {
  hostname: 'nginx-kny-moncada-master-g9t9j68wg-baraqsss-projects.vercel.app',
  port: 443,
  path: '/api/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', JSON.stringify(res.headers, null, 2));
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Raw response:', responseData);
    
    try {
      const parsedData = JSON.parse(responseData);
      console.log('JSON Response:', parsedData);
    } catch (e) {
      console.error('Error parsing response as JSON:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end(); 