import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChatProductCard from './ChatProductCard';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/services/productService';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ChatProductResponseProps {
  productIds: string[];
}

// Define the expected product structure
interface ProductData {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  averageRating: number;
  stock: number;
  category: string;
  seller: string | { _id: string; name: string };
  description?: string;
}

const ChatProductResponse = ({ productIds }: ChatProductResponseProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Filter out any invalid IDs before querying
  const validProductIds = Array.isArray(productIds) 
    ? productIds.filter(id => id && id.trim().length > 0)
    : [];

  // Skip query if no valid IDs
  const enabled = validProductIds.length > 0;

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['chatProducts', validProductIds],
    queryFn: async () => {
      console.log("Fetching products with IDs:", validProductIds);
      
      // Use Promise.allSettled to handle individual product fetch failures
      const productPromises = validProductIds.map(id => 
        getProductById(id)
          .catch(error => {
            console.error(`Failed to fetch product ${id}:`, error);
            return null;
          })
      );
      
      const results = await Promise.allSettled(productPromises);
      
      // Filter out rejected promises and null products
      const validProducts = results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<ProductData>).value);
      
      console.log("Successfully fetched products:", validProducts);
      return validProducts;
    },
    enabled,
    retry: 2, // Retry failed requests twice
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Don't render anything if no product IDs provided
  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // Handle errors or empty results
  if (isError || !products || products.length === 0) {
    return (
      <div className="text-center text-red-500 py-2">
        {isError ? "Failed to load product information" : "No products found"}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full"
    >
      {products.map((product) => (
        <ChatProductCard
          key={product._id}
          product={product}
          delay={0.1}
        />
      ))}
    </motion.div>
  );
};

export default ChatProductResponse;
