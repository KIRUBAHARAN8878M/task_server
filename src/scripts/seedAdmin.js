import 'dotenv/config.js';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

(async () => {
  try {
    await connectDB();
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name: 'Admin', email, password, role: 'admin' });
      console.log('Admin created:', email, 'password:', password);
    } else {
      user.role = 'admin';
      if (process.env.RESET_ADMIN_PASSWORD === '1') user.password = password;
      await user.save();
      console.log('Admin ensured:', email);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
