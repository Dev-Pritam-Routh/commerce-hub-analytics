
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, removeFromWishlist } from '@/services/wishlistService';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

const WishlistPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading, isError, refetch } = useQuery<{ products: Product[] }>({
    queryKey: ['wishlist'],
    queryFn: () => getWishlist(),
    enabled: isAuthenticated && !!user,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      refetch();
    }
  }, [isAuthenticated, user, refetch]);

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFromWishlist(productId),
    onSuccess: () => {
      toast.success('Product removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove product from wishlist');
    },
  });

  const handleRemoveFromWishlist = (productId: string) => {
    removeMutation.mutate(productId);
  };

  const handleAddToCart = (product: Product) => {
    const sellerId = typeof product.seller === 'string' ? product.seller : product.seller._id;
    
    addToCart({
      id: product._id,
      quantity: 1,
      price: product.discountedPrice || product.price,
      name: product.name,
      image: product.images[0] || '/placeholder.svg',
      stock: product.stock,
      sellerId: sellerId
    });
    toast.success(`${product.name} added to cart`);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600">
            You need to be logged in to view your wishlist.
          </p>
          <Link to="/login" className="text-blue-500 hover:underline mt-2 block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !wishlist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Wishlist Not Found</h2>
          <p className="text-gray-600">
            Failed to load your wishlist. Please try again later.
          </p>
          <button 
            onClick={() => refetch()} 
            className="text-blue-500 hover:underline mt-2 block"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-600">
            Add products to your wishlist to see them here.
          </p>
          <Link to="/products" className="text-blue-500 hover:underline mt-2 block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Helmet>
        <title>Wishlist - CommerceHub</title>
        <meta name="description" content="Your Wishlist on CommerceHub" />
      </Helmet>
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Link to={`/products/${product._id}`}>
              <img
                src={product.images[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <Link to={`/products/${product._id}`} className="hover:underline">
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              </Link>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-xl">
                  ${product.discountedPrice || product.price}
                </span>
                {product.discountedPrice && (
                  <span className="text-gray-500 line-through">${product.price}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleAddToCart(product)} className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className="w-full"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
