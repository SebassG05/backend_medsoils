import quizService from '../service/quiz.service.js';

class QuizController {
  /**
   * POST /api/v1/quiz/result
   * Authenticated — saves (or conditionally improves) the caller's best result.
   */
  async saveResult(req, res, next) {
    try {
      const { score, totalTime } = req.body;
      const userId = req.user.userId;

      const data = await quizService.saveResult({ userId, score, totalTime });

      res.status(200).json({
        success: true,
        message: data.saved ? 'New personal best saved!' : 'Your previous record is still better.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/quiz/leaderboard?limit=5
   * Public — returns top N entries.
   */
  async getLeaderboard(req, res, next) {
    try {
      const limit   = Math.min(parseInt(req.query.limit ?? '5', 10), 20);
      const entries = await quizService.getLeaderboard(limit);

      res.status(200).json({
        success: true,
        data: entries,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new QuizController();
