const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb+srv://WECommunicatE:WE12345@cluster0.vwoufqs.mongodb.net/test?appName=Cluster0');
  const user = await mongoose.connection.collection('users').findOne({ email: /^inspect_/ });
  console.log('Found user:', user.email);

  const loginRes = await fetch('https://wecommunicate.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: 'password123' })
  }).then(r => r.json());

  console.log('Login:', loginRes);

  if (loginRes.token) {
    const postsRes = await fetch('https://wecommunicate.onrender.com/api/posts', {
      headers: { Authorization: `Bearer ${loginRes.token}` }
    }).then(r => r.json());

    console.log('Posts count:', postsRes.posts?.length);
    console.log('Posts:', JSON.stringify(postsRes.posts, null, 2));
  }
  await mongoose.disconnect();
}

main().catch(console.error);
