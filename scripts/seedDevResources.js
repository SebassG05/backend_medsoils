/**
 * seedDevResources.js
 * Fills a LOCAL development database with a few sample resources so the
 * /resources page has something to show.
 * Run with:  npm run seed:dev
 *
 * Safety: refuses to run unless MONGODB_URI points at localhost / 127.0.0.1.
 * It must never touch the Atlas (production) cluster.
 */

import 'dotenv/config'
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medsoils_dev'

function assertLocal(uri) {
  let host
  try {
    host = new URL(uri).hostname
  } catch {
    throw new Error(`Invalid MONGODB_URI: ${uri}`)
  }
  if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
    throw new Error(
      `Refusing to seed: MONGODB_URI host is "${host}". ` +
      'This script only runs against a local database.'
    )
  }
}

/* ─── inline schemas (same shape as src/models, avoids loader side effects) ─── */
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
))

const Resource = mongoose.models.Resource || mongoose.model('Resource', new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['video', 'pdf', 'image'], required: true },
    url: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    tag: { type: String, default: '' },
    duration: { type: String, default: '' },
    pages: { type: String, default: '' },
    count: { type: String, default: '' },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
))

const SAMPLES = [
  { title: 'Introduction to soil health', type: 'video', tag: 'Basics', duration: '12 min',
    url: 'https://example.com/dev/soil-health', description: 'Sample video for local development.' },
  { title: 'Mediterranean soils field guide', type: 'pdf', tag: 'Guide', pages: '24 pages',
    url: 'https://example.com/dev/field-guide.pdf', description: 'Sample PDF for local development.' },
  { title: 'Sampling campaign photos', type: 'image', tag: 'Fieldwork', count: '18 photos',
    url: 'https://example.com/dev/gallery', description: 'Sample image gallery for local development.' },
]

async function seed() {
  assertLocal(MONGO_URI)
  await mongoose.connect(MONGO_URI)
  console.log(`Connected to ${MONGO_URI}`)

  const owner = await User.findOneAndUpdate(
    { email: 'dev-seed@localhost' },
    { name: 'Dev seed', role: 'superadmin', isVerified: true, isActive: true },
    { upsert: true, returnDocument: 'after' }
  )

  for (const sample of SAMPLES) {
    await Resource.updateOne(
      { title: sample.title },
      { $setOnInsert: { ...sample, createdBy: owner._id } },
      { upsert: true }
    )
  }
  console.log(`Seeded ${SAMPLES.length} resources.`)
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error(err.message)
  process.exit(1)
})
