import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChatProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    discountedPrice?: number;
    images: string[];
    averageRating: number;
    stock: number;
    category: string;
    seller: string | { _id: string; name: string };
  };
  delay?: number;
}

const ChatProductCard = ({ product, delay = 0 }: ChatProductCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      navigate('/login', { state: { from: `/products/${product._id}` } });
      return;
    }

    const sellerId = typeof product.seller === 'object' ? product.seller._id : product.seller;
    
    addToCart({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
      sellerId: sellerId
    });

    toast.success('Added to cart');
  };

  const discount = product.discountedPrice && product.discountedPrice < product.price
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden my-4 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48 group">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {product.name}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/products/${product._id}`)}
            className="h-8 w-8"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-baseline mb-2">
          <span className="text-2xl font-bold text-gold">
            ${(product.discountedPrice || product.price).toFixed(2)}
          </span>
          {discount > 0 && (
            <span className="ml-2 text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {product.category}
        </p>

        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${
                i < Math.round(product.averageRating)
                  ? 'text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
            ({product.averageRating.toFixed(1)})
          </span>
        </div>

        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ChatProductCard; 