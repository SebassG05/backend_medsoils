/**
 * seedSuperAdmin.js
 * Creates (or ensures) the superadmin account in the database.
 * Run with:  npm run seed:superadmin
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

/* ─── inline schema (avoids circular import issues in scripts) ─── */
const userSchema = new mongoose.Schema(
  {
    name:     { type: String },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role:     { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    googleId:   { type: String, unique: true, sparse: true },
    twoFactorEnabled: { type: Boolean, default: false },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
  },
  { timestamps: true }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

/* ─── config ─── */
const SUPERADMIN = {
  name:     'MEDSOILS Super Admin',
  email:    'medsoilschallenge@gmail.com',
  password: 'medsoiladmin123@',
  role:     'superadmin',
  isVerified: true,
  isActive:   true,
}

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medsoils'

/* ─── main ─── */
async function seed() {
  console.log('🔗  Connecting to MongoDB…')
  await mongoose.connect(MONGO_URI)
  console.log('✅  Connected.')

  const existing = await User.findOne({ email: SUPERADMIN.email })

  if (existing) {
    if (existing.role !== 'superadmin') {
      existing.role = 'superadmin'
      existing.isVerified = true
      await existing.save()
      console.log('🔄  Existing user promoted to superadmin.')
    } else {
      console.log('ℹ️   Superadmin already exists — nothing to do.')
    }
  } else {
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(SUPERADMIN.password, salt)

    await User.create({
      ...SUPERADMIN,
      password: hashedPassword,
    })
    console.log('🎉  Superadmin created successfully!')
    console.log(`    Email   : ${SUPERADMIN.email}`)
    console.log(`    Password: ${SUPERADMIN.password}`)
  }

  await mongoose.disconnect()
  console.log('🔌  Disconnected. Done.')
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message)
  process.exit(1)
})
