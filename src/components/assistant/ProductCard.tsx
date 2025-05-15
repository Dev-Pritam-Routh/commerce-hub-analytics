
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClick = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden my-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={handleClick}
    >
      <div className="relative h-48 group">
        <img 
          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {product.name}
          </h3>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
        </div>
        <p className="text-2xl font-bold text-gold mb-2">
          ₹{product.price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {product.category}
        </p>
        {/* Conditionally render description if available */}
        {product.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {product.description}
          </p>
        )}
        {/* Conditionally render rating if available */}
        {product.averageRating && (
          <div className="flex items-center mt-2">
            <span className="text-yellow-400">★</span>
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
              {product.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
