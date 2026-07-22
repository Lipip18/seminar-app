require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const exists = await User.findOne({ email: 'admin@seminarhall.com' });
  if (exists) {
    console.log('Admin already exists');
    process.exit(0);
  }
  await User.create({
    name: 'Super Admin',
    email: 'admin@seminarhall.com',
    password: 'Admin@123',   // change after first login
    role: 'admin',
    department: 'Administration',
  });
  console.log('Admin created: admin@seminarhall.com / Admin@123');
  process.exit(0);
})();