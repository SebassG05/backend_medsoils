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

/**
 * @route  GET /api/v1/quiz/result/me
 * @desc   Get authenticated user's own result
 * @access Private
 */
router.get('/result/me', authenticate, quizController.getMyResult);

/**
 * @route  DELETE /api/v1/quiz/result
 * @desc   Delete authenticated user's quiz result
 * @access Private
 */
router.delete('/result', authenticate, quizController.deleteResult);

export default router;
