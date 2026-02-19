import mongoose from 'mongoose';

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,   // one personal-best record per user
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalTime: {
      type: Number,   // seconds, 1-decimal precision
      required: true,
      min: 0,
    },
    // When this best was achieved
    achievedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,   // createdAt / updatedAt
    versionKey: false,
  }
);

// Compound index used by the leaderboard query
quizResultSchema.index({ score: -1, totalTime: 1 });

export default mongoose.model('QuizResult', quizResultSchema);
