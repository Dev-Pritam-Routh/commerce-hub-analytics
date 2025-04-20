
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChatProductCard from './ChatProductCard';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/services/productService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ChatProductResponseProps {
  productIds: string | string[];
}

const ChatProductResponse = ({ productIds }: ChatProductResponseProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Convert single productId to array if needed
  const productIdArray = Array.isArray(productIds) ? productIds : [productIds];

  const { data: products, isLoading } = useQuery({
    queryKey: ['chatProducts', productIdArray],
    queryFn: async () => {
      const productPromises = productIdArray.map(id => getProductById(id));
      return Promise.all(productPromises);
    },
    enabled: productIdArray.length > 0
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
  );
};

export default ChatProductResponse;
