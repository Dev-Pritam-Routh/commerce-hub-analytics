import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X } from 'lucide-react';
import { Product } from '@/types';
import { Helmet } from 'react-helmet-async';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    document.title = 'My Wishlist - CommerceHub';
  }, []);

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (productId: string) => {
    addToCart(productId);
    toast.success('Product added to cart');
  };

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Helmet>
          <title>Wishlist - CommerceHub</title>
        </Helmet>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h2>
          <p className="text-slate-600">Explore our products and add your favorites to the wishlist!</p>
          <Link to="/products" className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <Helmet>
        <title>Wishlist - CommerceHub</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((product: Product) => (
          <div key={product._id} className="relative rounded-lg shadow-md overflow-hidden">
            <Link to={`/products/${product._id}`}>
              <img
                src={product.images[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-64 object-cover object-center"
              />
            </Link>
            <div className="p-4">
              <h3 className="font-medium text-lg mb-2 truncate">{product.name}</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-bold text-lg">${product.discountedPrice || product.price}</span>
                {product.discountedPrice && (
                  <span className="text-sm text-slate-500 line-through">${product.price}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <Button size="sm" onClick={() => handleAddToCart(product._id)}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={(e) => {
                e.preventDefault();
                handleRemoveFromWishlist(product._id);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
