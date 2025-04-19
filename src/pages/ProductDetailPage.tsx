import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Star, ShoppingCart, ChevronLeft } from 'lucide-react';
import { getProductById } from '@/services/productService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewList } from '@/components/ReviewList';
import { useWishlist } from '@/contexts/WishlistContext';
import { useReview } from '@/contexts/ReviewContext';
import { toast } from 'sonner';
import api from '@/services/api';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast: useToastToast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addToCart, removeFromCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Product ID is missing');
      }
      return getProductById(id);
    },
    enabled: !!id
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      useToastToast({
        title: "Authentication required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    
    if (!product) {
      useToastToast({
        title: "Error",
        description: "Product information not available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addToCart(product._id, quantity);
      toast.success('Product added to cart');
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      useToastToast({
        title: "Authentication required",
        description: "Please log in to update your wishlist",
        variant: "destructive",
      });
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    
    if (!product) {
      useToastToast({
        title: "Error",
        description: "Product information not available",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        toast.success('Product removed from wishlist');
      } else {
        await addToWishlist(product._id);
        toast.success('Product added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] pt-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/products')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
        </div>
      </div>
    );
  }
  
  const isDiscounted = product.discountedPrice && product.discountedPrice < product.price;
  const displayPrice = isDiscounted ? product.discountedPrice : product.price;
  const discount = isDiscounted ? Math.round((1 - product.discountedPrice / product.price) * 100) : 0;
  
  // Extract seller information
  const sellerName = typeof product.seller === 'object' && product.seller.name 
    ? product.seller.name 
    : 'Seller information unavailable';
  
  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/products')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1).map((image: string, index: number) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} ${index + 2}`}
                className="w-full h-24 object-cover rounded-lg cursor-pointer"
                onClick={() => {/* Handle image click */}}
              />
            ))}
          </div>
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-5 w-5 ${i < Math.round(product.averageRating) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.averageRating.toFixed(1)} ({product.ratings?.length || 0} reviews)
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">${displayPrice.toFixed(2)}</span>
              {isDiscounted && (
                <>
                  <span className="text-gray-500 line-through ml-2">${product.price.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium ml-2">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <p className="mb-4">
              <span className="font-semibold">Category:</span> {product.category}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Seller:</span> {sellerName}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Availability:</span> {" "}
              {product.stock > 0 ? (
                <span className="text-green-600">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </p>
          </div>
          
          {product.stock > 0 && (
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
                <select 
                  id="quantity" 
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="border rounded-md py-1.5 px-3"
                >
                  {[...Array(Math.min(10, product.stock))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              
              <Button 
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </div>
          )}
          
          <Separator className="my-6" />
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Product Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="mt-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Customer Reviews</h2>
                <Button onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </Button>
              </div>

              {showReviewForm && (
                <div className="mb-8">
                  <ReviewForm
                    productId={product._id}
                    onSuccess={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              <ReviewList productId={product._id} />
            </div>
          </TabsContent>

          <TabsContent value="shipping">
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-4">Shipping & Returns</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Shipping Information</h3>
                  <p className="text-gray-600">
                    Free shipping on orders over $50. Standard delivery within 3-5 business days.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Returns Policy</h3>
                  <p className="text-gray-600">
                    Easy returns within 30 days of purchase. Items must be unused and in original packaging.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetailPage;
