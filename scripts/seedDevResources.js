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

/*
 * Real content from the Adıyaman field trip (Day 1, 2 Nov 2026), hosted on
 * Cloudinary. Images are delivered resized (f_auto,q_auto,w_960); videos as
 * H.264 ≤ 1280 px, the same transformation the frontend gallery uses.
 */
const CLD = 'https://res.cloudinary.com/dktr2wcto'
const VIDEO_T = 'vc_h264,q_auto,w_1280,h_1280,c_limit'
const POSTER_T = 'so_1,f_auto,q_auto,w_960,c_limit'

const SAMPLES = [
  {
    title: 'Adıyaman field day: soil pit photos',
    type: 'image',
    tag: 'Fieldwork',
    count: '21 photos',
    url: '/resources/adiyaman/dia-1?show=photos',
    thumbnail: `${CLD}/image/upload/f_auto,q_auto,w_960,c_limit/v1794232530/PXL_20261102_073842703_akyoz3.jpg`,
    description: 'Day 1 of the visit to Adıyaman: opening a soil pit, describing its horizons and working through the results.',
  },
  {
    title: 'Opening the soil pit',
    type: 'video',
    tag: 'Fieldwork',
    duration: '0:16',
    url: `${CLD}/video/upload/${VIDEO_T}/v1794232549/PXL_20261102_073844611_httifl.mp4`,
    thumbnail: `${CLD}/video/upload/${POSTER_T}/v1794232549/PXL_20261102_073844611_httifl.jpg`,
    description: 'A backhoe digs the soil pit while the group looks on, Adıyaman, Day 1.',
  },
  {
    title: 'Describing soil horizons in the pit',
    type: 'video',
    tag: 'Fieldwork',
    duration: '0:09',
    url: `${CLD}/video/upload/${VIDEO_T}/v1794232541/PXL_20261102_083853245_qk2mhh.mp4`,
    thumbnail: `${CLD}/video/upload/${POSTER_T}/v1794232541/PXL_20261102_083853245_qk2mhh.jpg`,
    description: 'Students inside the pit examine the reddish-brown horizons, Adıyaman, Day 1.',
  },
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

  // Drop anything this script created earlier that is no longer in SAMPLES
  // (e.g. the old example.com placeholders). Other resources are untouched.
  const removed = await Resource.deleteMany({
    createdBy: owner._id,
    title: { $nin: SAMPLES.map(s => s.title) },
  })

  for (const sample of SAMPLES) {
    await Resource.updateOne(
      { title: sample.title },
      { $set: { ...sample, createdBy: owner._id } },
      { upsert: true }
    )
  }
  console.log(`Seeded ${SAMPLES.length} resources, removed ${removed.deletedCount} old ones.`)
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error(err.message)
  process.exit(1)
})
