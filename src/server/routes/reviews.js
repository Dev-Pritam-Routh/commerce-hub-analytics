import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  reportReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Get all reviews for a product
router.get('/product/:productId', getProductReviews);

// All routes below are protected
router.use(protect);

// Create a new review
router.post('/', createReview);

// Update a review
router.put('/:id', updateReview);

// Delete a review
router.delete('/:id', deleteReview);

// Mark a review as helpful
router.post('/:id/helpful', markReviewHelpful);

// Report a review
router.post('/:id/report', reportReview);

export default router; 