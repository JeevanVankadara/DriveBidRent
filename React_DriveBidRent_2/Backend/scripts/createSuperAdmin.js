// Backend/scripts/createSuperAdmin.js
//
// Creates (or resets) the superadmin account.
// Credentials are passed on the command line so they are never committed.
//
//   node scripts/createSuperAdmin.js --email=superadmin@drivebidrent.com --password='Drive@123'
//   node scripts/createSuperAdmin.js --email=... --password=... --first=Super --last=Admin --phone=9876543210
//
// If a user with that email already exists it is promoted to superadmin and the
// password is reset, so the script is safe to re-run.
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const arg = (name, fallback) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const email = (arg('email') || '').trim().toLowerCase();
const password = arg('password');
const firstName = arg('first', 'Super');
const lastName = arg('last', 'Admin');
const phone = arg('phone', '9999999999'); // required for local (non-Google) accounts

if (!email || !password) {
  console.error('Usage: node scripts/createSuperAdmin.js --email=<email> --password=<password>');
  process.exit(1);
}

// Same rule the profile page enforces on the client
const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
if (!/^\d{10}$/.test(phone)) {
  console.error('Phone must be exactly 10 digits');
  process.exit(1);
}

if (!strong.test(password)) {
  console.error('Password must be 8+ chars with an uppercase letter, a digit and one of @$!%*?&');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`\nDatabase: ${mongoose.connection.name}`);

  const existing = await User.findOne({ email });

  if (existing) {
    existing.userType = 'superadmin';
    if (!existing.phone) existing.phone = phone;
    existing.password = password; // re-hashed by the pre-save hook
    existing.isBlocked = false;
    await existing.save();
    console.log(`Updated existing user -> superadmin: ${email}`);
  } else {
    await User.create({
      firstName,
      lastName,
      email,
      phone,
      password, // hashed by the pre-save hook
      userType: 'superadmin',
      provider: 'local'
    });
    console.log(`Created superadmin: ${email}`);
  }

  const check = await User.findOne({ email }).select('email userType');
  console.log(`Verified: ${check.email} (${check.userType})`);
  console.log('Sign in at /login, you will be redirected to /superadmin\n');

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
