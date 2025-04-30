
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard3D: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [inWishlist, setInWishlist] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  useEffect(() => {
    setInWishlist(isInWishlist(product._id));
  }, [isInWishlist, product._id]);
  
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate rotation based on mouse position relative to center
      const rotateYValue = ((e.clientX - centerX) / (rect.width / 2)) * 5;
      const rotateXValue = ((e.clientY - centerY) / (rect.height / 2)) * -5;
      
      setRotateX(rotateXValue);
      setRotateY(rotateYValue);
    };
    
    const handleMouseLeave = () => {
      // Reset rotation when mouse leaves
      setRotateX(0);
      setRotateY(0);
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product._id);
      toast.success('Added to wishlist');
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a CartProduct object from the product
    const cartProduct = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.svg',
      quantity: 1,
      stock: product.stock,
      sellerId: typeof product.seller === 'string' ? product.seller : product.seller?._id
    };
    
    addToCart(cartProduct);
    toast.success('Added to cart');
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-300",
        className
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d'
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/products/${product._id}`} className="block">
        <div className="overflow-hidden aspect-square">
          <motion.img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500"
            style={{ transform: `translateZ(20px)` }}
          />
        </div>
        
        <div className="p-4 relative" style={{ transform: `translateZ(30px)` }}>
          <h3 className="font-medium text-lg mb-1 truncate">{product.name}</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-bold text-lg">
              ${product.discountedPrice || product.price}
            </span>
            {product.discountedPrice && (
              <span className="text-sm text-slate-500 line-through">
                ${product.price}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2" style={{ transform: `translateZ(40px)` }}>
        <Button
          size="icon"
          variant={inWishlist ? "destructive" : "secondary"}
          className="rounded-full w-9 h-9 opacity-90 hover:opacity-100"
          onClick={toggleWishlist}
        >
          <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
        </Button>
        
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full w-9 h-9 opacity-90 hover:opacity-100"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </div>
      
      {product.discountedPrice && (
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10" style={{ transform: `translateZ(40px)` }}>
          SALE
        </div>
      )}
    </motion.div>
  );
};

export default ProductCard3D;
