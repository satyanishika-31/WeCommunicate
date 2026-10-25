const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb+srv://WECommunicatE:WE12345@cluster0.vwoufqs.mongodb.net/test?appName=Cluster0');
  const res = await mongoose.connection.collection('users').updateOne(
    { email: /^inspect_/ },
    { $set: { isApproved: true, role: 'ADMIN' } }
  );
  console.log('Modified:', res.modifiedCount);
  await mongoose.disconnect();
}

main().catch(console.error);
