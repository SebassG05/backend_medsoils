import quizService from '../service/quiz.service.js';

class QuizController {
  /**
   * POST /api/v1/quiz/result
   * Authenticated — saves (or conditionally improves) the caller's best result.
   */
  async saveResult(req, res, next) {
    try {
      const { score, totalTime, alias } = req.body;
      const userId = req.user.userId;

      const data = await quizService.saveResult({ userId, score, totalTime, alias });

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
  /**
   * GET /api/v1/quiz/result/me
   * Authenticated — returns the caller's own result, or null.
   */
  async getMyResult(req, res, next) {
    try {
      const userId = req.user.userId;
      const data = await quizService.getMyResult(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/quiz/result
   * Authenticated — removes the caller's result from the leaderboard.
   */
  async deleteResult(req, res, next) {
    try {
      const userId = req.user.userId;
      const data = await quizService.deleteResult(userId);
      res.status(200).json({
        success: true,
        message: data.deleted ? 'Your record has been deleted.' : 'No record found.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new QuizController();
