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
    navigate(`/products/${product.product_id}`);
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
          src={product.image_url} 
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
          ${product.price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {product.category}
        </p>
        {product.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {product.description}
          </p>
        )}
        {product.rating && (
          <div className="flex items-center mt-2">
            <span className="text-yellow-400">★</span>
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
              {product.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard; 