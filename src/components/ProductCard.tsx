import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  stock?: number;
  sellerId?: string;
  className?: string;
  delay?: number;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  rating,
  category,
  stock = 10,
  sellerId = '',
  className,
  delay = 0
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const animationDelay = {
    animationDelay: `${delay}ms`,
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items to your cart",
        variant: "destructive",
      });
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    
    if (!sellerId) {
      toast({
        title: "Error",
        description: "Seller information not available",
        variant: "destructive",
      });
      return;
    }
    
    addToCart({
      id: id,
      name: name,
      price: price,
      image: image,
      quantity: 1,
      stock: stock,
      sellerId: sellerId
    });
    
    toast({
      title: "Added to cart",
      description: "1 item added to your cart",
    });
  };

  return (
    <div 
      className={cn(
        "group relative rounded-2xl overflow-hidden glass-card animate-scale-in",
        className
      )}
      style={animationDelay}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square overflow-hidden relative">
        <Link to={`/products/${id}`}>
          <img
            src={image}
            alt={name}
            className={cn(
              "object-cover w-full h-full transition-transform duration-700 ease-out",
              isHovered ? "scale-110" : "scale-100"
            )}
            loading="lazy"
          />
        </Link>
        
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-900 dark:text-white">
            {category}
          </span>
        </div>
        
        <button 
          className={cn(
            "absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
            "transition-all duration-300",
            isFavorite 
              ? "text-red-500" 
              : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
          )}
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
        </button>
        
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent",
            "transform transition-transform duration-500 ease-out",
            isHovered ? "translate-y-0" : "translate-y-full"
          )}
        >
          <button 
            className="w-full py-3 px-4 rounded-lg bg-gold dark:bg-gold-light text-white dark:text-slate-900 font-medium flex items-center justify-center space-x-2 hover:bg-gold-dark dark:hover:bg-gold transition-colors duration-300"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link to={`/products/${id}`}>
            <h3 className="font-medium text-slate-900 dark:text-white truncate">{name}</h3>
          </Link>
          <span className="font-semibold text-gold-dark dark:text-gold-light">
            ${price.toFixed(2)}
          </span>
        </div>
        
        <div className="mt-2 flex items-center">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4", 
                  i < Math.floor(rating) 
                    ? "text-gold-dark dark:text-gold-light fill-current" 
                    : "text-slate-300 dark:text-slate-600"
                )}
              />
            ))}
          </div>
          <span className="ml-2 text-xs text-slate-600 dark:text-slate-400">
            ({rating.toFixed(1)})
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
