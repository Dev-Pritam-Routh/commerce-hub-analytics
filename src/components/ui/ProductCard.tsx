
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    discountedPrice?: number;
    images: string[];
    averageRating: number;
    stock: number;
    sellerId: string;
  };
  className?: string;
}

const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
      sellerId: product.sellerId
    });
  };
  
  const discount = product.discountedPrice && product.discountedPrice < product.price
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;
  
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 w-full relative overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              imageLoaded ? "blur-0 scale-100" : "blur-sm scale-105"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {discount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-slate-900 dark:text-white truncate">{product.name}</h3>
          
          <div className="mt-2 flex items-center">
            {discount > 0 ? (
              <>
                <span className="text-primary font-bold">${product.discountedPrice?.toFixed(2)}</span>
                <span className="ml-2 text-slate-500 dark:text-slate-400 text-sm line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          <div className="mt-2 flex items-center text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.averageRating)
                      ? 'text-yellow-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1">({product.averageRating || 0})</span>
            </div>
            
            <span className="mx-2">•</span>
            <span>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
          </div>
        </div>
      </Link>
      
      <div className="px-4 pb-4">
        <Button 
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="w-full"
          variant={product.stock <= 0 ? "outline" : "default"}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
