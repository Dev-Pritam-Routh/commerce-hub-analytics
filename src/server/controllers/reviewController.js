import Review from '../models/review.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// Get all reviews for a product
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { sort = 'newest', filter = 'all' } = req.query;

  let query = { product: productId };

  // Apply rating filter if specified
  if (filter !== 'all') {
    query.rating = parseInt(filter);
  }

  // Apply sorting
  let sortOption = {};
  switch (sort) {
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'highest':
      sortOption = { rating: -1 };
      break;
    case 'lowest':
      sortOption = { rating: 1 };
      break;
    case 'helpful':
      sortOption = { helpfulVotes: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const reviews = await Review.find(query)
    .sort(sortOption)
    .populate('user', 'name avatar')
    .lean();

  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  // Count ratings
  const ratingCounts = {
    5: reviews.filter(review => review.rating === 5).length,
    4: reviews.filter(review => review.rating === 4).length,
    3: reviews.filter(review => review.rating === 3).length,
    2: reviews.filter(review => review.rating === 2).length,
    1: reviews.filter(review => review.rating === 1).length,
  };

  res.status(200).json({
    reviews,
    averageRating: averageRating.toFixed(1),
    totalReviews: reviews.length,
    ratingCounts
  });
});

// Create a new review
export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment, images } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }

  // Check if user has already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user._id,
    product: productId
  });

  if (existingReview) {
    throw new ErrorResponse('You have already reviewed this product', 400);
  }

  // Check if user has purchased the product
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'products.product': productId,
    status: 'delivered'
  });

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment,
    images,
    verifiedPurchase: !!hasPurchased
  });

  // Update product's average rating
  const reviews = await Review.find({ product: productId });
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, { averageRating });

  res.status(201).json(review);
});

// Update a review
export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment, images } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    throw new ErrorResponse('Review not found', 404);
  }

  // Check if user is the author of the review
  if (review.user.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('Not authorized to update this review', 403);
  }

  review.rating = rating;
  review.title = title;
  review.comment = comment;
  review.images = images;
  await review.save();

  // Update product's average rating
  const reviews = await Review.find({ product: review.product });
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(review.product, { averageRating });

  res.status(200).json(review);
});

// Delete a review
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw new ErrorResponse('Review not found', 404);
  }

  // Check if user is the author of the review
  if (review.user.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('Not authorized to delete this review', 403);
  }

  await review.remove();

  // Update product's average rating
  const reviews = await Review.find({ product: review.product });
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;
  await Product.findByIdAndUpdate(review.product, { averageRating });

  res.status(200).json({ message: 'Review deleted successfully' });
});

// Mark a review as helpful
export const markReviewHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw new ErrorResponse('Review not found', 404);
  }

  review.helpfulVotes += 1;
  await review.save();

  res.status(200).json({ message: 'Review marked as helpful' });
});

// Report a review
export const reportReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    throw new ErrorResponse('Review not found', 404);
  }

  // In a real application, you would want to store these reports in a separate collection
  // and implement a moderation system
  console.log(`Review ${id} reported for: ${reason}`);

  res.status(200).json({ message: 'Review reported successfully' });
}); 