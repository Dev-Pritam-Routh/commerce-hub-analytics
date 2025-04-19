<<<<<<< Updated upstream
import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChatProductResponseProps {
  products: Product[];
  className?: string;
}

const ChatProductResponse = ({ products, className }: ChatProductResponseProps) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {products.map((product) => (
        <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col gap-2">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover rounded-md"
            />
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
        </Card>
      ))}
    </div>
=======
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChatProductCard from './ChatProductCard';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/services/productService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ChatProductResponseProps {
  productIds: string[];
}

const ChatProductResponse = ({ productIds }: ChatProductResponseProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const { data: products, isLoading } = useQuery({
    queryKey: ['chatProducts', productIds],
    queryFn: async () => {
      const productPromises = productIds.map(id => getProductById(id));
      return Promise.all(productPromises);
    },
    enabled: productIds.length > 0
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
    >
      {products.map((product, index) => (
        <ChatProductCard
          key={product._id}
          product={product}
          delay={index}
        />
      ))}
    </motion.div>
>>>>>>> Stashed changes
  );
};

export default ChatProductResponse; 