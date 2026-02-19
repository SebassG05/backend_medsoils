import express from 'express';
import quizController from '../controller/quiz.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route  POST /api/v1/quiz/result
 * @desc   Save (or improve) authenticated user's quiz result
 * @access Private
 */
router.post('/result', authenticate, quizController.saveResult);

/**
 * @route  GET /api/v1/quiz/leaderboard
 * @desc   Get top N players (default 5, max 20)
 * @access Public
 */
router.get('/leaderboard', quizController.getLeaderboard);

export default router;
