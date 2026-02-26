import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: 'Anonymous' },
    email: { type: String, trim: true, default: '' },
    rating: { type: Number, required: true, min: 0, max: 5 },
    text: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ createdAt: -1 });

export default mongoose.model('Review', reviewSchema);
