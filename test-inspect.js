const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb+srv://WECommunicatE:WE12345@cluster0.vwoufqs.mongodb.net/test?appName=Cluster0');
  const user = await mongoose.connection.collection('users').findOne({ email: 'admin@gmail.com' });
  console.log('admin user in test:', user);

  // Check all collections in test for anything referencing this user id
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const c of collections) {
    const docs = await mongoose.connection.collection(c.name).find({
      $or: [
        { author: user._id },
        { user: user._id },
        { userId: user._id },
        { raisedBy: user._id }
      ]
    }).toArray();
    if (docs.length > 0) {
      console.log(`Collection ${c.name} has ${docs.length} docs for admin`);
      docs.forEach(d => console.log('  ', d.title || d.description || d));
    }
  }
  await mongoose.disconnect();
}

main().catch(console.error);
