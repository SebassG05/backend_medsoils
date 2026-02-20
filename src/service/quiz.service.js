import QuizResult from '../models/QuizResult.js';
import User from '../models/User.js';
import { AppError } from '../utils/errors.js';

class QuizService {
  /**
   * Save (or improve) a user's quiz result.
   *
   * Rules:
   *  - No existing record  → create it.
   *  - New score > old score  → replace.
   *  - Same score + lower totalTime  → replace (faster is better).
   *  - Otherwise  → keep the existing record unchanged.
   *
   * @returns {{ rank: number, saved: boolean, result: object }}
   */
  async saveResult({ userId, score, totalTime, alias }) {
    if (score === undefined || totalTime === undefined) {
      throw new AppError('score and totalTime are required', 400);
    }

    const roundedTime = Math.round(totalTime * 10) / 10;

    // Use alias if it is exactly 3 alphanumeric characters, otherwise fall back to real name
    const isValidAlias = alias && /^[A-Za-z0-9]{3}$/.test(alias.trim());
    let name;
    if (isValidAlias) {
      name = alias.trim().toUpperCase();
    } else {
      const user = await User.findById(userId).select('name').lean();
      name = user?.name ?? 'Anonymous';
    }

    const existing = await QuizResult.findOne({ userId });

    let saved = false;

    if (!existing) {
      await QuizResult.create({ userId, name, score, totalTime: roundedTime, achievedAt: new Date() });
      saved = true;
    } else {
      const isBetter =
        score > existing.score ||
        (score === existing.score && roundedTime < existing.totalTime);

      if (isBetter) {
        existing.score      = score;
        existing.totalTime  = roundedTime;
        existing.achievedAt = new Date();
        saved = true;
      }

      // Always update the display name (alias or real name) regardless of score
      if (existing.name !== name) {
        existing.name = name;
      }

      await existing.save();
    }

    // Compute rank in global leaderboard
    const rank = await this.#getRank(userId);

    const result = await QuizResult.findOne({ userId }).lean();
    return { rank, saved, result };
  }

  /**
   * Return top N entries sorted by score DESC, totalTime ASC.
   */
  async getLeaderboard(limit = 5) {
    return QuizResult.find()
      .sort({ score: -1, totalTime: 1 })
      .limit(limit)
      .select('name score totalTime achievedAt')
      .lean();
  }

  /**
   * Delete the authenticated user's quiz result.
   * @returns {{ deleted: boolean }}
   */
  async deleteResult(userId) {
    const result = await QuizResult.findOneAndDelete({ userId });
    return { deleted: !!result };
  }

  /**
   * Return the authenticated user's own result, or null if none.
   */
  async getMyResult(userId) {
    const result = await QuizResult.findOne({ userId }).lean();
    return result ?? null;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  /**
   * 1-based rank of a user in the global leaderboard.
   * Count how many distinct users have a strictly better record.
   */
  async #getRank(userId) {
    const own = await QuizResult.findOne({ userId }).lean();
    if (!own) return null;

    const better = await QuizResult.countDocuments({
      $or: [
        { score: { $gt: own.score } },
        { score: own.score, totalTime: { $lt: own.totalTime } },
      ],
    });

    return better + 1;
  }
}

export default new QuizService();
