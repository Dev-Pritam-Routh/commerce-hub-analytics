import Wishlist from '../models/wishlist.js';
import Product from '../models/product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// Get user's wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products.product', 'name price images');

  if (!wishlist) {
    return res.status(200).json({ products: [] });
  }

  res.status(200).json(wishlist);
});

// Add product to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    // Create new wishlist if it doesn't exist
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [{ product: productId }]
    });
  } else {
    // Check if product is already in wishlist
    const existingProduct = wishlist.products.find(
      item => item.product.toString() === productId
    );

    if (existingProduct) {
      throw new ErrorResponse('Product already in wishlist', 400);
    }

    // Add product to wishlist
    wishlist.products.push({ product: productId });
    await wishlist.save();
  }

  res.status(200).json(wishlist);
});

// Remove product from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    throw new ErrorResponse('Wishlist not found', 404);
  }

  // Remove product from wishlist
  wishlist.products = wishlist.products.filter(
    item => item.product.toString() !== productId
  );

  await wishlist.save();
  res.status(200).json(wishlist);
});

// Clear entire wishlist
export const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    throw new ErrorResponse('Wishlist not found', 404);
  }

  wishlist.products = [];
  await wishlist.save();

  res.status(200).json({ message: 'Wishlist cleared successfully' });
}); 