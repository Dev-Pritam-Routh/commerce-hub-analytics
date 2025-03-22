import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Star, ShoppingCart, ChevronLeft } from 'lucide-react';
import { getProductById } from '@/services/productService';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  
  // Update the useQuery implementation
  // Update the useQuery implementation to properly handle the case when id is undefined
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Product ID is missing');
      }
      return getProductById(id);
    },
    enabled: !!id // This is the key fix - only run the query when id exists
  });

  
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    
    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart`,
    });
    
    // Logic to add to cart will be implemented with CartContext
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/products')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="bg-white rounded-lg overflow-hidden shadow-md">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {product.images.slice(1).map((image, index) => (
                <div key={index} className="bg-white rounded-md overflow-hidden shadow-sm cursor-pointer">
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 2}`} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          )}
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
              {product.averageRating.toFixed(1)} ({product.ratings.length} reviews)
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
              <span className="font-semibold">Seller:</span> {
                typeof product.seller === 'object' && product.seller.name 
                  ? product.seller.name 
                  : 'Seller information unavailable'
              }
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
      
      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        {product.ratings.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {product.ratings.map((rating, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">{rating.user.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(rating.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < rating.rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700">{rating.review}</p>
              </Card>
            ))}
          </div>
        )}
        
        {isAuthenticated ? (
          <div className="mt-8">
            <Button>Write a Review</Button>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-2">Please sign in to write a review</p>
            <Button onClick={() => navigate('/login', { state: { from: `/product/${id}` } })}>
              Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
