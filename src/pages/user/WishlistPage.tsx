import React from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';

const WishlistPage: React.FC = () => {
  const { wishlist, isLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (product: any) => {
    try {
      // Fix the addToCart call by passing only the productId
      await addToCart(product.product._id);
      toast.success('Product added to cart');
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success('Product removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove product from wishlist');
    }
  };

  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      toast.success('Wishlist cleared');
    } catch (error) {
      toast.error('Failed to clear wishlist');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        {wishlist.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleClearWishlist}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear Wishlist
          </Button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start adding products to your wishlist to save them for later.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item: any) => (
            <Card key={item.product._id} className="overflow-hidden">
              <CardHeader className="p-0">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-48 object-cover"
                  onClick={() => navigate(`/products/${item.product._id}`)}
                />
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.product.name}</h3>
                <p className="text-2xl font-bold text-primary">
                  ${item.product.price.toFixed(2)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <Button
                  variant="outline"
                  onClick={() => handleRemoveFromWishlist(item.product._id)}
                >
                  <Heart className="h-4 w-4 mr-2" fill="currentColor" />
                  Remove
                </Button>
                <Button onClick={() => handleAddToCart(item)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
