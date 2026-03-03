import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const emails = [
  'penhaloza@gmail.com',
  'simone.priori@unitus.it',
  'ac.lorenzelli@timesis.it',
  'prueba@example.com',
];

const result = await mongoose.connection.collection('users').updateMany(
  { email: { $in: emails } },
  { $set: { mustResetPassword: null } }
);

console.log('Modified:', result.modifiedCount, '/', emails.length, 'accounts reset.');
await mongoose.disconnect();
