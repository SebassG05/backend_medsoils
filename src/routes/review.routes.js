import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware.js';
import { getAllReviews, createReview, deleteReview } from '../controller/review.controller.js';

const router = express.Router();

// public: list reviews
router.get('/', getAllReviews);

// create review (requires auth)
router.post('/', authenticate, createReview);

// delete review (owner or superadmin)
router.delete('/:id', authenticate, deleteReview);

export default router;
