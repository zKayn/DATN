require('dotenv').config();
const mongoose = require('mongoose');

async function findUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({
      hoTen: String,
      email: String,
      vaiTro: String,
    }));

    const users = await User.find({}, 'hoTen email vaiTro').limit(10);

    console.log('📋 Users in database:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.hoTen} (${user.vaiTro})`);
    });

    console.log('\n💡 Use one of these emails to test forgot password');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findUsers();
